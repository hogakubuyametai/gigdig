<script setup>
defineProps({
  gig: Object,
})

const emit = defineEmits(['closeModal']);

const handleCloseModal = () => {
  emit('closeModal');
  console.log('closeModalが呼ばれました');
};

</script>

<template>
  <div
    id=''
    class='w-3/10 mx-auto mt-4 rounded border border-gray-400 p-4 shadow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white'
  >
    <div class='absolute top-2 right-4 w-fit'>
      <button
        type='button'
        class='text-gray-500 hover:text-gray-700 cursor-pointer'
        @click='handleCloseModal'
      >
        &times;
      </button>
    </div>
    <p class='font-bold text-2xl'>Gig Detail</p>
    <div class='flex flex-col gap-4 p-4'>
      <div>
        <p class="font-semibold">Date</p>
        <p>{{ gig.date }}</p>
      </div>
      <div>
       <p class="font-semibold">Artist</p>
       <p>{{ gig.artistName }}</p>
      </div>
    </div>
  </div>
</template>