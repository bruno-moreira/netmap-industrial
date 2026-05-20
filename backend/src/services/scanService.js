const { logger } = require('../config/logger');

/**
 * Stub para descoberta SNMP/LLDP (Fase 3 do roadmap).
 * Retorna estrutura simulada para integração futura.
 */
async function scanNetwork() {
  logger.info('Scan de rede solicitado (stub — SNMP não configurado)');
  return {
    status: 'stub',
    message: 'Descoberta automática será implementada na Fase 3 (SNMP/LLDP)',
    discovered: [],
  };
}

async function scanSwitch(switchId) {
  logger.info({ switchId }, 'Scan de switch solicitado (stub)');
  return {
    status: 'stub',
    switch_id: switchId,
    message: 'Scan SNMP do switch será implementado na Fase 3',
    ports: [],
  };
}

module.exports = { scanNetwork, scanSwitch };
