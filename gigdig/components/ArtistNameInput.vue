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
  <div class="w-full">
    <input
      v-model="inputArtistName"
      type="text"
      id="search-artists"
      name="search-artists"
      class="px-1 bg-white border border-[#cbd5e1] rounded-md shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1 w-full"
      placeholder="Search artists"
    />
    <ul
      v-if="searchResults.length > 0"
      class="bg-white border border-[#e2e8f0] rounded-md w-full shadow border-t-0"
    >
      <li
        v-for="artist in searchResults"
        :key="artist.id"
        @click="setArtistName(artist)"
        class="cursor-pointer hover:bg-gray-50/90"
      >
        {{ artist.name }}
      </li>
    </ul>
  </div>
</template>
