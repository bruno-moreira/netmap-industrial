# Roteiro de Refatoração: API de Mapeamento de Rede

## 1. Contexto do Projeto

O sistema é uma **API em Node.js com Express e PostgreSQL** para **mapear e gerenciar a infraestrutura de rede** de uma organização — não é mais um visualizador/monitor de água potável.

### Domínio

Inventário e topologia de ativos de rede, incluindo:

| Tipo | Descrição |
|------|-----------|
| **Switch** | Equipamentos de comutação (camada 2/3) |
| **AP** | Access points Wi‑Fi |
| **Impressora** | Impressoras de rede |
| **Relógio de ponto** | Terminais de ponto em rede |
| **Catraca** | Controle de acesso físico |
| **Antena de ramal** | Antenas/extensões de telefonia (PABX/ramais) |

Cada ativo deve poder ser cadastrado, consultado, atualizado e associado a informações de rede (IP, MAC, VLAN, localização, status, vínculos entre equipamentos).

### Arquitetura alvo

- **Padrão:** MVC em camadas — Route → Controller → Service → Model
- **Rotas:** `src/routes/` por recurso (ex.: `deviceRoutes.js`, `topologyRoutes.js`)
- **Regras de negócio:** `src/services/` (validação de tipos de dispositivo, consistência de topologia, etc.)
- **Persistência:** PostgreSQL com tabelas normalizadas (não mais tabela `water` com sensores)
- **Documentação:** Swagger/OpenAPI isolado em `src/config/swagger.js`
- **Dependências principais:** express, pg, dotenv, swagger-ui-express (+ validação, logs e segurança conforme fases abaixo)

### Modelo de dados (esboço)

```text
device_types     # switch, ap, printer, time_clock, turnstile, extension_antenna
devices          # ativo de rede (tipo, nome, ip, mac, vlan, local, status, metadados JSON)
device_links     # conexão entre dispositivos (ex.: impressora → switch → uplink)
sites / floors   # opcional: localização física (prédio, andar, sala)
```

Adapte nomes e colunas conforme levantamento de requisitos; o importante é **separar tipo de equipamento do registro concreto** e permitir **relacionamentos de topologia**.

---

## 2. Instruções de Refatoração

**Instrução:** Atue como Desenvolvedor Sênior e implemente/refatore o código priorizando segurança, escalabilidade e performance, **substituindo todo legado de domínio `water`** por o domínio de rede descrito acima.

### Fase 1: Arquitetura e Configuração

- **Validação de ambiente:** `src/config/env.js` com Zod ou envalid (variáveis de `.env_example`: `DB_*`, `PORT`, etc.).
- **Swagger isolado:** mover `swaggerDefinition` de `index.js` para `src/config/swagger.js`, documentando recursos de dispositivos e topologia.
- **Segurança:** `helmet` + `express-rate-limit` em rotas de escrita (`POST`/`PUT`/`PATCH`).

### Fase 2: Banco de Dados e Confiabilidade

- **Pool PostgreSQL** para reaproveitamento de conexões.
- **Queries parametrizadas** em todos os models (`$1`, `$2`, …).
- **Migrações versionadas** (Knex ou Prisma) em vez de `bd.sql` manual — criar schema de `devices`, `device_types`, `device_links`.
- **Índices:** em colunas de busca frequente (`ip`, `mac`, `type_id`, `site_id`, `updated_at`).

### Fase 3: Lógica de Negócio e Validação

- **Validação de input** (middleware ou schema):
  - `type` ∈ tipos permitidos do domínio
  - `ip` formato IPv4/IPv6 válido (quando informado)
  - `mac` formato válido (quando informado)
  - metadados específicos por tipo (ex.: SSID para AP, modelo de impressora)
- **Tratamento de erros global:** `errorHandler` centralizado; respostas JSON padronizadas.
- **Logger estruturado:** Pino ou Winston (substituir `console.log`).

### Fase 4: API de Mapeamento (domínio)

Endpoints sugeridos (prefixo `/api`):

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/devices` | Listar/filtrar por tipo, site, status |
| `GET` | `/devices/:id` | Detalhe de um ativo |
| `POST` | `/devices` | Cadastrar ativo |
| `PUT` | `/devices/:id` | Atualizar ativo |
| `DELETE` | `/devices/:id` | Remover (ou soft delete) |
| `GET` | `/topology` | Grafo ou lista de vínculos entre dispositivos |
| `POST` | `/topology/links` | Criar vínculo (origem → destino, porta, etc.) |

Regras de negócio exemplares:

- Não permitir vínculo circular inválido sem validação explícita.
- Validar unicidade de IP/MAC na rede quando aplicável.
- Status operacional: `online`, `offline`, `unknown`, `maintenance`.

### Fase 5: Performance (opcional)

- Avaliar **Fastify** se o volume de leitura de topologia crescer.
- Cache de listagens pesadas (Redis) apenas se necessário após medição.

---

## 3. Checklist Sênior

Ao final, o projeto deve conter:

- [ ] Dockerfile da aplicação (não só do banco)
- [ ] Migrações Knex/Prisma com schema de rede (sem referências a `water`)
- [ ] Unit tests em services (validação de IP/MAC, tipos de dispositivo, regras de topologia)
- [ ] Testes de integração HTTP nas rotas principais
- [ ] Graceful shutdown (SIGTERM → fechar pool do PostgreSQL)
- [ ] ESLint e Prettier no `package.json`
- [ ] Separação Route / Controller / Service / Model
- [ ] OpenAPI atualizado com exemplos por tipo de equipamento
- [ ] Remoção completa de arquivos e nomes legados (`waterRoutes`, `waterService`, `wlevel`, etc.)

---

## 4. Referência de arquitetura

Para padrões de pastas, dependências, testes e deploy, seguir **`ROTEIRO_REPLICACAO.md`**, adaptando o mapeamento:

| Legado (api_water) | Este projeto (api_network) |
|--------------------|----------------------------|
| `water` | `devices` |
| `wlevel`, `pump`, `state` | `ip`, `mac`, `vlan`, `status`, `metadata` |
| `decodeStateBits` | validação por `device_type` + regras de topologia |
| sensores / telemetria | inventário e mapeamento de ativos de rede |
