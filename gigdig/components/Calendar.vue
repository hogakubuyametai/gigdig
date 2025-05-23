<script setup>
import { ref, onMounted } from "vue";
import { useGigData } from "~/composables/useGigData";

const emit = defineEmits(["show-gig-detail"]);

const { getGigList, deleteGigData } = useGigData();

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());

const calendarTitle = ref("");
const calendarBody = ref(null);

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

        div.addEventListener("click", () => {
          const addGigModal = document.getElementById("add-gig-modal");
          const gigDateInput = document.getElementById("gig-date");

          if (addGigModal && gigDateInput) {
            addGigModal.classList.remove("hidden");
            gigDateInput.value = selectedDate;
          }
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

  contextMenu.value = {
    visible: true,
    x: eventOrTouch.clientX + 10 || eventOrTouch.pageX + 10, // 少し右にずらす
    y: eventOrTouch.clientY + 10 || eventOrTouch.pageY + 10, // 少し下にずらす
    gig: gig
  };
};
</script>

<template>
  <div class="px-4 max-w-5xl mx-auto">
    <div class="flex items-center gap-5 mt-8 mb-4">
      <!-- Today ボタン -->
      <button
        @click="goToToday"
        class="text-sm px-4 py-1 border border-gray-400 rounded-full hover:bg-gray-100 transition cursor-pointer"
      >
        Today
      </button>

      <!-- < > ボタン -->
      <button
        @click="prevMonth"
        class="text-xl hover:text-gray-600 transition cursor-pointer"
      >
        &lt;
      </button>
      <button
        @click="nextMonth"
        class="text-xl hover:text-gray-600 transition cursor-pointer"
      >
        &gt;
      </button>

      <!-- yyyy/mm -->
      <h2 class="text-2xl font-sans ml-2">{{ calendarTitle }}</h2>
    </div>

    <!-- 曜日 -->
    <div
      class="grid grid-cols-7 text-center text-sm text-gray-500 border-b pb-2 mb-2 font-sans"
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
@import "tailwindcss";

@tailwind utilities;

@layer utilities {
  tbody tr {
    @apply grid grid-cols-7;
  }

  tbody td {
    @apply h-28 p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-150;
  }

  .calendar-cell {
    @apply font-sans text-xs flex flex-col items-start h-full w-full rounded-md px-2 py-1 cursor-pointer select-none;
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
    @apply bg-blue-500 text-white text-[12px] mt-1 px-2 py-0.5 rounded-full truncate max-w-full hover:bg-blue-600 transition;
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
