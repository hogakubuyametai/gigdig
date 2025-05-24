<script setup>
import { ref, onMounted } from 'vue';
import { useGigData } from '~/composables/useGigData';

const props = defineProps({
  gig: Object,
});

const user = useSupabaseUser();
const client = useSupabaseClient();

const emit = defineEmits(["closeModal"]);
const gig = ref(props.gig ? JSON.parse(JSON.stringify(props.gig)) : {});
const visibleTracks = ref(new Set());
const loadedTracks = ref(new Set());

const { updateGigData } = useGigData();

const isEditingDate = ref(false);
const editingDate = ref('');
const originalDate = ref(gig.value.date || "");

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
  emit("closeModal");
};

watch(
  () => props.gig,
  (newGig) => {
    if (newGig) {
      const copied = JSON.parse(JSON.stringify(newGig));
      if (copied.date) {
        copied.date = copied.date.replace(/-/g, "/");
      }
      gig.value = copied;
    }
  },
  { immediate: true }
);

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
  <div
    id="gig-detail-modal"
    class="max-w-4xl w-full mx-auto mt-4 rounded-2xl border border-gray-300 shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white overflow-hidden"
  >
    <!-- アーティスト画像（ヘッダー） -->
    <div v-if="gig.artistImageUrl" class="relative h-72 w-full bg-gray-400/40">
      <img
        :src="gig.artistImageUrl"
        alt="Artist image"
        class="object-contain w-full h-full"
      />
      <div class="absolute inset-0 flex flex-col-reverse">
        <h2 class="text-white text-4xl font-bold drop-shadow-md ml-4 mb-4">
          {{ gig.artistName }}
        </h2>
      </div>
      <!-- 閉じるボタン -->
      <button
        type="button"
        class="cursor-pointer absolute top-3 right-4 text-white text-3xl font-bold hover:text-gray-200"
        @click="handleCloseModal"
      >
        ×
      </button>
    </div>

    <!-- 本文 -->
    <div class="p-6 text-gray-700">
      <div class="mb-4">
        <p class="text-sm font-semibold text-gray-500">Date</p>
        <p 
          v-if="!isEditingDate"
          class="text-lg cursor-pointer border-b border-dashed border-gray-300 hover:border-blue-500 inline-flex items-center gap-2 transition-colors"
          @click="startEditing"
        >
          {{ gig.date }}
          <span class="text-gray-400 text-sm">📝</span>
        </p>
        <div
          v-if="isEditingDate"
          class="flex items-center gap-4 mt-2">
          <input
            v-model="editingDate"
            type="date"
            class="border rounded p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            class="bg-blue-500 text-white rounded px-4 py-2 cursor-pointer hover:bg-blue-400 transition"
            @click="saveDate"
            >
            Save
          </button>
          <button
            class="bg-gray-300 rounded px-3 py-2 cursor-pointer hover:bg-gray-200 transition"
            @click="cancelEdit"
            >
            Cancel
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm font-semibold text-gray-500 mb-2">Top Tracks</p>
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-52 pr-1"
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
              class="rounded-xl"
              @load="handleTrackLoaded(topTrackId)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
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

