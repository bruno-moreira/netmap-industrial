# NetMap Industrial — Frontend

Interface React do MVP conforme `front.md`.

## Stack

- React 18 + Vite + TypeScript
- TailwindCSS
- React Router, TanStack Query, Zustand
- Axios, Zod, React Hook Form, Lucide React

## Desenvolvimento

```bash
npm install
npm run dev
```

API em http://localhost:3002 (proxy Vite em `/api`).

## Rotas

| Rota | Tela |
|------|------|
| `/login` | Login (MVP local) |
| `/dashboard` | Cards e resumo |
| `/switches` | Lista de switches |
| `/switches/:id` | Mapa visual de portas |
| `/devices` | Equipamentos + cadastro |
| `/vlans` | VLANs + cadastro |
| `/settings` | Configurações |

## Login MVP

Qualquer e-mail/senha. E-mail contendo `admin` → perfil administrador.
