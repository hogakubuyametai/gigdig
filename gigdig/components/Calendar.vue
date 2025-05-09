<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['show-gig-detail']);

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());

const calendarTitle = ref('');
const calendarBody = ref(null);

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

const loadGigDataList = () => {
  return JSON.parse(
    localStorage.getItem('gigDataList') || '[]'
  );
}

function renderCalendar() {
  const head = getCalendarHead();
  const body = getCalendarBodyDays();
  const tail = getCalendarTail();
  const dates = [...head, ...body, ...tail];
  const weeks = [];
  const weeksCount = dates.length / 7;

  const gigs = loadGigDataList();

  calendarTitle.value = `${year.value}/${String(month.value + 1).padStart(
    2,
    '0'
  )}`;

  // まずは既存のtbodyの中身をクリア
  if (calendarBody.value) {
    while (calendarBody.value.firstChild) {
      calendarBody.value.removeChild(calendarBody.value.firstChild);
    }
    // 新しい週の要素を作成して追加
    for (let i = 0; i < weeksCount; i++) {
      const week = dates.splice(0, 7);
      const tr = document.createElement('tr');

      week.forEach((date) => {
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.classList.add('calendar-cell');
        div.textContent = date.date;

        const selectedDate = new Date(year.value, date.month, date.date + 1).toISOString().slice(0, 10); // YYYY-MM-DD

        //ライブ情報を表示
        const gigsOnThisDay = gigs.filter((gig) => gig.date === selectedDate);
        gigsOnThisDay.forEach((gig) => {
          const gigLabel = document.createElement('div');
          gigLabel.textContent = gig.artistName;
          gigLabel.classList.add('gig-label');

          gigLabel.addEventListener('click', (event) => {
            event.stopPropagation();
            
            emit('show-gig-detail', {
              date: gig.date,
              artistName: gig.artistName,
            });
          });
          div.appendChild(gigLabel);
        });

        div.addEventListener('click', () => {
          const addGigModal = document.getElementById('add-gig-modal');
          const gigDateInput = document.getElementById('gig-date');

          // const selectedDate = new Date(year.value, date.month, date.date + 1);
          // const formattedDate = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD

          if (addGigModal && gigDateInput) {
            addGigModal.classList.remove('hidden');
            gigDateInput.value = selectedDate;
          }

          // console.log('選択された日付:', formattedDate);
        });

        if (date.isToday) {
          div.classList.add('today');
        }
        if (date.isDisabled) {
          div.classList.add('disabled');
        }
        tr.appendChild(td);
        td.appendChild(div);
      });
      calendarBody.value.appendChild(tr);
    }
  }
}

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

</script>

<template>
  <div class="px-4 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mt-8 mb-4">
      <button @click="prevMonth" class="text-gray-500 hover:text-black text-xl">&laquo;</button>
      <h2 class="text-xl font-bold font-sans">{{ calendarTitle }}</h2>
      <button @click="nextMonth" class="text-gray-500 hover:text-black text-xl">&raquo;</button>
    </div>

    <div class="grid grid-cols-7 text-center text-sm text-gray-500 border-b pb-2 mb-2 font-sans">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>

    <table class="w-full">
      <tbody ref="calendarBody" class="grid grid-rows-6 gap-px">
        <!-- JavaScriptで描画 -->
      </tbody>
    </table>
  </div>
</template>


<style>
@import 'tailwindcss';

@tailwind utilities;

@layer utilities {
  tbody tr {
    @apply grid grid-cols-7;
  }

  tbody td {
    @apply h-28 p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-150;
  }

  .calendar-cell {
    @apply font-sans text-xs flex flex-col items-start h-full w-full rounded-md px-2 py-1 cursor-pointer;
  }

  td.today .calendar-cell {
    @apply bg-blue-100 border border-blue-300;
  }

  .disabled .calendar-cell {
    @apply text-gray-400 opacity-50;
  }

  .gig-label {
    @apply bg-blue-500 text-white text-[10px] mt-1 px-2 py-0.5 rounded-full truncate max-w-full hover:bg-blue-600 transition;
  }
}

</style>
