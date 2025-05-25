<script setup>
import { vi } from '@nuxt/ui/runtime/locale/index.js';

const props = defineProps({
  resetArtistInput: Boolean,

  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
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
  <!-- 背景オーバーレイのアニメーション -->
  <Transition
    name="overlay"
    enter-active-class="transition-opacity duration-200 ease-out"
    leave-active-class="transition-opacity duration-200 ease-in"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if='visible'
      class='fixed inset-0 z-60'
      @click='handleCloseModal'
    >
    </div>
  </Transition>

  <!-- モーダル本体のアニメーション -->
  <Transition
    name="modal"
    enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4"
  >
    <div
      v-if='visible'
      id='add-gig-modal'
      class='max-w-sm sm:max-w-md w-full mx-auto mt-4 rounded-2xl border border-gray-300 shadow-lg relative bg-white overflow-hidden z-70'
      :style="{
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
      }"
      @click.stop
    >
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 sm:p-6 relative">
        <h2 class="text-white text-xl sm:text-2xl font-bold">New Gig</h2>
        <button
          type='button'
          class='cursor-pointer absolute top-2 sm:top-3 right-3 sm:right-4 text-white text-2xl sm:text-3xl font-bold hover:text-gray-200 transition-all duration-200 hover:scale-110'
          @click='handleCloseModal'
        >
          ×
        </button>
      </div>
      
      <form @submit='handleSubmit' class='p-4 sm:p-6 space-y-4'>
        <div>
          <label for='gig-date' class='text-sm font-semibold text-gray-500 block mb-2'>
            Date
          </label>
          <input
            type='date'
            id='gig-date'
            name='gig-date'
            class='w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 text-sm sm:text-base'
          />
        </div>

        <div>
          <label for='artist-name' class='text-sm font-semibold text-gray-500 block mb-2'>
            Artist
          </label>
          <ArtistNameInput
            :reset="resetArtistInput"
            @artistSelected="handleSelectedArtist"
          />
        </div>
        
        <button
          type='submit'
          class='w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-md transition-all duration-200 cursor-pointer mt-6 text-sm sm:text-base transform hover:scale-105 active:scale-95'
          aria-label="Add Gig"
          title="Add Gig"
        >
          Add
        </button>
      </form>
    </div>
  </Transition>
</template>