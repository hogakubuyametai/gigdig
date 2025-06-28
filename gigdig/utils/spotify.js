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

  console.log("関連アーティスト取得開始 - Client Credentials Flowでは利用できない可能性があります");
  
  // まずアーティストの詳細を取得してジャンル情報を得る
  try {
    const artistDetails = await getArtistDetails(artistId);
    console.log("アーティスト詳細取得成功:", {
      name: artistDetails.name,
      genres: artistDetails.genres
    });
    
    // ジャンルベースで類似アーティストを検索する代替手法
    if (artistDetails.genres && artistDetails.genres.length > 0) {
      const genre = artistDetails.genres[0]; // 最初のジャンルを使用
      console.log("ジャンルベース検索実行:", genre);
      
      const searchResults = await searchArtists(`genre:${genre}`);
      
      // 検索結果から元のアーティストを除外し、最大10件を返す
      const relatedArtists = searchResults
        .filter(artist => artist.id !== artistId)
        .slice(0, 10);
      
      console.log("代替関連アーティスト取得成功:", {
        count: relatedArtists.length,
        artists: relatedArtists.map(a => a.name)
      });
      
      return relatedArtists;
    }
  } catch (error) {
    console.error("代替手法でも関連アーティスト取得に失敗:", error);
  }
  
  // 全て失敗した場合は空配列を返す
  console.warn("関連アーティストの取得に失敗しました - 空配列を返します");
  return [];
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
