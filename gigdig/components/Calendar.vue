<script setup>
import { ref, onMounted, nextTick } from "vue";
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
  await nextTick();

  const head = getCalendarHead();
  const body = getCalendarBodyDays();
  const tail = getCalendarTail();
  const dates = [...head, ...body, ...tail];

  const gigs = await fetchGigDataList();

  calendarTitle.value = `${year.value}/${String(month.value + 1).padStart(2, "0")}`;

  await nextTick();

  if (calendarBody.value) {
    // 既存の中身をクリア
    while (calendarBody.value.firstChild) {
      calendarBody.value.removeChild(calendarBody.value.firstChild);
    }

    // 各日付のセルを作成
    dates.forEach((date) => {
      const div = document.createElement("div");
      div.classList.add("calendar-cell");
      
      // 日付番号
      const dateNumber = document.createElement("span");
      dateNumber.classList.add("date-number");
      dateNumber.textContent = date.date;
      div.appendChild(dateNumber);

      // Gigラベルコンテナ
      const gigContainer = document.createElement("div");
      gigContainer.classList.add("gig-container");

      const selectedDate = new Date(year.value, date.month, date.date)
        .toISOString()
        .slice(0, 10);

      // ライブ情報を表示
      const gigsOnThisDay = gigs.filter((gig) => gig.gig_date === selectedDate);
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
          }, 500);
        });
        
        gigLabel.addEventListener('touchend', () => {
          clearTimeout(longPressTimer);
        });
        
        gigLabel.addEventListener('touchmove', () => {
          clearTimeout(longPressTimer);
        });
        
        gigLabel.addEventListener("click", (event) => {
          if (!isLongPress) {
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
        
        gigContainer.appendChild(gigLabel);
      });

      div.appendChild(gigContainer);

      // セルクリックイベント
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

        if (adjustedX < 0) adjustedX = 10;
        if (adjustedY < 0) adjustedY = 10;

        emit("show-add-gig-modal", {
          x: adjustedX,
          y: adjustedY,
          selectedDate: selectedDate,
        });

        closeContextMenu();
      });

      // クラス設定
      if (date.isToday) div.classList.add("today");
      if (date.isDisabled) div.classList.add("disabled");
      
      calendarBody.value.appendChild(div);
    });
  }
  
  isLoading.value = false;
};

defineExpose({
  renderCalendar,
});

onMounted(async () => {
  await nextTick();
  await renderCalendar();
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
    adjustedX = viewportWidth - menuWidth - 10;
  }

  if (adjustedY + menuHeight > viewportHeight) {
    adjustedY = viewportHeight - menuHeight - 10;
  }

  if (adjustedX < 0) adjustedX = 10;
  if (adjustedY < 0) adjustedY = 10;

  contextMenu.value = {
    visible: true,
    x: adjustedX,
    y: adjustedY,
    gig: gig
  };
};
</script>

