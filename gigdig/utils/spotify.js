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
  try {
    const response = await requestWithAuth(url);
    return response.tracks;
  } catch (error) {
    throw new Error("トップトラックの取得に失敗しました。再試行してください。");
  }
};

// Helper function to search artists by genres
const searchArtistsByGenres = async (genres, artistId) => {
  const artists = [];
  
  for (const genre of genres) {
    const genreQuery = `genre:"${genre}"`;
    const genreSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genreQuery)}&type=artist&limit=30`;
    
    try {
      const genreResponse = await requestWithAuth(genreSearchUrl);
      
      if (genreResponse.artists?.items) {
        const genreArtists = genreResponse.artists.items
          .filter(artist => artist.id !== artistId);
        artists.push(...genreArtists);
      }
    } catch (genreError) {
      throw new Error(`ジャンル検索に失敗しました: ${genre} - ${genreError.message}`);
    }
  }
  
  return artists;
};

// Helper function to search artists by name
const searchArtistsByName = async (artistName, artistId, excludeIds) => {
  const nameQuery = artistName;
  const nameSearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(nameQuery)}&type=artist&limit=50`;
  
  try {
    const nameResponse = await requestWithAuth(nameSearchUrl);
    
    if (nameResponse.artists?.items) {
      return nameResponse.artists.items
        .filter(artist => 
          artist.id !== artistId && 
          !excludeIds.has(artist.id)
        );
    }
    return [];
  } catch (nameError) {
    throw new Error(`アーティスト名検索に失敗しました: ${nameError.message}`);
  }
};

// Helper function to deduplicate artists
const deduplicateArtists = (artists) => {
  const uniqueArtists = [];
  const seenIds = new Set();
  
  for (const artist of artists) {
    if (!seenIds.has(artist.id)) {
      seenIds.add(artist.id);
      uniqueArtists.push(artist);
    }
  }
  
  return uniqueArtists;
};

export const getRelatedArtists = async (artistId) => {
  if (!artistId) {
    throw new Error("アーティストIDが必要です");
  }

  try {
    // アーティスト詳細を取得してジャンル情報を得る
    const artistDetails = await getArtistDetails(artistId);

    if (!artistDetails || typeof artistDetails !== 'object') {
      throw new Error("アーティストの詳細情報が正しく取得できませんでした。");
    }

    let relatedArtists = [];

    // 戦略1: 全ジャンル個別検索（最優先）
    if (artistDetails.genres && artistDetails.genres.length > 0) {
      const genreArtists = await searchArtistsByGenres(artistDetails.genres, artistId);
      relatedArtists = deduplicateArtists(genreArtists);
    }

    // 戦略2: アーティスト名のみで検索（常に実行）
    const existingIds = new Set(relatedArtists.map(a => a.id));
    const nameArtists = await searchArtistsByName(artistDetails.name, artistId, existingIds);
    relatedArtists = [...relatedArtists, ...nameArtists];

    // 最終結果を元のアーティストのpopularityに近い順でソートして10件に制限
    const originalPopularity = artistDetails.popularity || 0;
    const finalResults = relatedArtists
      .sort((a, b) => {
        const diffA = Math.abs((a.popularity || 0) - originalPopularity);
        const diffB = Math.abs((b.popularity || 0) - originalPopularity);
        return diffA - diffB;
      })
      .slice(0, 10);

    return finalResults;

  } catch (error) {
    throw new Error(`関連アーティストの取得に失敗しました: ${error.message}`);
  }
};
