export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  // 認証が必要ないページ
  const publicPages = ['/login', '/register-username', '/confirm'];
  if (publicPages.includes(to.path)) {
    // /register-usernameの場合はログイン状態だけチェック
    if (to.path === '/register-username' && !user.value) {
      return navigateTo('/login');
    }
    
    // /confirmページは認証処理を待つためスキップ
    if (to.path === '/confirm') {
      return;
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
      .maybeSingle();

    // ユーザーレコードが存在しない、またはユーザー名が未設定の場合
    if (error || !userData?.username) {
      return navigateTo('/register-username');
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    return navigateTo('/register-username');
  }
});
