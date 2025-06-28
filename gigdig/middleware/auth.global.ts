export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  // 認証が必要ないページ
  const publicPages = ['/login', '/confirm'];
  if (publicPages.includes(to.path)) {
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
      .maybeSingle() as { data: { username: string } | null, error: any };

    // /register-usernameページの場合の特別な処理
    if (to.path === '/register-username') {
      // ユーザー名が既に設定されている場合はホームにリダイレクト
      if (!error && userData?.username) {
        return navigateTo('/');
      }
      // ユーザー名が未設定の場合はページ表示を許可
      return;
    }

    // その他のページの場合：ユーザーレコードが存在しない、またはユーザー名が未設定の場合
    if (error || !userData?.username) {
      return navigateTo('/register-username');
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    return navigateTo('/register-username');
  }
});
