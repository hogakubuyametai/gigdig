<script setup>
import { ref, onMounted } from "vue";
import { useGigData } from "~/composables/useGigData";

const emit = defineEmits(["show-gig-detail", "show-add-gig-modal"]);

const { getGigList, deleteGigData } = useGigData();

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());

const calendarTitle = ref("");
const calendarBody = ref(null);

const isLoading = ref(true);

const user = useSupabaseUser();
const client = useSupabaseClient();

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  gig: null,
});

function getCalendarHead() {
  const dates = [];
  const d = new Date(year.value, month.value, 0).getDate();
  const n = new Date(year.value, month.value, 1).getDay();

  for (let i = 0; i < n; i++) {
    dates.unshift({
      month: month.value - 1,
      date: d - i,
      isToday: false,
      isDisabled: true,
    });
  }
  return dates;
}

function getCalendarBodyDays() {
  const dates = [];
  const lastDate = new Date(year.value, month.value + 1, 0).getDate();

  for (let i = 1; i <= lastDate; i++) {
    dates.push({
      month: month.value,
      date: i,
      isToday: false,
      isDisabled: false,
    });
  }

  if (year.value === today.getFullYear() && month.value === today.getMonth()) {
    dates[today.getDate() - 1].isToday = true;
  }

  return dates;
}

function getCalendarTail() {
  const dates = [];
  const lastDay = new Date(year.value, month.value + 1, 0).getDay();

  for (let i = 1; i < 7 - lastDay; i++) {
    dates.push({
      month: month.value + 1,
      date: i,
      isToday: false,
      isDisabled: true,
    });
  }
  return dates;
}

const fetchGigDataList = async () => {
  if (!user.value) return [];

  const result = await getGigList(user.value.id, client);
  return result.success ? result.data : [];
};

const renderCalendar = async () => {
  isLoading.value = true;

  const head = getCalendarHead();
  const body = getCalendarBodyDays();
  const tail = getCalendarTail();
  const dates = [...head, ...body, ...tail];
  const weeks = [];
  const weeksCount = dates.length / 7;

  const gigs = await fetchGigDataList();
  console.log("Fetched gigs:", gigs);

  calendarTitle.value = `${year.value}/${String(month.value + 1).padStart(
    2,
    "0"
  )}`;

  // まずは既存のtbodyの中身をクリア
  if (calendarBody.value) {
    while (calendarBody.value.firstChild) {
      calendarBody.value.removeChild(calendarBody.value.firstChild);
    }
    // 新しい週の要素を作成して追加
    for (let i = 0; i < weeksCount; i++) {
      const week = dates.splice(0, 7);
      const tr = document.createElement("tr");

      week.forEach((date) => {
        const td = document.createElement("td");
        const div = document.createElement("div");
        div.classList.add("calendar-cell");
        div.textContent = date.date;

        const selectedDate = new Date(year.value, date.month, date.date + 1)
          .toISOString()
          .slice(0, 10); // YYYY-MM-DD

        //ライブ情報を表示
        const gigsOnThisDay = gigs.filter(
          (gig) => gig.gig_date === selectedDate
        );
        gigsOnThisDay.forEach((gig) => {
          const gigLabel = document.createElement("div");
          gigLabel.textContent = gig.artist_name;
          gigLabel.classList.add("gig-label");
          
          let longPressTimer = null;
          let isLongPress = false;
          
          gigLabel.addEventListener('touchstart', (event) => {
            isLongPress = false;
            longPressTimer = setTimeout(() => {
              isLongPress = true;
              showContextMenu(event.touches[0], gig);
            }, 500); // 500msでロングプレスとみなす
          });
          
          gigLabel.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
          });
          
          gigLabel.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
          });
          
          
          gigLabel.addEventListener("click", (event) => {
            if(!isLongPress) {
              event.stopPropagation();
  
              emit("show-gig-detail", {
                id: gig.id,
                date: gig.gig_date,
                artistId: gig.artist_id,
                artistName: gig.artist_name,
              });
            }
          });


          gigLabel.addEventListener("contextmenu", (event) => {
           showContextMenu(event, gig);
          });
          div.appendChild(gigLabel);
        });

        div.addEventListener("click", (event) => {
          const rect = event.target.getBoundingClientRect();

          const modalWidth = 320;
          const modalHeight = 400;

          const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

          let adjustedX = rect.right + 10;
          let adjustedY = rect.top;

          if (adjustedX + modalWidth > viewportWidth) {
            adjustedX = rect.left - modalWidth - 10;
          }

          if (adjustedY + modalHeight > viewportHeight) {
            adjustedY = viewportHeight - modalHeight - 10;
          }

          if (adjustedX < 0) {
            adjustedX = 10;
          }
          
          if (adjustedY < 0) {
            adjustedY = 10;
          }

          emit("show-add-gig-modal", {
            x: adjustedX,
            y: adjustedY,
            selectedDate: selectedDate,
          });

          closeContextMenu();
        });

        if (date.isToday) {
          div.classList.add("today");
        }
        if (date.isDisabled) {
          div.classList.add("disabled");
        }
        tr.appendChild(td);
        td.appendChild(div);
      });
      calendarBody.value.appendChild(tr);
    }
  }
  isLoading.value = false;
};

defineExpose({
  renderCalendar,
});

onMounted(() => {
  renderCalendar();
});

const prevMonth = () => {
  month.value--;
  if (month.value < 0) {
    year.value--;
    month.value = 11;
  }
  renderCalendar();
};

