export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  if (import.meta.client) {
    if (!user.value) {
      if (to.path !== '/login') {
        return navigateTo('/login', { replace: true });
      }
      return;
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('username')
        .eq('user_id', user.value.id)
        .single();

      if (error) {
        console.error('Error fetching user name:', error);
        return navigateTo('/error');
      }

      // ログイン済みでユーザー名も登録済みの場合
      if (data?.username) {
        if (to.path === '/login' || to.path === '/confirm' || to.path === '/register-username') {
          return navigateTo('/', { replace: true, redirectCode: 301 });
        }
        return;
      }

      // ユーザー名が未登録の場合
      if (!data?.username && to.path !== '/register-username') {
        return navigateTo('/register-username', { replace: true });
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      return navigateTo('/error');
    }
  }
});
