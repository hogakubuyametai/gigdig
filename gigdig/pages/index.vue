<script setup>
import { useArtistCache } from "~/composables/useArtistCache";
import { useGigData } from "~/composables/useGigData";

const { getArtistData } = useArtistCache();
const { saveGigData } = useGigData();

const user = useSupabaseUser();
const client = useSupabaseClient();


const { data: userData } = await useAsyncData(
  "userData",
  async () => {
    if (!user.value) return null;

    const { data, error } = await client
      .from("users")
      .select("username")
      .eq("user_id", user.value.id)
      .single();

    if (error) throw error;
    return data;
  },
  {
    server: true,
    lazy: false,
    transform: (data) => ({
      userName: data?.username || "",
    }),
    watch: [user],
    cache: true,
    maxAge: 300,
  }
);

const userName = computed(() => userData.value?.userName || "");

const selectedArtist = ref({ id: null, name: null });

const calendarRef = ref();

const showGigDetailModal = ref(false);
const selectedGig = ref(null);

const isLoading = ref(false);

const resetArtistInput = ref(false);

const handleShowGigDetail = async (gigInfo) => {
  const artistData = await getArtistData(gigInfo.artistId);
  const artistImageUrl = artistData.artistImageUrl;
  const topTrackIds = artistData.topTrackIds;

  selectedGig.value = {
    ...gigInfo,
    artistImageUrl,
    topTrackIds,
  };
  showGigDetailModal.value = true;
};

const handleSelectedArtist = (artist) => {
  selectedArtist.value = artist;
};

const getGigDate = () => {
  const dateInput = document.getElementById("gig-date");
  return dateInput?.value;
};

/**
 * 日付とアーティスト情報の入力が有効かチェックする
 * @param {string} date - 日付文字列 (YYYY-MM-DD形式)
 * @param {Object} artist - アーティスト情報
 * @param {string} artist.id - アーティストのID
 * @param {string} artist.name - アーティストの名前
 * @returns {boolean} 入力が有効な場合はtrue
 */
const isValidGigInput = (date, artist) => {
  if (!date) {
    alert("日付を選択してください");
    return false;
  }
  if (!artist.id || !artist.name) {
    alert("アーティストを選択してください");
    return false;
  }
  return true;
};

const hideModal = () => {
  console.log("hideModalが呼ばれました");
  const addGigModal = document.getElementById("add-gig-modal");
  if (addGigModal) {
    addGigModal.classList.add("hidden");
  }
};

const storeGigInfo = async () => {
  if (!user.value) {
    alert("ログインが必要です");
    return;
  }

  const date = getGigDate();
  const artist = selectedArtist.value;

  if (!isValidGigInput(date, artist)) {
    alert("日付またはアーティスト情報が不足しています。");
    return;
  }

  isLoading.value = true;

  const gigData = {
    userId: user.value.id,
    date: date,
    artistId: artist.id,
    artistName: artist.name,
  };

  // Supabaseにデータを保存
  const result = await saveGigData(gigData, client);

  if (result.success) {
    hideModal();
    calendarRef.value?.renderCalendar();
    selectedArtist.value = { id: null, name: null };
    // 入力欄リセット
    resetArtistInput.value = true;
    setTimeout(() => (resetArtistInput.value = false), 100); // 再利用可能にするため一瞬で戻す
  } else {
    console.error('Supabase insert error:', result.message);
    alert(result.message);
  }

  isLoading.value = false;
};

const signOut = async () => {
  const { error } = await client.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
  } else {
    navigateTo({ path: "/login" });
  }
};
</script>
<template>
  <div v-if="userName" class="ml-4 mt-4 flex justify-between">
    <div>
      <p>Hello！ {{ userName }}</p>
      <h2 class="font-bold">Your Calendar</h2>
    </div>
    <div>
      <button @click="signOut">
        <span class="p-2 bg-blue-300 rounded-md">Logout</span>
      </button>
    </div>
  </div>
  <Calendar @show-gig-detail="handleShowGigDetail" ref="calendarRef" />
  <AddGigModal
    @closeModal="hideModal"
    @submit="storeGigInfo"
    @artistSelected="handleSelectedArtist"
    :isLoading="isLoading"
    :resetArtistInput="resetArtistInput"
  />
  <GigDetailModal
    v-if="showGigDetailModal"
    :gig="selectedGig"
    @closeModal="showGigDetailModal = false"
  />
</template>
