import { ref } from 'vue';
import { searchArtists } from '@/utils/spotify';

export const useSpotifyData = () => {
  const searchResults = ref([]);
  const isSearching = ref(false);
  const debounceTimeout = ref<NodeJS.Timeout | null>(null);

  const searchArtistsDebounced = async (query: string) => {
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }
    isSearching.value = true;

    debounceTimeout.value = setTimeout(async () => {
      if (!query.trim()) {
        searchResults.value = [];
        return {success: true, data: []};
      }
      
      isSearching.value = true;
      try {
        const data = await searchArtists(query);
        searchResults.value = data;
      } catch (error){
        console.error('Error searching artists:', error);
      } finally {
        isSearching.value = false;
      }
    }, 300); // 300msの遅延
  };
  return {
    searchResults,
    isSearching,
    searchArtists: searchArtistsDebounced
  };
};
