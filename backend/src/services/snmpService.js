import snmp from 'net-snmp';
import { logger } from '../config/logger.js';

/**
 * Função utilitária para buscar todos os itens de uma subárvore OID via SNMP.
 */
function walkSubtree(session, oid) {
  return new Promise((resolve, reject) => {
    const results = {};
    const maxRepetitions = 20;

    function feedCb(varbinds) {
      for (let i = 0; i < varbinds.length; i++) {
        if (snmp.isVarbindError(varbinds[i])) {
          logger.warn(`SNMP Varbind error: ${snmp.varbindError(varbinds[i])}`);
        } else {
          // Extrai o índice do OID retornado, removendo o prefixo base
          const returnedOid = varbinds[i].oid;
          const index = returnedOid.substring(oid.length + 1);
          
          let value = varbinds[i].value;
          if (Buffer.isBuffer(value)) {
            value = value.toString('utf8');
          }
          results[index] = value;
        }
      }
    }

    session.subtree(oid, maxRepetitions, feedCb, (error) => {
      if (error) {
        // Se for um erro de timeout ou outro erro grave, rejeitamos
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Conecta a um switch via SNMP e descobre suas portas e as respectivas VLANs (PVID).
 * Baseado no template Zabbix HPE Instant On 1930 / Aruba.
 * 
 * OIDs:
 * - 1.3.6.1.2.1.2.2.1.2 (ifDescr): Retorna o nome da porta associado ao SNMPIndex
 * - 1.3.6.1.2.1.17.7.1.4.5.1.1 (dot1qPvid): Retorna o PVID associado ao SNMPIndex
 * 
 * @param {string} target IP do switch
 * @param {string} community Comunidade SNMP v2c
 * @returns {Promise<Array>} Array de objetos com { portIndex, portName, vlan, vlanName }
 */
export async function discoverSwitchVlans(target, community) {
  return new Promise((resolve, reject) => {
    logger.info(`Iniciando descoberta SNMP para ${target}`);
    
    // Configura a sessão SNMP (v2c, timeout 5s, retries 1)
    const options = {
      port: 161,
      retries: 1,
      timeout: 5000,
      transport: "udp4",
      trapPort: 162,
      version: snmp.Version2c
    };

    const session = snmp.createSession(target, community, options);

    const IF_DESCR_OID = '1.3.6.1.2.1.2.2.1.2';
    const DOT1Q_PVID_OID = '1.3.6.1.2.1.17.7.1.4.5.1.1';
    const DOT1Q_VLAN_NAME_OID = '1.3.6.1.2.1.17.7.1.4.3.1.1';

    Promise.all([
      walkSubtree(session, IF_DESCR_OID),
      walkSubtree(session, DOT1Q_PVID_OID),
      walkSubtree(session, DOT1Q_VLAN_NAME_OID)
    ]).then(([interfaces, pvids, vlanNames]) => {
      session.close();

      const discovered = [];

      // Cruzando os dados baseados no SNMPIndex
      for (const index in interfaces) {
        // Ignora interfaces virtuais ou lógicas (muitas vezes os switches HPE/Aruba retornam VLANs como interfaces e tem index muito alto)
        // Mas para simplificar, incluímos todas as que tenham um PVID mapeado.
        const portName = interfaces[index];
        const pvid = pvids[index];

        if (pvid !== undefined) {
          const vlanNum = parseInt(pvid, 10);
          discovered.push({
            portIndex: parseInt(index, 10),
            portName: portName,
            vlan: vlanNum,
            vlanName: vlanNames[vlanNum] || null
          });
        }
      }

      // Ordenar pelo portIndex numérico
      discovered.sort((a, b) => a.portIndex - b.portIndex);

      resolve(discovered);
    }).catch(err => {
      session.close();
      logger.error(`Erro na descoberta SNMP para ${target}: ${err.message}`);
      reject(err);
    });
  });
}

export default { discoverSwitchVlans };
