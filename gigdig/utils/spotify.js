let accessToken = null;

const fetchAccessToken = async () => {
  if (accessToken) {
    return accessToken;
  }
  try {
    const response = await $fetch("/api/auth/spotify");
    accessToken = response.access_token;
    return accessToken;
  } catch (error) {
    console.error(
      "アクセストークンの取得に失敗しました (クライアントサイド):",
      {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }
    );
    throw error;
  }
};

const requestWithAuth = async (url, options = {}) => {
  try {
    const token = await fetchAccessToken();
    return await $fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // アクセストークンが無効であれば、再取得してリトライ
    if (error.response?.status === 401) {
      // 401: Unauthorized
      console.warn("アクセストークンが無効です。再取得してリトライします。");
      accessToken = null; // 一旦無効にする
      const newAccessToken = await fetchAccessToken();
      return await $fetch(url, {
      ...options,
        headers: {
        ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }
    throw error;
  }
};

export const searchArtists = async (query) => {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`;
  try {
    const response = await requestWithAuth(url);

    console.log("APIレスポンス: ", response); //レスポンス内容をログに出力

    if (!response.artists?.items) {
      throw new Error("予期しないレスポンス形式です。artists.items が見つかりません。");
    }

    return response.artists.items;
  } catch (error) {
    console.error("アーティストの検索に失敗しました:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error("アーティストの検索に失敗しました。再試行してください。");
  }
};

export const getArtistDetails = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}`;
  try {
    const response = await requestWithAuth(url);
    return response;
  } catch (error) {
    console.error("アーティストの詳細取得に失敗しました:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error("アーティストの詳細取得に失敗しました。再試行してください。");
  }
}

export const getArtistTopTracks = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;
  try {
    const response = await requestWithAuth(url);
    return response.tracks;
  } catch (error) {
    console.error("トップトラックの取得に失敗しました:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error("トップトラックの取得に失敗しました。再試行してください。");
  }
};
