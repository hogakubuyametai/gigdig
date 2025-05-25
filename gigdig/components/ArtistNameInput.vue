<script setup>
import { useSpotifyData } from '~/composables/useSpotifyData';

const { searchResults, isSearching, searchArtists } = useSpotifyData();

const props = defineProps({
  reset: Boolean, // 親から渡されるリセット用フラグ
});

watch(() => props.reset, (newVal) => {
  if (newVal) {
    inputArtistName.value = "";
    selectedArtistId.value = null;
    searchResults.value = [];
  }
});

const emit = defineEmits(['artistSelected']);

const emitArtistSelected = (artist) => {
 emit('artistSelected', artist);
};


const inputArtistName = ref("");
const selectedArtistId = ref(null);

const isSelecting = ref(false);

watch(inputArtistName, (newValue) => {
  if (isSelecting.value) {
    isSelecting.value = false;
    return;
  }

  searchArtists(newValue);
});

const setArtistName = (artist) => {
  isSelecting.value = true;
  inputArtistName.value = artist.name;
  selectedArtistId.value = artist.id;

  emitArtistSelected({id: artist.id, name: artist.name});

  console.log(selectedArtistId.value);
  searchResults.value = [];
};


</script>

<template>
  <div class="w-full relative">
    <input
      v-model="inputArtistName"
      type="text"
      id="search-artists"
      name="search-artists"
      class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors text-sm sm:text-base"
      placeholder="Who's performing?"
    />
    <ul
      v-if="searchResults.length > 0"
      class="absolute top-full left-0 z-10 bg-white border border-gray-300 rounded-md w-full shadow-lg mt-1 max-h-48 overflow-y-auto"
    >
      <li
        v-for="artist in searchResults"
        :key="artist.id"
        @click="setArtistName(artist)"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm sm:text-base border-b border-gray-100 last:border-b-0"
      >
        {{ artist.name }}
      </li>
    </ul>
  </div>
</template>
