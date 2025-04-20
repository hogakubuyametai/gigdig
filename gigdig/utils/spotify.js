import axios from 'axios';

const getAccessToken = async () => {
  try {
    const response = await axios.get('/api/auth/spotify');
    return response.data.access_token;
  } catch (error) {
    console.error('アクセストークンの取得に失敗しました (クライアントサイド):', error);
    throw error;
  }
};

export const searchArtists = async (query) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.artists.items;
  } catch (error) {
    console.error('アーティストの検索に失敗しました:', error);
    throw error;
  }
};

export const getArtistTopTracks = async (artistId) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=JP`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.tracks;
  } catch (error) {
    console.error('トップトラックの取得に失敗しました:', error);
    throw error;
  }
};