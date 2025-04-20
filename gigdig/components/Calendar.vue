<script setup>
import { ref, onMounted } from 'vue';

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
      date: i,
      isToday: false,
      isDisabled: true,
    });
  }
  return dates;
}

function renderCalendar() {
  const head = getCalendarHead();
  const body = getCalendarBodyDays();
  const tail = getCalendarTail();
  const dates = [...head, ...body, ...tail];
  const weeks = [];
  const weeksCount = dates.length / 7;

  calendarTitle.value = `${year.value}/${String(month.value + 1).padStart(2, '0')}`;

  // まずは既存のtbodyの中身をクリア
  if (calendarBody.value) {
    while (calendarBody.value.firstChild) {
      calendarBody.value.removeChild(calendarBody.value.firstChild);
    }
    // 新しい週の要素を作成して追加
    for (let i = 0; i < weeksCount; i++) {
      const week = dates.splice(0, 7);
      const tr = document.createElement('tr');
      week.forEach(date => {
        const td = document.createElement('td');
        td.textContent = date.date;
        if (date.isToday) {
          td.classList.add('today');
        }
        if (date.isDisabled) {
          td.classList.add('disabled');
        }
        tr.appendChild(td);
      });
      calendarBody.value.appendChild(tr);
    }
  }
}

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
  <table class="mx-auto mt-12">
    <thead class="border-b-1 border-gray-400">
      <tr>
        <th class="cursor-pointer select-none" id="prev" @click="prevMonth">&laquo;</th>
        <th id="title" colspan="5">{{ calendarTitle }}</th>
        <th class="cursor-pointer select-none" id="next" @click="nextMonth">&raquo;</th>
      </tr>
      <tr class="mt-4">
        <th>Sun</th>
        <th>Mon</th>
        <th>Tue</th>
        <th>Wed</th>
        <th>Thu</th>
        <th>Fri</th>
        <th>Sat</th>
      </tr>
    </thead>
    <tbody ref="calendarBody">
      </tbody>
    <!-- <tfoot>
      <tr>
        <td class="cursor-pointer select-none" id="today" colspan="7" @click="goToToday">Today</td>
      </tr>
    </tfoot> -->
  </table>
</template>

<style>
@import "tailwindcss";

@tailwind utilities;

@layer utilities {
  td.disabled {
    @apply opacity-30;
  }

  td.today {
    @apply font-bold;
  }

  tbody td:first-child {
    @apply text-red-600
  }

  tbody td:last-child {
    @apply text-blue-600;
  }

  tbody td {
    @apply pt-4 px-16 pb-16;
  }
}
</style>