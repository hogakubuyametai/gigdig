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

    if (!response.artists?.items) {
      throw new Error("予期しないレスポンス形式です。artists.items が見つかりません。");
    }

    return response.artists.items;
  } catch (error) {
    throw new Error("アーティストの検索に失敗しました。再試行してください。");
  }
};

export const getArtistDetails = async (artistId) => {
  const url = `https://api.spotify.com/v1/artists/${artistId}`;
  try {
    const response = await requestWithAuth(url);
    return response;
  } catch (error) {
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

  try {
    // アーティスト詳細を取得してジャンル情報を得る
    const artistDetails = await getArtistDetails(artistId);
    console.log("アーティスト詳細取得:", {
      name: artistDetails.name,
      genres: artistDetails.genres,
      popularity: artistDetails.popularity
    });

    let relatedArtists = [];

    // 戦略1: 全ジャンル個別検索（最優先）
    if (artistDetails.genres && artistDetails.genres.length > 0) {
      console.log("全ジャンル個別検索実行:", {
        allGenres: artistDetails.genres,
        originalPopularity: artistDetails.popularity
      });

      // 各ジャンルを1つずつ検索
      for (const genre of artistDetails.genres) {
        const genreQuery = `genre:"${genre}"`;
        
        console.log(`ジャンル検索実行: ${genre}`, {
          query: genreQuery
        });
        
        const genreSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genreQuery)}&type=artist&limit=30`;

        try {
          const genreResponse = await requestWithAuth(genreSearchUrl);
          
          if (genreResponse.artists?.items) {
            const genreArtists = genreResponse.artists.items
              .filter(artist => artist.id !== artistId); // 元のアーティストを除外

            relatedArtists = [...relatedArtists, ...genreArtists];
            console.log(`ジャンル "${genre}" 検索結果:`, {
              count: genreArtists.length,
              artists: genreArtists.slice(0, 3).map(a => `${a.name} (popularity: ${a.popularity})`)
            });
          }
        } catch (genreError) {
          console.warn(`ジャンル "${genre}" 検索に失敗:`, genreError.message);
        }
      }

      // 重複を排除
      const uniqueArtists = [];
      const seenIds = new Set();
      for (const artist of relatedArtists) {
        if (!seenIds.has(artist.id)) {
          seenIds.add(artist.id);
          uniqueArtists.push(artist);
        }
      }

      relatedArtists = uniqueArtists;

      console.log("全ジャンル検索結果:", {
        originalPopularity: artistDetails.popularity,
        count: relatedArtists.length,
        artists: relatedArtists.slice(0, 5).map(a => `${a.name} (popularity: ${a.popularity})`)
      });
    }

    // 戦略2: アーティスト名のみで検索（常に実行）
    console.log("アーティスト名のみで検索実行:", artistDetails.name);
    
    const nameQuery = `${artistDetails.name}`;
    const nameSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(nameQuery)}&type=artist&limit=50`;
    
    console.log("Search API呼び出し（アーティスト名のみ）:", {
      query: nameQuery,
      url: nameSearchUrl
    });

    try {
      const nameResponse = await requestWithAuth(nameSearchUrl);
      
      if (nameResponse.artists?.items) {
        const existingIds = new Set(relatedArtists.map(a => a.id));
        const nameArtists = nameResponse.artists.items
          .filter(artist => 
            artist.id !== artistId && 
            !existingIds.has(artist.id)
          ); // 重複排除

        relatedArtists = [...relatedArtists, ...nameArtists];
        console.log("アーティスト名のみ検索結果:", {
          count: nameArtists.length,
          artists: nameArtists.slice(0, 5).map(a => `${a.name} (popularity: ${a.popularity})`)
        });
      }
    } catch (nameError) {
      console.warn("アーティスト名のみ検索に失敗:", nameError.message);
    }

    // 最終結果を元のアーティストのpopularityに近い順でソートして10件に制限
    const originalPopularity = artistDetails.popularity || 0;
    const finalResults = relatedArtists
      .sort((a, b) => {
        const diffA = Math.abs((a.popularity || 0) - originalPopularity);
        const diffB = Math.abs((b.popularity || 0) - originalPopularity);
        return diffA - diffB; // popularityの差が小さい順
      })
      .slice(0, 10);

    console.log("最終的な関連アーティスト:", {
      count: finalResults.length,
      artists: finalResults.map(a => `${a.name} (popularity: ${a.popularity})`),
      strategies: {
        artistName: artistDetails.name,
        genres: artistDetails.genres || [],
        searchLevels: [
          "アーティスト名検索（最優先）",
          relatedArtists.length >= 10 ? "全ジャンル検索不要" : "全ジャンル検索使用",
          relatedArtists.length >= 10 ? "主要ジャンル検索不要" : "主要ジャンル検索使用"
        ].filter(level => !level.includes("不要"))
      }
    });

    if (finalResults.length === 0) {
      console.warn("全ての検索戦略で関連アーティストが見つかりませんでした:", artistId);
    }

    return finalResults;

  } catch (error) {
    console.error("関連アーティスト取得に失敗しました:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      artistId: artistId,
      fullError: error
    });

    // Search APIが利用可能なので、エラーでも空配列を返す
    console.log("エラーのため空配列を返します");
    return [];
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
