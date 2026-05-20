# NetMap Industrial
## Sistema Web de Mapeamento de Rede Industrial

---

# 1. Visão Geral

## Objetivo

Desenvolver uma plataforma web para monitoramento e mapeamento físico/lógico da infraestrutura de rede de uma indústria, permitindo visualizar switches, portas, VLANs e equipamentos conectados em tempo real.

O sistema deverá permitir que o usuário clique em uma porta específica do switch e visualize:

- VLAN configurada
- Equipamento conectado
- Status da porta
- IP do dispositivo
- MAC Address
- Localização física
- Histórico de alterações

Além disso, o sistema deverá utilizar cores para representar:

- Status da porta
- Tipo do equipamento
- VLAN configurada
- Problemas de conectividade

---

# 2. Objetivos do Sistema

## Objetivo Geral

Criar uma solução centralizada para gerenciamento visual e inteligente da rede industrial.

## Objetivos Específicos

- Mapear switches e portas automaticamente
- Identificar equipamentos conectados
- Consultar VLANs por porta
- Exibir status em tempo real
- Criar histórico de conexões
- Facilitar troubleshooting da rede
- Reduzir tempo de diagnóstico
- Organizar infraestrutura física e lógica

---

# 3. Equipamentos Suportados

O sistema deverá suportar:

- PCs
- Impressoras
- Relógios de ponto
- Câmeras IP
- DVR/NVR
- Catracas
- Access Points
- Telefones IP
- Servidores
- Switches
- Roteadores

---

# 4. Tecnologias do Projeto

## Backend

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- SNMP

## Frontend

- React
- TypeScript
- TailwindCSS
- React Flow
- Axios
- Zustand

## Infraestrutura

- Docker
- Docker Compose
- Nginx
- PM2

---

# 5. Arquitetura do Sistema

```text
Frontend React
      ↓
API Gateway
      ↓
Backend Node.js
      ↓
PostgreSQL
      ↓
Serviço SNMP
      ↓
Switches e Equipamentos


6. Funcionalidades Principais
6.1 Dashboard Geral

Exibir:

Total de switches
Total de portas
Portas ocupadas
Portas livres
Equipamentos online
Equipamentos offline
VLANs existentes
6.2 Mapa Visual do Switch

Cada switch deverá possuir representação visual:

SW-ADM-01

[01] [02] [03] [04]
[05] [06] [07] [08]
[09] [10] [11] [12]
6.3 Informações da Porta

Ao clicar em uma porta:

Porta: 12
Status: Online
VLAN: 30
Equipamento: Impressora
IP: 192.168.30.10
MAC: AA:BB:CC:DD:EE:FF
Localização: Administrativo
7. Sistema de Cores
Situação	Cor
Porta livre	Cinza
Porta conectada	Verde
Porta com erro	Vermelho
VLAN Administração	Azul
VLAN CFTV	Roxo
VLAN Impressoras	Verde claro
VLAN Catracas	Laranja
Porta trunk	Preto
8. Banco de Dados
Tabelas Principais
users
id
name
email
password
role
created_at
switches
id
name
ip_address
brand
model
rack_id
snmp_community
created_at
switch_ports
id
switch_id
port_number
status
vlan_id
mac_address
connected_device_id
is_trunk
updated_at
vlans
id
vlan_number
name
color
devices
id
name
type
ip_address
mac_address
location
status
device_types
id
name
icon
color
9. API REST
Switches
GET /switches
GET /switches/:id
POST /switches
PUT /switches/:id
DELETE /switches/:id
Portas
GET /ports/:id
PUT /ports/:id
VLANs
GET /vlans
POST /vlans
Equipamentos
GET /devices
POST /devices
Scanner
POST /scan/network
POST /scan/switch/:id
10. Descoberta Automática
Utilização de SNMP

O sistema deverá utilizar SNMP para:

Identificar portas ativas
Consultar MAC Address
Identificar VLANs
Ler status da interface
Identificar velocidade da porta
Utilização de LLDP

O sistema poderá utilizar LLDP para:

Descobrir equipamentos vizinhos
Identificar uplinks
Mapear conexões automaticamente
11. Funcionalidades Futuras
Integração com Zabbix
Integração com Grafana
Alertas em tempo real
Mapa físico da empresa
Monitoramento de banda
Descoberta automática de topologia
Sistema de permissões
Auditoria completa
Exportação PDF/Excel
12. Estrutura do Projeto
netmap-industrial/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   └── docker/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── docs/
│
└── docker-compose.yml
13. Roadmap de Desenvolvimento
Fase 1
Estrutura backend
Banco de dados
API básica
Cadastro de switches
Fase 2
Frontend dashboard
Mapa visual do switch
Sistema de cores
Fase 3
Integração SNMP
Descoberta automática
Consulta de VLAN
Fase 4
Atualização em tempo real
Histórico
Alertas
Fase 5
Relatórios
Permissões
Integrações externas
14. Nome do Projeto
NetMap Industrial
Sistema Inteligente de Mapeamento de Rede Industrial
15. Considerações Finais

O sistema NetMap Industrial visa facilitar o gerenciamento da infraestrutura de rede em ambientes industriais através de uma plataforma visual, interativa e inteligente.

A solução permitirá reduzir o tempo de troubleshooting, melhorar a organização da rede e fornecer uma visão centralizada da infraestrutura física e lógica da empresa.

# 16. Estratégia de MVP

Inicialmente, o NetMap Industrial será desenvolvido como um MVP, focado nos equipamentos mais importantes e nos switches principais da indústria.

O objetivo desta primeira versão é validar a utilidade da solução em um ambiente real, avaliando se o sistema facilita o mapeamento da rede, reduz o tempo de identificação de equipamentos conectados e melhora o controle das portas dos switches.

## Escopo Inicial do MVP

O MVP deverá contemplar:

- Cadastro dos switches principais
- Cadastro manual das portas dos switches
- Cadastro dos equipamentos-chave
- Associação entre porta, VLAN e equipamento
- Visualização gráfica das portas
- Cores por status e VLAN
- Tela de detalhes da porta
- Consulta rápida por equipamento, IP ou MAC Address

## Equipamentos Prioritários

Nesta primeira etapa, serão considerados os seguintes equipamentos:

- PCs administrativos e operacionais
- Impressoras
- Relógios de ponto
- Câmeras IP
- DVR/NVR
- Catracas
- Access Points

## Critérios de Avaliação

A adoção definitiva do sistema dependerá da avaliação dos seguintes pontos:

- Facilidade de uso
- Clareza na visualização das portas
- Precisão das informações cadastradas
- Redução do tempo de diagnóstico
- Utilidade para a equipe de TI
- Possibilidade de expansão para toda a rede

## Evolução Após Validação

Caso o MVP seja bem avaliado, o sistema poderá evoluir para:

- Integração com SNMP
- Descoberta automática de equipamentos
- Integração com Zabbix
- Alertas em tempo real
- Relatórios gerenciais
- Mapeamento completo da rede industrial