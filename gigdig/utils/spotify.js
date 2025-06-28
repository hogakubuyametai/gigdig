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
    // console.error(
    //   "アクセストークンの取得に失敗しました (クライアントサイド):",
    //   {
    //     message: error.message,
    //     status: error.response?.status,
    //     data: error.response?.data,
    //   }
    // );
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

    // console.log("APIレスポンス: ", response); //レスポンス内容をログに出力

    if (!response.artists?.items) {
      throw new Error("予期しないレスポンス形式です。artists.items が見つかりません。");
    }

    return response.artists.items;
  } catch (error) {
    // console.error("アーティストの検索に失敗しました:", {
    //   message: error.message,
    //   status: error.response?.status,
    //   data: error.response?.data,
    // });
    throw new Error("アーティストの検索に失敗しました。再試行してください。");
  }
};

export const getArtistDetails = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}`;
  try {
    const response = await requestWithAuth(url);
    return response;
  } catch (error) {
    // console.error("アーティストの詳細取得に失敗しました:", {
    //   message: error.message,
    //   status: error.response?.status,
    //   data: error.response?.data,
    // });
    throw new Error("アーティストの詳細取得に失敗しました。再試行してください。");
  }
}

export const getArtistTopTracks = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
  console.log("トップトラックAPI呼び出し（比較用）:", { artistId, url }); // デバッグ用
  try {
    const response = await requestWithAuth(url);
    console.log("トップトラックAPIレスポンス:", response); // デバッグ用
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

export const getRelatedArtists = async (artistId) => {
  if (!artistId) {
    console.error("artistId is missing");
    throw new Error("アーティストIDが必要です");
  }

  const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
  console.log("関連アーティストAPI呼び出し:", {
    artistId,
    url
  });
  
  try {
    // まずアクセストークンを確認
    const token = await fetchAccessToken();
    console.log("使用するアクセストークン:", token ? "取得済み" : "なし");
    
    const response = await requestWithAuth(url);
    console.log("関連アーティストAPIレスポンス:", {
      status: "success",
      responseType: typeof response,
      hasArtists: !!response.artists,
      artistsLength: response.artists?.length || 0,
      firstArtist: response.artists?.[0]?.name || "none",
      response: response
    });
    
    if (!response.artists || !Array.isArray(response.artists)) {
      console.warn("関連アーティストのレスポンス形式が予期しないものです:", response);
      return [];
    }
    
    // 関連アーティストが0件の場合もログ出力
    if (response.artists.length === 0) {
      console.warn("関連アーティストが0件でした:", artistId);
    }
    
    return response.artists;
  } catch (error) {
    console.error("関連アーティストの取得に失敗しました:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      artistId: artistId,
      url: url,
      fullError: error
    });
    throw new Error(`関連アーティストの取得に失敗しました: ${error.message}`);
  }
};

// テスト用: アーティストの基本情報を取得してAPI接続確認
export const testArtistAPI = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}`;
  console.log("アーティスト詳細API（テスト）呼び出し:", {
    artistId,
    url
  });
  
  try {
    const response = await requestWithAuth(url);
    console.log("アーティスト詳細API（テスト）レスポンス:", {
      status: "success",
      name: response.name,
      id: response.id,
      followers: response.followers?.total,
      genres: response.genres
    });
    return response;
  } catch (error) {
    console.error("アーティスト詳細API（テスト）エラー:", error);
    throw error;
  }
};
