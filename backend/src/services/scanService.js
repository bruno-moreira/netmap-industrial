import { logger } from '../config/logger.js';
import switchModel from '../model/switchModel.js';
import portModel from '../model/portModel.js';
import vlanModel from '../model/vlanModel.js';
import { discoverSwitchVlans } from './snmpService.js';
import { HttpError } from '../utils/HttpError.js';

/**
 * Stub para descoberta SNMP/LLDP de toda a rede (Fase 3).
 */
async function scanNetwork() {
  logger.info('Scan de rede solicitado (stub — SNMP não configurado totalmente)');
  return {
    status: 'stub',
    message: 'Descoberta automática completa será implementada na Fase 3',
    discovered: [],
  };
}

/**
 * Faz o scan SNMP das portas e VLANs (PVID) de um switch específico.
 */
async function scanSwitch(switchId, tenantId, applyToDb = false, userId = null) {
  logger.info({ switchId, applyToDb }, 'Scan de switch solicitado');
  
  // 1. Obter detalhes do switch
  const sw = await switchModel.findById(switchId, tenantId);
  if (!sw) throw new HttpError(404, 'Switch não encontrado');
  
  if (!sw.ip_address) {
    throw new HttpError(400, 'Switch não possui IP configurado para descoberta');
  }
  if ((!sw.snmp_version || sw.snmp_version === 'v2c' || sw.snmp_version === 'v1') && !sw.snmp_community) {
    throw new HttpError(400, 'Switch não possui comunidade SNMP configurada para descoberta');
  }

  // 2. Chamar o serviço SNMP
  let discoveredPorts;
  try {
    discoveredPorts = await discoverSwitchVlans(sw.ip_address, sw);
  } catch (error) {
    logger.error(`Falha no SNMP para o switch ${sw.ip_address}: ${error.message}`);
    throw new HttpError(500, `Falha de comunicação SNMP: ${error.message}`);
  }

  // 3. Buscar todas as VLANs do tenant para cruzar pelo vlan_number
  const allVlans = await vlanModel.findAll(tenantId);
  const vlanMap = new Map(); // vlan_number -> objeto vlan
  allVlans.forEach(v => vlanMap.set(v.vlan_number, v));

  // Enriquecer descoberta com as cores do banco (se já existir)
  for (const dp of discoveredPorts) {
    const dbVlan = vlanMap.get(dp.vlan);
    if (dbVlan) {
      dp.vlanColor = dbVlan.color;
    }
  }

  // 4. (Opcional) Sincronizar no banco
  let appliedCount = 0;
  if (applyToDb) {
    // Buscar portas atuais do switch
    const currentPorts = await portModel.findBySwitchId(switchId, tenantId);
    
    // Array de cores agradáveis para novas VLANs
    const randomColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    for (const dp of discoveredPorts) {
      const match = dp.portName.match(/(\d+)$/);
      if (match) {
        const portNum = parseInt(match[1], 10);
        const dbPort = currentPorts.find(p => p.port_number === portNum);
        
        if (dbPort) {
          let vlanId = vlanMap.get(dp.vlan)?.id;
          
          if (!vlanId && dp.vlan > 0 && dp.vlan <= 4094) {
            const vName = dp.vlanName ? dp.vlanName.trim() : `VLAN ${dp.vlan} (Auto)`;
            const newColor = randomColors[Math.floor(Math.random() * randomColors.length)];
            
            const newVlan = await vlanModel.create({
              vlan_number: dp.vlan,
              name: vName,
              color: newColor
            }, tenantId, userId || 1);
            
            vlanId = newVlan.id;
            vlanMap.set(dp.vlan, newVlan);
            dp.vlanColor = newColor; // atualiza o payload de retorno
          }

          if (vlanId && dbPort.untagged_vlan_id !== vlanId) {
            await portModel.update(dbPort.id, {
              untagged_vlan_id: vlanId
            }, tenantId, userId || 1);
            
            await portModel.addHistory(dbPort.id, 'snmp_sync', 
              { untagged_vlan_id: dbPort.untagged_vlan_id }, 
              { untagged_vlan_id: vlanId }
            );
            
            appliedCount++;
          }
        }
      }
    }
  }

  return {
    status: 'success',
    switch_id: switchId,
    message: applyToDb ? `Scan SNMP finalizado. ${appliedCount} portas atualizadas.` : 'Scan SNMP finalizado com sucesso.',
    applied: applyToDb,
    ports: discoveredPorts, // [{portIndex, portName, vlan}]
  };
}

export { scanNetwork, scanSwitch };
export default { scanNetwork, scanSwitch };
