# Guia de Deploy — Cockpit Central A2 Data (`A2DATASITE`)

Este guia lista na ordem exata os comandos CLI para publicar o banco de dados, Secrets e Edge Functions do Cockpit `/admin` no projeto Supabase **`A2DATASITE`** (`poosjrfdtcszcmxmptuq`).

> **Regra de Segurança:** Nunca coloque `service_role_key` ou `EVOLUTION_API_KEY` em arquivos `.env` do frontend React (`REACT_APP_*` / `VITE_*`). Todas as chaves remotas ficam exclusivamente nos **Secrets** do Supabase `A2DATASITE`.

---

## 1. Autenticar no Supabase CLI e vincular o projeto `A2DATASITE`

```powershell
cd C:\Users\User\Documents\Github\A2DataConsultoriaTecnologia
supabase login
supabase link --project-ref poosjrfdtcszcmxmptuq
```

---

## 2. Aplicar as Migrations SQL (`a2_*` + RLS Master + Seed inicial)

```powershell
supabase db push
```

Isso criará as tabelas:
- `public.a2_admin_users` (com `lvtlawalash1@gmail.com` como Admin Master)
- `public.a2_projects` (7 projetos iniciais pré-cadastrados)
- `public.a2_clients` (clientes iniciais e valores de mensalidade)
- `public.a2_improvements` (Esteira Kanban)
- `public.a2_billing_logs` (auditoria de cobranças e bloqueios)
- `public.a2_billing_templates` (templates `D-3`, `Vencimento` e `Bloqueio`)

> **Importante:** Certifique-se de que o usuário `lvtlawalash1@gmail.com` existe em **Authentication → Users** no Supabase `A2DATASITE` com e-mail confirmado.

---

## 3. Configurar os Secrets no Supabase `A2DATASITE`

Substitua os placeholders `<...>` pelas chaves `service_role` reais de cada projeto e pelos dados da sua instância Evolution API acessível pela internet (HTTPS).

```powershell
# Chaves service_role dos projetos remotos monitorados
supabase secrets set `
  PROJECT_KEY_QBOM="<SERVICE_ROLE_KEY_QBOM_kgsyxhogqgkofiadybxm>" `
  PROJECT_KEY_ILPI="<SERVICE_ROLE_KEY_ILPI_vnbvqlwqoifruuirsjpk>" `
  PROJECT_KEY_VITORIA_NAILS="<SERVICE_ROLE_KEY_VITORIA_fdzuzvliomxklfggholo>" `
  PROJECT_KEY_ALVES_BARBER="<SERVICE_ROLE_KEY_ALVES_huazpxlaxvujqdoikpnb>" `
  PROJECT_KEY_RV_ACAITERIA="<SERVICE_ROLE_KEY_RV_iwnuqdgkpmekaameklrb>"

# Evolution API v2 (precisa ser URL HTTPS pública acessível pelas Edge Functions)
supabase secrets set `
  EVOLUTION_API_URL="https://sua-evolution-api.seudominio.com" `
  EVOLUTION_API_KEY="<SUA_EVOLUTION_API_KEY>" `
  EVOLUTION_INSTANCE_NAME="<NOME_DA_INSTANCIA_WHATSAPP>"
```

*(Nota: se a sua Evolution API hoje roda em `localhost:8080` ou `localhost:8081`, exponha-a via HTTPS com Cloudflare Tunnel / VPS antes de configurar `EVOLUTION_API_URL`.)*

---

## 4. Fazer Deploy das Edge Functions

```powershell
supabase functions deploy admin-project-bridge
supabase functions deploy admin-billing-notify
```

---

## 5. Ativar o Bloqueio Remoto nos 5 Projetos Clientes (Quando Desejar)

Execute o SQL do arquivo [`supabase/docs/remote_system_access_control.sql`](supabase/docs/remote_system_access_control.sql) no SQL Editor (ou como migration) de cada projeto Supabase cliente:

1. **Q BOM Gelo & Brasa** (`kgsyxhogqgkofiadybxm`)
2. **ILPI A2 DataPoint** (`vnbvqlwqoifruuirsjpk`)
3. **Vitória Nails** (`fdzuzvliomxklfggholo`)
4. **Alves Barber Club** (`huazpxlaxvujqdoikpnb`)
5. **RV Açaíteria** (`iwnuqdgkpmekaameklrb`)

Enquanto a tabela `system_access_control` ainda não existir em um projeto cliente, o Cockpit exibirá o status **`Sem tabela remota`** (`degraded`) no health check sem quebrar a operação.