const nextMonth = () => {
  month.value++;
  if (month.value > 11) {
    year.value++;
    month.value = 0;
  }
  renderCalendar();
};

const goToToday = () => {
  year.value = today.getFullYear();
  month.value = today.getMonth();
  renderCalendar();
};

const handleDeleteGig = async (gig) => {
  if (confirm(`${gig.artist_name}のGigを削除しますか？`)) {
    const result = await deleteGigData(gig.id, client);
    if (result.success) {
      renderCalendar();
    } else {
      alert(`削除に失敗しました: ${result.message}`);
    }
  }
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
  contextMenu.value.x = 0;
  contextMenu.value.y = 0;
  contextMenu.value.gig = null;
};

const showContextMenu = (eventOrTouch, gig) => {
  if (eventOrTouch && typeof eventOrTouch.preventDefault === 'function') {
    eventOrTouch.preventDefault();
  }

  const x = eventOrTouch.clientX || eventOrTouch.pageX;
  const y = eventOrTouch.clientY || eventOrTouch.pageY;

  const menuWidth = 100;
  const menuHeight = 50;

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  let adjustedX = x + 10;
  let adjustedY = y + 10;

  if (adjustedX + menuWidth > viewportWidth) {
    adjustedX = viewportWidth - menuWidth - 10; // 画面右端に収める
  }

  if (adjustedY + menuHeight > viewportHeight) {
    adjustedY = viewportHeight - menuHeight - 10;
  }

  if (adjustedX < 0) {
    adjustedX = 10;
  }

  if (adjustedY < 0) {
    adjustedY = 10;
  }

  contextMenu.value = {
    visible: true,
    x: adjustedX,
    y: adjustedY, // 少し下にずらす
    gig: gig
  };
};
</script>

<template>
  <div class="px-4 max-w-5xl mx-auto">
    <div class="flex items-center gap-5 mt-8 mb-4 min-w-0">
      <!-- 左側のボタンを flex-shrink-0 で固定 -->
      <div class="flex items-center gap-5 flex-shrink-0">
        <!-- Today ボタン -->
        <button
          @click="goToToday"
          :disabled="isLoading"
          class="text-sm px-3 py-2 sm:px-4 sm:py-1 border border-gray-400 rounded-full hover:bg-gray-100 transition cursor-pointer min-h-auto flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Today
        </button>

        <!-- < > ボタン -->
        <button
          @click="prevMonth"
          class="text-lg sm:text-xl hover:text-gray-600/90 hover:bg-gray-100/50 rounded-full px-1 transition cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto flex items-center justify-center"
        >
          &lt;
        </button>
        <button
          @click="nextMonth"
          class="text-lg sm:text-xl hover:text-gray-600/90 hover:bg-gray-100/50 rounded-full px-1 transition cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto flex items-center justify-center"
        >
          &gt;
        </button>
      </div>

      <!-- 年月表示 - 残りのスペースを使って、必要に応じて縮小 -->
      <h2 class="text-base sm:text-lg md:text-2xl font-sans min-w-0 flex-1 truncate">{{ calendarTitle }}</h2>
    </div>

    <!-- 曜日 -->
    <div
      class="grid grid-cols-7 text-center text-xs sm:text-sm text-gray-500 border-b pb-2 mb-2 font-sans"
    >
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>

    <!-- カレンダー本体 -->
    <table class="w-full">
      <tbody ref="calendarBody" class="grid grid-rows-6 gap-px">
        <!-- JavaScriptで描画 -->
      </tbody>
    </table>

    <!-- ローディング表示 -->
    <div v-if="isLoading" class="w-full">
      <div class="grid grid-rows-6 gap-px">
        <div v-for="week in 5" class="grid grid-cols-7 gap-px">
          <div v-for="day in 7" class="h-24 md:h-28 border border-gray-200 bg-gray-50 animate-pulse rounded-md">
            <div class="p-2 h-full flex flex-col">
              <!-- 日付のスケルトン -->
              <div class="w-4 h-3 bg-gray-300 rounded animate-pulse mb-2"></div>
              <!-- Gigラベルのスケルトン -->
              <div class="w-12 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :gig="contextMenu.gig"
      @deleteGig="handleDeleteGig"
      @closeContextMenu="closeContextMenu"
    />
  </div>
</template>

<style>
@tailwind utilities;

@layer utilities {
  tbody tr {
    @apply grid grid-cols-7;
  }

  tbody td {
    @apply h-24 sm:p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-150;
    /* md:h-28の代わりに直接指定 */
    @media (min-width: 768px) {
      height: 7rem; /* 112px = h-28 */
    }
  }

  .calendar-cell {
    @apply font-sans text-[0.625rem] sm:text-xs flex flex-col items-start h-full w-full rounded-md md:px-2 py-1 cursor-pointer select-none;
  }

  /* Today */
  .calendar-cell.today {
    @apply bg-blue-100 border border-blue-300 text-blue-500 font-bold;
  }

  /* Disabled days (前後月) */
  .calendar-cell.disabled {
    @apply text-gray-400 opacity-50;
  }

  /* Gig label */
  .gig-label {
    @apply bg-blue-500 text-white text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 px-1 sm:px-2 py-0.5 rounded-full truncate max-w-full hover:bg-blue-600 transition;
  }

  /* Sunday */
  tbody td:first-child .calendar-cell {
    @apply text-red-500;
  }

  /* Saturday */
  tbody td:last-child .calendar-cell {
    @apply text-blue-500;
  }
}
</style>
