<script setup>
import AutoComplete from "vue3-autocomplete";

const artists = ref([]);
const inputArtistName = ref("");
const selectedArtistId = ref(null);
const topTracks = ref([]);
const debounceTimeout = ref(null);
const debounceDelay = 300;
const isSelecting = ref(false);

const fetchArtists = async (input) => {
  try {
    const data = await searchArtists(input);
    console.log("searchArtists の結果:", data);
    artists.value = data;
  } catch (error) {
    console.error("artist search error:", error);
  }
};

watch(inputArtistName, (newValue) => {
  if (isSelecting.value) {
    isSelecting.value = false;
    return;
  }

  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
    if (!newValue) {
      artists.value = [];
      return;
    }
    fetchArtists(newValue);
    debounceTimeout.value = null;
  }, debounceDelay);
});

const setArtistName = (artist) => {
  isSelecting.value = true;
  inputArtistName.value = artist.name;
  selectedArtistId.value = artist.id;
  console.log(selectedArtistId.value);
  artists.value = [];
};

const fetchTopTracks = async (artistId) => {
  try {
    const data = await getArtistTopTracks(artistId);
    console.log(data);
    topTracks.value = data;
    console.log("getArtistTopTracks の結果:", topTracks.value);
  } catch (error) {
    console.error("getTopTracks error:", error);
  }
};

</script>

<template>
  <Calendar />
  <div class="max-w-4xl mx-auto">
    <form @submit.prevent="submitArtistName">
      <div class="flex gap-4">
        <input
          v-model="inputArtistName"
          type="text"
          id="search-artists"
          name="search-artists"
          size="24"
          class="px-1 bg-white border border-[#cbd5e1] rounded-md shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1"
          placeholder="Search artists"
        />
        <button @click="fetchTopTracks(selectedArtistId)" type="submit" class="bg-blue-400 px-4 py-2 cursor-pointer rounded-md text-white">submit</button>
      </div>
      <ul
        v-if="artists.length > 0"
        class="bg-white border border-[#e2e8f0] rounded-md w-5/12 shadow"
      >
        <li
          v-for="artist in artists"
          :key="artist.id"
          @click="setArtistName(artist)"
          class="cursor-pointer hover:bg-gray-50/90"
        >
          {{ artist.name }}
        </li>
      </ul>
    </form>
    <ul v-if="topTracks.length > 0">
      <li v-for="topTrack in topTracks" :key="topTrack.id">{{ topTrack.name}}</li>
    </ul>
    <div v-for="topTrack in topTracks" :key="topTrack.id" class="mb-4 w-80">
    <iframe
      v-if="topTrack.id"
      :src="`https://open.spotify.com/embed/track/${topTrack.id}`"
      width="100%"
      height="80"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style="border-radius:12px">
    </iframe>
  </div>
  </div>
</template>
