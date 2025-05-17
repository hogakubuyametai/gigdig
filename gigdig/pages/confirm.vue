<script setup>
const user = useSupabaseUser();
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="loader"></div>
    <p class="text-gray-500">Loading...</p>
  </div>
</template>