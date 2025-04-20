<script setup>
const artists = ref([]);
const inputArtistName = ref('');
const debounceTimeout = ref(null);
const debounceDelay = 300;

const fetchArtists = async (input) => {
  try {
    const data = await searchArtists(input);
    console.log('searchArtists の結果:', data); 
    artists.value = data;
  } catch (error) {
    console.error('artist search error:', error);
  }
};

watch(inputArtistName, (newValue) => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
    fetchArtists(newValue);
    debounceTimeout.value = null;
  }, debounceDelay);
});
</script>

<template>
  <Calendar />
  <form action="#">
    <input v-model="inputArtistName" type="search" id="search-artists" name="search-artists" size="16">
  </form>
  <ul class="text-center">
    <li v-for="artist in artists" :key="artist.id">{{ artist.name }}</li>
  </ul>
</template>