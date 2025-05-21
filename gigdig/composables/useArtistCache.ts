import { getArtistDetails } from '@/utils/spotify';
import { getArtistTopTracks } from '@/utils/spotify';

const gigDataCache = new Map<string, {artistImageUrl: string, topTracks: any[]}>();

export function useArtistCache() {
  async function getArtistData (artistId: string) {
    if (gigDataCache.has(artistId)) {
      console.log('Cache hit for artistId:', artistId);
      console.log('topTracks:', gigDataCache.get(artistId)?.topTracks);
      return {
        artistImageUrl: gigDataCache.get(artistId)?.artistImageUrl,
        topTracks: gigDataCache.get(artistId)?.topTracks,
      };
    }
    console.log('Cache miss for artistId:', artistId);
    const artistDetails = await getArtistDetails(artistId);
    const artistImageUrl = artistDetails?.images[0]?.url || '';
    const topTracks = await getArtistTopTracks(artistId) || [];

    if (!artistImageUrl) {
      throw new Error('No artist image found');
    }
    if (!topTracks) {
      throw new Error('No top tracks found');
    }

    setArtistData(artistId, artistImageUrl, topTracks);

    return {
      artistImageUrl,
      topTracks,
    };
  }

  function setArtistData(artistId: string, artistImageUrl: string, topTracks: any[]) {
    gigDataCache.set(artistId, { artistImageUrl, topTracks });
  }

  return {
    getArtistData,
    setArtistData,
  };
}

