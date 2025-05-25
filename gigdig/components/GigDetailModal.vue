<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useGigData } from '~/composables/useGigData';

const props = defineProps({
  gig: Object,
});

const user = useSupabaseUser();
const client = useSupabaseClient();

const emit = defineEmits(["closeModal", "gigUpdated"]);

// 内部状態でアニメーション制御
const showModal = ref(false);
const gig = ref({});
const visibleTracks = ref(new Set());
const loadedTracks = ref(new Set());

const { updateGigData } = useGigData();

const isEditingDate = ref(false);
const editingDate = ref('');
const originalDate = ref('');

// propsの変化を監視して内部状態を更新
watch(() => props.gig, async (newGig) => {
  if (newGig) {
    const copied = JSON.parse(JSON.stringify(newGig));
    if (copied.date) {
      copied.date = copied.date.replace(/-/g, "/");
    }
    gig.value = copied;
    originalDate.value = copied.date || "";
    
    // 次のティックまで待ってからモーダルを表示
    await nextTick();
    setTimeout(() => {
      showModal.value = true;
    }, 10);
  } else {
    showModal.value = false;
  }
}, { immediate: true });

// Intersection Observerの設定
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const trackId = entry.target.dataset.trackId;
        visibleTracks.value.add(trackId);
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });

  // トラックの要素を監視
  setTimeout(() => {
    document.querySelectorAll('.track-container').forEach(el => {
      observer.observe(el);
    });
  }, 100);
});

// iframeの読み込み完了を追跡
const handleTrackLoaded = (trackId) => {
  loadedTracks.value.add(trackId);
};

const handleCloseModal = () => {
  showModal.value = false;
  // アニメーション完了後にpropsをクリア
  setTimeout(() => {
    emit("closeModal");
  }, 200);
};

const startEditing = () => {
  originalDate.value = gig.value.date;
  editingDate.value = gig.value.date.replace(/\//g, '-');
  isEditingDate.value = true;
};

const saveDate = async () => {
  if (!editingDate.value) {
    alert("日付を選択してください");
    return;
  }

  const editingGigData = {
    userId: user.value.id,
    date: editingDate.value,
    artistId: gig.value.artistId,
    artistName: gig.value.artistName,
  }

  // Supabaseに更新
  const result = await updateGigData(gig.value.id, editingGigData, client);
  
  if (!result.success) {
    console.error('Supabase update error:', result.error);
    alert('日付の更新に失敗しました');
  } else {
    isEditingDate.value = false;
    originalDate.value = editingDate.value;
    gig.value.date = editingDate.value.replace(/-/g, "/");
    emit('gigUpdated');
  }
};

const cancelEdit = () => {
  editingDate.value = originalDate.value;
  isEditingDate.value = false;
};
</script>

<template>
  <!-- Transitionを内部状態で制御 -->
  <Transition
    name="modal"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="showModal" class="fixed inset-0 z-60">
      <!-- 背景オーバーレイ -->
      <div
        class="fixed inset-0"
        @click="handleCloseModal"
      >
      </div>

      <!-- モーダル本体 -->
      <div
        id="gig-detail-modal"
        class="max-w-sm sm:max-w-lg lg:max-w-3xl xl:max-w-4xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] rounded-2xl border border-gray-300 shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white overflow-hidden z-80"
        @click.stop
      >
        <!-- アーティスト画像（ヘッダー） -->
        <div v-if="gig.artistImageUrl" class="relative h-48 sm:h-64 lg:h-72 w-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900">
          <img
            :src="gig.artistImageUrl"
            alt="Artist image"
            class="object-contain w-full h-full"
          />
          <div class="absolute inset-0 flex flex-col-reverse">
            <h2 class="text-white text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg ml-3 sm:ml-4 mb-3 sm:mb-4">
              {{ gig.artistName }}
            </h2>
          </div>
          <!-- 閉じるボタン -->
          <button
            type="button"
            class="cursor-pointer absolute top-2 sm:top-3 right-3 sm:right-4 text-white text-2xl sm:text-3xl font-bold hover:text-gray-200 transition-all duration-200 hover:scale-110"
            @click="handleCloseModal"
          >
            ×
          </button>
        </div>
        
        <!-- 本文 -->
        <div class="p-4 sm:p-6 text-gray-700">
          <div class="mb-4">
            <p class="text-sm font-semibold text-gray-500">Date</p>
            <p
              v-if="!isEditingDate"
              class="text-base sm:text-lg cursor-pointer border-b border-dashed border-gray-300 hover:border-blue-500 inline-flex items-center gap-2 transition-all duration-200 hover:scale-105"
              @click="startEditing"
            >
              {{ gig.date }}
              <span class="text-gray-400 text-sm">📝</span>
            </p>
            <div
              v-if="isEditingDate"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2"
            >
              <input
                v-model="editingDate"
                type="date"
                class="w-full sm:w-auto border rounded p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <div class="flex gap-2 w-full sm:w-auto">
                <button
                  class="flex-1 sm:flex-none bg-blue-500 text-white rounded px-3 sm:px-4 py-2 cursor-pointer hover:bg-blue-400 transition-all duration-200 text-sm sm:text-base transform hover:scale-105 active:scale-95"
                  @click="saveDate"
                >
                  Save
                </button>
                <button
                  class="flex-1 sm:flex-none bg-gray-300 rounded px-3 py-2 cursor-pointer hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base transform hover:scale-105 active:scale-95"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-2">Top Tracks</p>
            <div
              class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 overflow-y-auto max-h-48 sm:max-h-52 pr-1"
              style="scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;"
            >
              <div
                v-for="topTrackId in gig.topTrackIds"
                :key="topTrackId"
                :data-track-id="topTrackId"
                class="track-container overflow-hidden h-20"
              >
                <!-- スケルトンローディング -->
                <div
                  v-if="!loadedTracks.has(topTrackId)"
                  class="bg-gray-200 animate-pulse w-full h-full rounded-xl"
                ></div>
                <iframe
                  v-if="visibleTracks.has(topTrackId)"
                  :src="`https://open.spotify.com/embed/track/${topTrackId}`"
                  width="100%"
                  height="80"
                  frameborder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  class="rounded-xl transition-opacity duration-300"
                  @load="handleTrackLoaded(topTrackId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* スクロールバーのスタイルをカスタマイズ（Webkit系のみ） */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 6px;
}
</style>

