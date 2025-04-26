<script setup>
import AutoComplete from 'vue3-autocomplete'

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
    if (!newValue) {
      artists.value = [];
      return;
    }
    fetchArtists(newValue);
    debounceTimeout.value = null;
  }, debounceDelay);

});
</script>

<template>
  <Calendar />
  <!-- <form action="#">
    <input v-model="inputArtistName" type="search" id="search-artists" name="search-artists" size="16">
  </form> -->
  <AutoComplete
    v-model="inputArtistName"
    :results="artists"
    :debounce="0"
    :placeholder="'Artist name'"
    />
  <!-- <option class="mx-auto flex flex-col justify-center">
    <select v-for="artist in artists" :key="artist.id">{{ artist.name }}</select>
  </option> -->
</template>