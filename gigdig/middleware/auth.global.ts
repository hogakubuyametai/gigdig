export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  // 認証が必要ないページ
  const publicPages = ['/login', '/register-username'];
  if (publicPages.includes(to.path)) {
    // /register-usernameの場合はログイン状態だけチェック
    if (to.path === '/register-username' && !user.value) {
      return navigateTo('/login');
    }
    return;
  }

  // ユーザーがログインしていない場合
  if (!user.value) {
    return navigateTo('/login');
  }

  // ユーザー名の確認
  try {
    const { data: userData, error } = await client
      .from('users')
      .select('username')
      .eq('user_id', user.value.id)
      .single();

    // ユーザーレコードが存在しない、またはユーザー名が未設定の場合
    if (error || !userData?.username) {
      return navigateTo('/register-username');
    }
    
    // ユーザー名が設定済みで、確認ページにいる場合はホームへ
    if (to.path === '/confirm') {
      return navigateTo('/');
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    return navigateTo('/register-username');
  }
});
