const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NetMap Industrial API',
      version: '1.0.0',
      description:
        'API para mapeamento de rede industrial: switches, portas, VLANs e equipamentos.',
    },
    servers: [{ url: '/api', description: 'API base' }],
    tags: [
      { name: 'Dashboard', description: 'Estatísticas gerais' },
      { name: 'Switches', description: 'Switches e mapa de portas' },
      { name: 'Ports', description: 'Portas individuais' },
      { name: 'VLANs', description: 'VLANs da rede' },
      { name: 'Devices', description: 'Equipamentos conectados' },
      { name: 'Scan', description: 'Descoberta de rede (stub)' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
