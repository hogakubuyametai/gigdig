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

  const url = `https://api.spotify.com/v1/recommendations?seed_artists=${artistId}&limit=20`;
  console.log("Recommendations API呼び出し:", {
    artistId,
    url
  });
  
  try {
    // アクセストークンを確認
    const token = await fetchAccessToken();
    console.log("使用するアクセストークン（Recommendations）:", token ? "取得済み" : "なし");
    
    const response = await requestWithAuth(url);
    console.log("Recommendations APIレスポンス:", {
      status: "success",
      responseType: typeof response,
      hasTracks: !!response.tracks,
      tracksLength: response.tracks?.length || 0,
      response: response
    });
    
    if (!response.tracks || !Array.isArray(response.tracks)) {
      console.warn("Recommendationsのレスポンス形式が予期しないものです:", response);
      return [];
    }
    
    // トラックからアーティスト情報を抽出
    const artistsMap = new Map();
    
    response.tracks.forEach(track => {
      if (track.artists && Array.isArray(track.artists)) {
        track.artists.forEach(artist => {
          // 元のアーティストを除外
          if (artist.id !== artistId && !artistsMap.has(artist.id)) {
            artistsMap.set(artist.id, {
              id: artist.id,
              name: artist.name,
              images: artist.images || [],
              external_urls: artist.external_urls,
              followers: artist.followers,
              genres: artist.genres || [],
              href: artist.href,
              popularity: artist.popularity,
              type: artist.type,
              uri: artist.uri
            });
          }
        });
      }
    });
    
    const relatedArtists = Array.from(artistsMap.values()).slice(0, 10);
    
    console.log("抽出した関連アーティスト:", {
      count: relatedArtists.length,
      artists: relatedArtists.map(a => a.name)
    });
    
    if (relatedArtists.length === 0) {
      console.warn("推薦から関連アーティストが0件でした:", artistId);
    }
    
    return relatedArtists;
  } catch (error) {
    console.error("Recommendations APIの取得に失敗しました:", {
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
