import { getArtistDetails, getArtistTopTracks } from '@/utils/spotify';

type ArtistData = {
  artistImageUrl: string;
  topTrackIds: string[];
};

const gigDataCache = new Map<string, ArtistData>();

// クライアント側でのみ sessionStorage を読み込む
if (typeof window !== 'undefined') {
  const saved = sessionStorage.getItem('artistCache');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Record<string, ArtistData>;
      for (const [id, data] of Object.entries(parsed)) {
        gigDataCache.set(id, data);
      }
    } catch (e) {
      console.warn('Failed to parse cache from sessionStorage:', e);
    }
  }
}

function saveCacheToSession() {
  if (typeof window === 'undefined') return; // サーバーなら何もしない
  const obj = Object.fromEntries(gigDataCache.entries());
  sessionStorage.setItem('artistCache', JSON.stringify(obj));
}

export function useArtistCache() {
  async function getArtistData(artistId: string): Promise<ArtistData> {
    if (gigDataCache.has(artistId)) {
      // console.log('Cache hit for artistId:', artistId);
      return gigDataCache.get(artistId)!;
    }

    // console.log('Cache miss for artistId:', artistId);

    const artistDetails = await getArtistDetails(artistId);
    const artistImageUrl = artistDetails?.images?.[0]?.url || '';
    if (!artistImageUrl) {
      throw new Error('No artist image found');
    }

    let topTrackIds: string[] = [];
    try {
      const fetched = await getArtistTopTracks(artistId);
      if (Array.isArray(fetched)) {
        topTrackIds = fetched.map(track => track.id);
      }
    } catch (e) {
      // console.warn(`Failed to get top tracks for ${artistId}:`, e);
    }

    const artistData: ArtistData = { artistImageUrl, topTrackIds };
    setArtistData(artistId, artistData);

    return artistData;
  }

  function setArtistData(artistId: string, data: ArtistData) {
    gigDataCache.set(artistId, data);
    saveCacheToSession();
  }

  return {
    getArtistData,
    setArtistData,
  };
}
