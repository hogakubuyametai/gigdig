export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  // SSRとCSRの両方で実行
  const { data: authUser } = await useAsyncData(
    `auth-${to.path}`,
    async () => {
      if (!user.value) return null;

      const { data, error } = await client
        .from('users')
        .select('username')
        .eq('user_id', user.value.id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      server: true,
      lazy: true // コンポーネントのマウント前に実行
    }
  );

  // 認証状態に基づくリダイレクト
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  if (user.value) {
    if (!authUser.value?.username && to.path !== '/register-username') {
      return navigateTo('/register-username');
    }
    if (authUser.value?.username && 
       (to.path === '/login' || to.path === '/confirm' || to.path === '/register-username')) {
      return navigateTo('/');
    }
  }
});
