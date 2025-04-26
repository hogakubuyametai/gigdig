export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const basic = Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString('base64');
  
  try {
    const body = new URLSearchParams({grant_type: 'client_credentials'});

    const response = await $fetch('https://accounts.spotify.com/api/token', { 
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    return {
      access_token: response.access_token,
    };
  } catch (error) {
    console.error('アクセストークン取得エラー (サーバーサイド):', error);
    console.error('エラーオブジェクト:', error); // デバッグ用に追加
    throw createError({
      statusCode: 500,
      statusMessage: 'Spotify APIからのアクセストークン取得に失敗しました',
    });
  }
});