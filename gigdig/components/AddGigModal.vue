<script setup>
const props = defineProps({
  resetArtistInput: Boolean, // index.vue から受け取る
});

const emit = defineEmits(['closeModal', 'submit', 'artistSelected']);

const handleCloseModal = () => {
  emit('closeModal');
  console.log('closeModalが呼ばれました');
};

const handleSubmit = (event) => {
  event.preventDefault();
  emit('submit');
  console.log('submitが呼ばれました');
};

const handleSelectedArtist = (artist) => {
  emit('artistSelected', artist);
  console.log('選択されたアーティスト:', artist);
};

</script>

<template>
  <div
    id='add-gig-modal'
    class='w-3/10 mx-auto mt-4 rounded border border-gray-400 p-4 shadow hidden relative'
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
    <p class='font-bold text-2xl'>Add a gig</p>
    <form @submit='handleSubmit' class='flex flex-col gap-4 p-4'>
      <div>
        <label for='gig-date' class='font-semibold block'>
          Date
        </label>
        <input
          type='date'
          id='gig-date'
          name='gig-date'
          size='24'
          class='px-1 bg-white border border-[#cbd5e1] rounded-md shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1 w-full'
          placeholder='YYYY/MM/DD'
        />
      </div>
      <div>
        <label for='artist-name' class='font-semibold block'>
          Artist
        </label>
        <ArtistNameInput 
        :reset="resetArtistInput"
        @artistSelected="handleSelectedArtist" />
      </div>
      <!-- <input
        type='text'
        id='artist-name'
        name='artist-name'
        size='24'
        class='px-1 bg-white border border-[#cbd5e1] rounded-md shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] focus:ring-1'
        placeholder='Artist name'
      /> -->

      <button
        type='submit'
        class='bg-blue-400 px-4 py-2 cursor-pointer rounded-md text-white'
      >
        Add
      </button>
    </form>
  </div>
</template>