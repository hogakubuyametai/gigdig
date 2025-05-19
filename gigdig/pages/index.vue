<script setup>
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

// const artists = ref([]);
// const inputArtistName = ref("");
// const selectedArtistId = ref(null);
// const topTracks = ref([]);
// const debounceTimeout = ref(null);
// const debounceDelay = 300;
// const isSelecting = ref(false);

const selectedArtist = ref({ id: null, name: null });

const calendarRef = ref();

const showGigDetailModal = ref(false);
const selectedGig = ref(null);

const isLoading = ref(false);

const resetArtistInput = ref(false);

// エラー種別の定数定義を追加
const DB_ERRORS = {
  42501: "アクセス権限がありません。再度ログインしてください。",
  23505: "同じ日付のGigが既に登録されています。",
  23503: "ユーザー情報が見つかりません。",
  default: "データの保存に失敗しました。時間をおいて再度お試しください。",
};

const fetchArtistImageUrl = async (artistId) => {
  try {
    const data = await getArtistDetails(artistId);
    const artistImageUrl = data.images[0]?.url || "";
    console.log("artistImageUrl:", artistImageUrl);
    return artistImageUrl;
  } catch (error) {
    console.error("getArtistDetails error:", error);
  }
};

const handleShowGigDetail = async (gigInfo) => {
  const artistImageUrl = await fetchArtistImageUrl(gigInfo.artistId);
  selectedGig.value = {
    ...gigInfo,
    artistImageUrl,
  };
  showGigDetailModal.value = true;
};

// const fetchArtists = async (input) => {
//   try {
//     const data = await searchArtists(input);
//     console.log("searchArtists の結果:", data);
//     artists.value = data;
//   } catch (error) {
//     console.error("artist search error:", error);
//   }
// };

// watch(inputArtistName, (newValue) => {
//   if (isSelecting.value) {
//     isSelecting.value = false;
//     return;
//   }

//   if (debounceTimeout.value) {
//     clearTimeout(debounceTimeout.value);
//   }

//   debounceTimeout.value = setTimeout(() => {
//     if (!newValue) {
//       artists.value = [];
//       return;
//     }
//     fetchArtists(newValue);
//     debounceTimeout.value = null;
//   }, debounceDelay);
// });

// const setArtistName = (artist) => {
//   isSelecting.value = true;
//   inputArtistName.value = artist.name;
//   selectedArtistId.value = artist.id;
//   console.log(selectedArtistId.value);
//   artists.value = [];
// };

// const fetchTopTracks = async (artistId) => {
//   try {
//     const data = await getArtistTopTracks(artistId);
//     console.log(data);
//     topTracks.value = data;
//     console.log("getArtistTopTracks の結果:", topTracks.value);
//   } catch (error) {
//     console.error("getTopTracks error:", error);
//   }
// };

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

  try {
    const { data, error } = await client
      .from("gigs")
      .insert({
        user_id: user.value.id,
        gig_date: date,
        artist_id: artist.id,
        artist_name: artist.name,
      })
      .select();

    if (error) throw error;

    hideModal();
    calendarRef.value?.renderCalendar();
    selectedArtist.value = { id: null, name: null };
    
    // 入力欄リセット
    resetArtistInput.value = true;
    setTimeout(() => (resetArtistInput.value = false), 100); // 再利用可能にするため一瞬で戻す
  } catch (error) {
    console.error("Supabase insert error:", error);
    alert(DB_ERRORS[error.code] || DB_ERRORS["default"]);
  } finally {
    isLoading.value = false;
  }
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
