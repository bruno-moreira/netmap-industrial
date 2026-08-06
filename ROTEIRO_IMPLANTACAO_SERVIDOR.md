# 🚀 Guia Prático de Implantação no Servidor — NetMap Industrial

Este guia descreve o método mais simples e robusto para implantar e manter o **NetMap Industrial** em qualquer servidor Linux (Ubuntu/Debian/CentOS).

---

## ⚡ 1. Implantação Automatizada em 1 Comando

Na máquina/servidor de destino, clone o repositório e execute o script automatizado:

```bash
git clone <URL_DO_REPOSITORIO> netmap-industrial
cd netmap-industrial
./deploy.sh
```

### O que o script `./deploy.sh` faz automaticamente:
1. Cria o arquivo de ambiente `.env` se ainda não existir.
2. Compila as imagens Docker do **Frontend**, **Backend API** e **Banco PostgreSQL 16**.
3. Inicia todos os serviços em segundo plano (`docker compose up -d`).
4. Aplica as migrações de schema e cria o usuário administrador inicial (`admin@empresa-exemplo.com`).

---

## 🛡️ 2. Inicialização Automática no Boot do Servidor

Todos os serviços Docker possuem a política `restart: unless-stopped`. Isso significa que:
- Se o servidor for reiniciado ou desligado por falta de energia, o NetMap Industrial voltará a rodar **automaticamente** assim que o sistema operacional subir.

Para checar o status a qualquer momento no servidor:
```bash
docker compose ps
```

Para ver os logs em tempo real:
```bash
docker compose logs -f
```

---

## 💾 3. Backup Automatizado do Banco de Dados (PostgreSQL)

Para garantir a segurança dos dados cadastrados (switches, impressoras, câmeras NVDs), você pode configurar um backup diário no `cron` do Linux.

### Criar script de backup (`backup_db.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/netmap"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

docker exec netmap-db pg_dump -U postgres netmap | gzip > "$BACKUP_DIR/netmap_db_$TIMESTAMP.sql.gz"

# Mantém apenas os últimos 30 dias de backup
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

### Adicionar no Cron (Executar diariamente às 03:00):
```bash
crontab -e
```
Adicione a linha:
```cron
0 3 * * * /bin/bash /caminho/para/netmap-industrial/backup_db.sh
```

---

## 🔄 4. Como Atualizar o Sistema no Servidor (Deploy de Novas Versões)

Quando houver atualizações no código:

```bash
cd netmap-industrial
git pull
./deploy.sh
```

Pronto! A aplicação será atualizada sem perda de dados.
