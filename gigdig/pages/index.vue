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

const artists = ref([]);
const inputArtistName = ref("");
const selectedArtistId = ref(null);
const topTracks = ref([]);
const debounceTimeout = ref(null);
const debounceDelay = 300;
const isSelecting = ref(false);

const selectedArtist = ref({ id: null, name: null });

const calendarRef = ref();

const showGigDetailModal = ref(false);
const selectedGig = ref(null);

// onMounted(async () => {
//   const user = await client.auth.getUser();

//   // 認証されていない時、ログインページにリダイレクト
//   if (!user) {
//     client.auth.signOut();
//     window.location.href = "/login";
//   }

//   // 認証されている場合はユーザー情報を取得
//   userEmail.value = user.data.user?.email; // ユーザーのメールアドレスを取得
// });

// watch(
//   user,
//   async () => {
//     if (user.value) {
//       const { data, error } = await client
//         .from('users')
//         .select('username')
//         .eq('user_id', user.value?.id)
//         .single();

//         if (error) {
//           console.error("Error fetching user name:", error);
//           userName.value = null;
//         } else {
//           userName.value = data.username;
//         }
//     }
//   },
//   { immediate: true }
// );

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

const fetchArtists = async (input) => {
  try {
    const data = await searchArtists(input);
    console.log("searchArtists の結果:", data);
    artists.value = data;
  } catch (error) {
    console.error("artist search error:", error);
  }
};

watch(inputArtistName, (newValue) => {
  if (isSelecting.value) {
    isSelecting.value = false;
    return;
  }

  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
    if (!newValue) {
      artists.value = [];
      return;
    }
    fetchArtists(newValue);
    debounceTimeout.value = null;
  }, debounceDelay);
});

const setArtistName = (artist) => {
  isSelecting.value = true;
  inputArtistName.value = artist.name;
  selectedArtistId.value = artist.id;
  console.log(selectedArtistId.value);
  artists.value = [];
};

const fetchTopTracks = async (artistId) => {
  try {
    const data = await getArtistTopTracks(artistId);
    console.log(data);
    topTracks.value = data;
    console.log("getArtistTopTracks の結果:", topTracks.value);
  } catch (error) {
    console.error("getTopTracks error:", error);
  }
};

const handleSelectedArtist = (artist) => {
  selectedArtist.value = artist;
  console.log("選択されたアーティスト:", artist);
};

const getGigDate = () => {
  const dateInput = document.getElementById("gig-date");
  return dateInput?.value;
};

const isValidGigInput = (date, artist) => {
  return date && artist.id && artist.name ? true : false;
};

const createGigData = (date, artist) => {
  return {
    date,
    artistId: artist.id,
    artistName: artist.name,
  };
};

const addGigToLocalStorage = (gigData) => {
  const existingData = JSON.parse(localStorage.getItem("gigDataList") || "[]");
  existingData.push(gigData);
  localStorage.setItem("gigDataList", JSON.stringify(existingData));
  return existingData;
};

const hideModal = () => {
  console.log("hideModalが呼ばれました");
  const addGigModal = document.getElementById("add-gig-modal");
  if (addGigModal) {
    addGigModal.classList.add("hidden");
  }
};

const storeGigInfo = () => {
  const date = getGigDate();
  const artist = selectedArtist.value;

  if (!isValidGigInput(date, artist)) {
    alert("日付またはアーティスト情報が不足しています。");
    return;
  }

  const gigData = createGigData(date, artist);
  const updatedGigList = addGigToLocalStorage(gigData);

  hideModal();

  calendarRef.value?.renderCalendar();

  console.log("保存されたgig情報:", gigData);
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
  />
  <GigDetailModal
    v-if="showGigDetailModal"
    :gig="selectedGig"
    @closeModal="showGigDetailModal = false"
  />
</template>