<template>
  <div class="px-2 md:px-4 max-w-6xl mx-auto space-y-4 md:space-y-8">
    <!-- カレンダー全体 -->
    <div class="relative">
      <div class="backdrop-blur-xl bg-white/60 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/30 relative overflow-hidden group">
        <!-- 動的背景効果 -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative z-10">
          <!-- 年月とナビゲーション -->
          <div class="flex items-center justify-between mb-4 md:mb-6">
            <div class="flex items-center gap-2 md:gap-6">
              <h1 class="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {{ calendarTitle }}
              </h1>
              
              <!-- ナビゲーションボタン -->
              <div class="flex items-center gap-2 md:gap-3">
                <button
                  @click="prevMonth"
                  :disabled="isLoading"
                  class="group/btn backdrop-blur-lg bg-white/50 hover:bg-white/70 text-gray-700 border border-white/40 w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-200/20 to-blue-200/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl md:rounded-2xl"></div>
                  <svg class="w-3 h-3 md:w-5 md:h-5 relative z-10 transform group-hover/btn:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <button
                  @click="nextMonth"
                  :disabled="isLoading"
                  class="group/btn backdrop-blur-lg bg-white/50 hover:bg-white/70 text-gray-700 border border-white/40 w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-200/20 to-blue-200/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl md:rounded-2xl"></div>
                  <svg class="w-3 h-3 md:w-5 md:h-5 relative z-10 transform group-hover/btn:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Today ボタン -->
            <button
              @click="goToToday"
              :disabled="isLoading"
              class="group/today backdrop-blur-lg bg-gradient-to-r from-emerald-500/80 to-blue-500/80 hover:from-emerald-600/90 hover:to-blue-600/90 text-white border border-white/30 px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl transition-all duration-300 font-semibold cursor-pointer hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover/today:opacity-100 transition-opacity duration-300"></div>
              <span class="relative z-10 flex items-center gap-1 md:gap-2">
                <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-xs md:text-sm">Today</span>
              </span>
            </button>
          </div>

          <!-- 曜日ヘッダー -->
          <div class="grid grid-cols-7 gap-1 md:gap-4 text-center mb-4 md:mb-6">
            <div class="text-red-500 font-bold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-red-50/50">Sun</div>
            <div class="text-gray-600 font-semibold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50/30">Mon</div>
            <div class="text-gray-600 font-semibold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50/30">Tue</div>
            <div class="text-gray-600 font-semibold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50/30">Wed</div>
            <div class="text-gray-600 font-semibold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50/30">Thu</div>
            <div class="text-gray-600 font-semibold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50/30">Fri</div>
            <div class="text-blue-500 font-bold text-xs md:text-sm py-2 md:py-3 rounded-lg md:rounded-xl bg-blue-50/50">Sat</div>
          </div>

          <!-- カレンダー本体 -->
          <div class="relative">
            <!-- ローディング状態のオーバーレイ -->
            <div v-if="isLoading" class="absolute inset-0 z-10 grid grid-cols-7 gap-1 md:gap-4">
              <div v-for="i in 35" :key="i" class="backdrop-blur-lg bg-white/40 border border-white/30 rounded-xl md:rounded-3xl p-1 md:p-4 h-22 md:h-32 animate-pulse">
                <div class="space-y-1 md:space-y-3">
                  <div class="w-4 h-3 md:w-6 md:h-4 bg-gray-300/60 rounded"></div>
                  <div class="w-12 h-3 md:w-20 md:h-6 bg-gray-300/40 rounded-full"></div>
                </div>
              </div>
            </div>

            <!-- カレンダーグリッド -->
            <div ref="calendarBody" class="grid grid-cols-7 gap-1 md:gap-4 min-h-[30rem] md:min-h-[40rem]" :class="{ 'opacity-0': isLoading, 'opacity-100': !isLoading }">
              <!-- JavaScriptで描画 -->
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
  /* カスタム高さクラスを定義 */
  .h-22 {
    height: 6rem; /* 96px - 少し高くする */
  }

  .calendar-cell {
    @apply backdrop-blur-lg bg-white/50 border border-white/30 rounded-xl md:rounded-3xl p-1 md:p-4 h-22 md:h-32 cursor-pointer select-none transition-all duration-500 flex flex-col relative overflow-hidden hover:bg-white/70 hover:border-white/50 hover:shadow-2xl hover:scale-105 transform-gpu;
  }

  .calendar-cell::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.8s;
  }

  .calendar-cell:hover::before {
    left: 100%;
  }

  .calendar-cell .date-number {
    @apply font-bold text-gray-800 mb-0.5 md:mb-2 relative z-10 flex-shrink-0;
    font-size: 10px;
    line-height: 1;
  }

  @media (min-width: 768px) {
    .calendar-cell .date-number {
      @apply text-lg;
      line-height: 1.2;
    }
  }

  .gig-container {
    @apply flex flex-col gap-0.5 md:gap-1 flex-1 relative z-10 overflow-hidden min-h-0;
    /* 幅を最大限活用 */
    width: 100%;
  }

  .calendar-cell.today {
    @apply bg-emerald-50/80 border-emerald-200/60 shadow-md;
  }

  .calendar-cell.today .date-number {
    @apply text-emerald-700 font-bold;
  }

  .calendar-cell.today::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 3px;
    width: 3px;
    height: 3px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.3);
  }

  @media (min-width: 768px) {
    .calendar-cell.today::after {
      top: 6px;
      right: 6px;
      width: 4px;
      height: 4px;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
    }
  }

  .calendar-cell.disabled {
    @apply bg-white/20 text-gray-400 opacity-60 hover:bg-white/20 hover:scale-100 hover:shadow-none;
  }

  .calendar-cell.disabled .date-number {
    @apply text-gray-400;
  }

  .gig-label {
    @apply bg-gradient-to-r from-emerald-500/90 to-blue-500/90 text-white text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 px-1 sm:px-2 py-0.5 rounded-full truncate max-w-full hover:from-emerald-600 hover:to-blue-600 transition;
  }

  @media (min-width: 768px) {
    .gig-label {
      @apply text-xs;
      min-height: 24px;
      line-height: 1.4;
      padding: 6px 12px;
    }
  }

  .gig-label::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .gig-label:hover::before {
    opacity: 1;
  }

  .calendar-cell:nth-child(7n+1):not(.disabled) .date-number {
    @apply text-red-500;
  }

  .calendar-cell:nth-child(7n):not(.disabled) .date-number {
    @apply text-blue-500;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .grid div:hover {
    @apply  transition-transform duration-200;
  }

  /* スマートフォンでのホバー無効化 */
  @media (hover: none) {
    .calendar-cell:hover::before {
      left: -100%;
    }
    
    .calendar-cell:hover {
      @apply scale-100 shadow-lg;
    }
    
    .gig-label:hover {
      @apply scale-100;
    }
  }
}
</style>