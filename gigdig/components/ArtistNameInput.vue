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

  // console.log(selectedArtistId.value);
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
      class="w-full backdrop-blur-md bg-white/40 px-4 py-3 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300/50 transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
      placeholder="Who's performing?"
    />
    
    <!-- 検索結果リストのアニメーション -->
    <Transition
      name="dropdown"
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <ul
        v-if="searchResults.length > 0"
        class="absolute top-full left-0 backdrop-blur-md bg-white/90 border border-white/30 rounded-2xl w-full shadow-lg mt-1 max-h-48 overflow-y-auto z-[99999]"
      >
        <li
          v-for="artist in searchResults"
          :key="artist.id"
          @click="setArtistName(artist)"
          class="px-4 py-3 cursor-pointer hover:bg-white/60 transition-all duration-200 text-sm sm:text-base border-b border-white/30 last:border-b-0 transform hover:scale-[1.02]"
        >
          {{ artist.name }}
        </li>
      </ul>
    </Transition>
  </div>
</template>
