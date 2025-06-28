<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useGigData } from '~/composables/useGigData';
import { getRelatedArtists, testArtistAPI } from '~/utils/spotify';

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

// 関連アーティスト機能の状態
const showRelatedArtists = ref(false);
const relatedArtists = ref([]);
const isLoadingRelatedArtists = ref(false);
const relatedArtistsError = ref(null);

// propsの変化を監視して内部状態を更新
watch(() => props.gig, async (newGig) => {
  if (newGig) {
    const copied = JSON.parse(JSON.stringify(newGig));
    if (copied.date) {
      copied.date = copied.date.replace(/-/g, "/");
    }
    gig.value = copied;
    originalDate.value = copied.date || "";
    
    // 関連アーティストの状態をリセット
    showRelatedArtists.value = false;
    relatedArtists.value = [];
    isLoadingRelatedArtists.value = false;
    relatedArtistsError.value = null;
    
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

// 関連アーティストを取得する関数
const loadRelatedArtists = async () => {
  if (isLoadingRelatedArtists.value) {
    return;
  }

  console.log('関連アーティストを読み込み中:', {
    artistId: gig.value.artistId,
    artistName: gig.value.artistName,
    hasExistingArtists: relatedArtists.value.length > 0
  });
  
  isLoadingRelatedArtists.value = true;
  relatedArtistsError.value = null;

  try {
    if (!gig.value.artistId) {
      throw new Error('アーティストIDが見つかりません');
    }
    
    const artists = await getRelatedArtists(gig.value.artistId);
    console.log('取得した関連アーティスト:', {
      count: artists?.length || 0,
      artists: artists
    });
    
    relatedArtists.value = artists || [];
    
    if (relatedArtists.value.length === 0) {
      console.warn('関連アーティストが0件でした');
    }
  } catch (error) {
    console.error('関連アーティストの取得に失敗しました:', error);
    relatedArtistsError.value = error.message || '関連アーティストの取得に失敗しました。';
  } finally {
    isLoadingRelatedArtists.value = false;
  }
};

// 再試行機能 - 状態をリセットして再実行
const retryLoadRelatedArtists = async () => {
  relatedArtists.value = [];
  relatedArtistsError.value = null;
  await loadRelatedArtists();
};

// 関連アーティストアコーディオンの切り替え
const toggleRelatedArtists = async () => {
  showRelatedArtists.value = !showRelatedArtists.value;
  
  if (showRelatedArtists.value && relatedArtists.value.length === 0) {
    await loadRelatedArtists();
  }
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
        class="fixed inset-0 bg-transparent"
        @click="handleCloseModal"
      >
      </div>

      <!-- モーダル本体 -->
      <div
        id="gig-detail-modal"
        class="max-w-sm sm:max-w-lg lg:max-w-3xl xl:max-w-4xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-h-[90vh] backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden z-80 group"
        @click.stop
      >
        <!-- グラスモーフィズム効果のための追加レイヤー -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tl from-emerald-100/20 via-transparent to-blue-100/20 rounded-3xl"></div>
        
        <div class="relative z-10">
          <!-- アーティスト画像（ヘッダー） -->
          <div v-if="gig.artistImageUrl" class="relative h-48 sm:h-64 lg:h-72 w-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 rounded-t-3xl overflow-hidden">
            <!-- 画像コンテナ -->
            <div class="absolute inset-0 backdrop-blur-xl bg-black/30"></div>
            <img
              :src="gig.artistImageUrl"
              alt="Artist image"
              class="object-contain w-full h-full relative z-10"
            />
            <!-- グラデーションオーバーレイ -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"></div>
            
            <div class="absolute inset-0 flex flex-col-reverse z-30">
              <h2 class="text-white text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg ml-3 sm:ml-4 mb-3 sm:mb-4">
                {{ gig.artistName }}
              </h2>
            </div>
            <!-- 閉じるボタン -->
            <button
              type="button"
              class="cursor-pointer absolute top-3 sm:top-4 right-3 sm:right-4 text-white text-2xl sm:text-3xl font-bold hover:text-gray-300 transition-all duration-300 hover:scale-110 z-40"
              @click="handleCloseModal"
            >
              ×
            </button>
          </div>
          
          <!-- 本文 -->
          <div class="flex flex-col h-full">
            <!-- 上部コンテンツ（固定） -->
            <div class="p-4 sm:p-6 flex-shrink-0">
              <div class="mb-4 sm:mb-6">
                <p class="text-sm font-medium text-gray-700 mb-2">Date</p>
                <p
                  v-if="!isEditingDate"
                  class="text-base sm:text-lg cursor-pointer border-b border-dashed border-gray-400/50 hover:border-emerald-500 inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 text-gray-800 hover:text-emerald-600"
                  @click="startEditing"
                >
                  {{ gig.date }}
                  <span class="text-gray-500 text-sm">📝</span>
                </p>
                <div
                  v-if="isEditingDate"
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2"
                >
                  <input
                    v-model="editingDate"
                    type="date"
                    class="w-full sm:w-auto backdrop-blur-md bg-white/40 px-4 py-2 border border-white/30 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300/50 transition-all duration-300 text-gray-800"
                  />
                  <div class="flex gap-2 w-full sm:w-auto">
                    <button
                      class="group/save flex-1 sm:flex-none backdrop-blur-lg bg-gradient-to-r from-emerald-500/80 to-blue-500/80 hover:from-emerald-600/90 hover:to-blue-600/90 text-white border border-white/30 rounded-xl px-3 sm:px-4 py-2 cursor-pointer transition-all duration-300 text-sm sm:text-base font-semibold transform hover:scale-105 relative overflow-hidden"
                      @click="saveDate"
                    >
                      <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover/save:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <span class="relative z-10">Save</span>
                    </button>
                    <button
                      class="flex-1 sm:flex-none backdrop-blur-lg bg-white/50 hover:bg-white/70 text-gray-700 border border-white/40 rounded-xl px-3 py-2 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base font-semibold"
                      @click="cancelEdit"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- スクロール可能なコンテンツエリア -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 text-gray-800" style="scrollbar-width: thin; scrollbar-color: rgba(16, 185, 129, 0.3) transparent;">
              <!-- Top Tracksセクション -->
              <div class="mb-4 sm:mb-6">
                <p class="text-sm font-medium text-gray-700 mb-3">Top Tracks</p>
                <div
                  class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 overflow-y-auto max-h-48 sm:max-h-52 pr-1"
                  style="scrollbar-width: thin; scrollbar-color: rgba(16, 185, 129, 0.3) transparent;"
                >
                  <div
                    v-for="topTrackId in gig.topTrackIds"
                    :key="topTrackId"
                    :data-track-id="topTrackId"
                    class="track-container overflow-hidden h-20 backdrop-blur-md bg-white/20 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                  >
                    <!-- スケルトンローディング -->
                    <div
                      v-if="!loadedTracks.has(topTrackId)"
                      class="bg-gradient-to-r from-gray-300/40 via-gray-200/40 to-gray-300/40 animate-pulse w-full h-full rounded-xl"
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

              <!-- 関連アーティストセクション -->
              <div>
                <!-- アコーディオンヘッダー -->
                <div
                  class="flex items-center justify-between cursor-pointer backdrop-blur-md bg-white/20 rounded-xl border border-white/30 px-4 py-3 mb-3 hover:bg-white/30 transition-all duration-300 hover:scale-[102%]"
                  @click="toggleRelatedArtists"
                >
                  <p class="text-sm font-medium text-gray-700">You Might Also Like</p>
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-600 transition-transform duration-300"
                      :class="{ 'rotate-180': showRelatedArtists }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <!-- アコーディオンコンテンツ -->
                <Transition
                  name="accordion"
                  enter-active-class="transition-all duration-300 ease-out"
                  leave-active-class="transition-all duration-200 ease-in"
                  enter-from-class="opacity-0 max-h-0"
                  enter-to-class="opacity-100 max-h-48"
                  leave-from-class="opacity-100 max-h-48"
                  leave-to-class="opacity-0 max-h-0"
                >
                  <div v-if="showRelatedArtists" class="overflow-hidden">
                    <!-- ローディング状態 -->
                    <div v-if="isLoadingRelatedArtists" class="flex justify-center py-6">
                      <div class="flex space-x-2">
                        <div
                          v-for="i in 3"
                          :key="i"
                          class="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
                          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
                        ></div>
                      </div>
                    </div>

                    <!-- エラー状態 -->
                    <div v-else-if="relatedArtistsError" class="text-center py-6">
                      <p class="text-red-500 text-sm">{{ relatedArtistsError }}</p>
                      <button
                        class="mt-2 text-emerald-600 text-sm hover:text-emerald-700 transition-colors duration-300"
                        @click="retryLoadRelatedArtists"
                      >
                        再試行
                      </button>
                    </div>

                    <!-- 関連アーティスト一覧 -->
                    <div
                      v-else-if="relatedArtists.length > 0"
                      class="overflow-x-auto pb-2"
                      style="scrollbar-width: thin; scrollbar-color: rgba(16, 185, 129, 0.3) transparent;"
                    >
                      <div class="flex space-x-3 sm:space-x-4 w-max">
                        <div
                          v-for="artist in relatedArtists.slice(0, 10)"
                          :key="artist.id"
                          class="flex-shrink-0 w-24 sm:w-28 cursor-pointer group"
                        >
                          <div class="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-3 transition-all duration-300 hover:bg-white/30 hover:scale-[102%] hover:shadow-lg">
                            <!-- アーティスト画像 -->
                            <div class="aspect-square w-full mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-gray-300/40 to-gray-400/40">
                              <img
                                v-if="artist.images && artist.images[0]"
                                :src="artist.images[0].url"
                                :alt="artist.name"
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div v-else class="w-full h-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              </div>
                            </div>
                            <!-- アーティスト名 -->
                            <p class="text-xs text-gray-700 text-center font-medium truncate" :title="artist.name">
                              {{ artist.name }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- データなし状態 -->
                    <div v-else class="text-center py-6">
                      <p class="text-gray-500 text-sm">関連アーティストが見つかりませんでした。</p>
                    </div>
                  </div>
                </Transition>
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
  background-color: rgba(16, 185, 129, 0.3);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.5);
}

/* トラックコンテナのホバーエフェクト */
.track-container:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* モーダルのアニメーション強化 */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

/* アーティスト画像エリアのグラデーション強化 */
.artist-image-overlay {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
}
</style>
