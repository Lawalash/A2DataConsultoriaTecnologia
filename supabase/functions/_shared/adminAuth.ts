import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireMasterAdmin(req: Request): Promise<{
  adminClient: SupabaseClient;
  user: User;
}> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new AdminAuthError('Ambiente Supabase não configurado na Edge Function.', 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new AdminAuthError('Token de autenticação ausente.', 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AdminAuthError('Token de autenticação vazio.', 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    throw new AdminAuthError('Sessão inválida ou expirada.', 401);
  }

  const user = userData.user;
  const email = (user.email ?? '').trim().toLowerCase();
  const isConfirmed = Boolean(user.email_confirmed_at);

  const { data: adminRows, error: adminErr } = await adminClient
    .from('a2_admin_users')
    .select('id, user_id, email, is_active')
    .eq('is_active', true);

  if (adminErr) {
    throw new AdminAuthError('Falha ao validar permissões administrativas.', 500);
  }

  const matched = (adminRows ?? []).find((row) => {
    if (row.user_id && row.user_id === user.id) return true;
    if (isConfirmed && email && String(row.email ?? '').trim().toLowerCase() === email) return true;
    return false;
  });

  if (!matched) {
    throw new AdminAuthError('Acesso restrito ao Admin Master da A2 Data.', 403);
  }

  // Vincular user_id automaticamente no primeiro acesso confirmado
  if (!matched.user_id) {
    await adminClient
      .from('a2_admin_users')
      .update({ user_id: user.id })
      .eq('id', matched.id);
  }

  return { adminClient, user };
}
