<script setup>
import { ref, watch, computed } from 'vue'

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

// アーティスト選択状態を管理
const selectedArtist = ref(null);

// propsが変わったときにアーティスト選択状態をリセット
watch(() => props.resetArtistInput, (newVal) => {
  if (newVal) {
    selectedArtist.value = null;
  }
});

// visibleが変わったときにアーティスト選択状態をリセット
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    selectedArtist.value = null;
  }
});

// ボタンの有効/無効を判定
const isSubmitDisabled = computed(() => {
  return !selectedArtist.value || !selectedArtist.value.id;
});

const handleCloseModal = () => {
  selectedArtist.value = null;
  emit('closeModal');
  // console.log('closeModalが呼ばれました');
};

const handleSubmit = (event) => {
  event.preventDefault();
  if (!isSubmitDisabled.value) {
    emit('submit');
  }
  // // console.log('submitが呼ばれました');
};

const handleSelectedArtist = (artist) => {
  selectedArtist.value = artist;
  emit('artistSelected', artist);
  // console.log('選択されたアーティスト:', artist);
};

</script>

<template>
  <!-- モーダル背景オーバーレイ -->
  <Transition
    name="overlay"
    enter-active-class="transition-opacity duration-300 ease-out"
    leave-active-class="transition-opacity duration-200 ease-in"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 bg-transparent z-50"
      @click="handleCloseModal"
    ></div>
  </Transition>

  <!-- モーダル本体のアニメーション -->
  <Transition
    name="modal"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4"
  >
    <div
      v-if='visible'
      id='add-gig-modal'
      class='max-w-sm sm:max-w-md w-full mx-auto mt-4 backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/20 relative z-[9000] overflow-visible group'
      :style="{
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
      }"
      @click.stop
    >
      <!-- グラスモーフィズム効果のための追加レイヤー -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-tl from-emerald-100/20 via-transparent to-blue-100/20 rounded-3xl"></div>
      
      <div class="relative z-10">
        <div class="bg-gradient-to-r from-emerald-500/80 to-blue-500/80 p-4 sm:p-6 relative rounded-t-3xl">
          <!-- 動的背景効果 -->
          <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl"></div>
          
          <div class="relative z-10">
            <h2 class="text-white text-xl sm:text-2xl font-bold">New Gig</h2>
          </div>
        </div>
        
        <form @submit='handleSubmit' class='p-4 sm:p-6 space-y-4 rounded-b-3xl bg-transparent overflow-visible'>
          <div>
            <label for='gig-date' class='block text-sm font-medium text-gray-800 mb-2'>
              Date
            </label>
            <input
              type='date'
              id='gig-date'
              name='gig-date'
              class='w-full backdrop-blur-md bg-white/40 px-4 py-3 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300/50 transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm sm:text-base'
            />
          </div>

          <div class="overflow-visible">
            <label for='artist-name' class='block text-sm font-medium text-gray-800 mb-2'>
              Artist
            </label>
            <ArtistNameInput
              :reset="resetArtistInput"
              @artistSelected="handleSelectedArtist"
            />
          </div>
          
          <button
            type='submit'
            :disabled="isSubmitDisabled"
            class='group/btn w-full backdrop-blur-lg bg-gradient-to-r from-emerald-500/80 to-blue-500/80 hover:from-emerald-600/90 hover:to-blue-600/90 text-white border border-white/30 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold cursor-pointer hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden mt-6 text-sm sm:text-base'
            aria-label="Add Gig"
            title="Add Gig"
          >
            <!-- ボタン内のグラデーション効果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <span class="relative z-10">Add Gig</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
