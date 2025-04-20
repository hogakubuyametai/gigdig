import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

export default defineEventHandler(async () => {
  try {
    const response = await $fetch('https://accounts.spotify.com/api/token', { 
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'client_credentials',
      }),
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