<script setup>
import { ref, onMounted } from "vue";

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());

const calendarTitle = ref("");
const calendarBody = ref(null);

const selectedArtist = ref({ id: null, name: null });

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
    localStorage.getItem("gigDataList") || "[]"
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

        const selectedDate = new Date(year.value, date.month, date.date + 1).toISOString().slice(0, 10); // YYYY-MM-DD

        //ライブ情報を表示
        const gigsOnThisDay = gigs.filter((gig) => gig.date === selectedDate);
        gigsOnThisDay.forEach((gig) => {
          const gigLabel = document.createElement("div");
          gigLabel.textContent = gig.artistName;
          gigLabel.classList.add("gig-label");

          gigLabel.addEventListener("click", (event) => {
            event.stopPropagation();
            alert(`アーティスト: ${gig.artistName}\n日付: ${gig.date}`);
          });
          div.appendChild(gigLabel);
        });

        div.addEventListener("click", () => {
          const addGigModal = document.getElementById("add-gig-modal");
          const gigDateInput = document.getElementById("gig-date");

          // const selectedDate = new Date(year.value, date.month, date.date + 1);
          // const formattedDate = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD

          if (addGigModal && gigDateInput) {
            addGigModal.classList.remove("hidden");
            gigDateInput.value = selectedDate;
          }

          // console.log("選択された日付:", formattedDate);
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
  renderCalendar();

  console.log("保存されたgig情報:", gigData);
};


</script>

<template>
  <div class="px-4 w-7/10 mx-auto">
    <table class="mt-12 w-full font-mono rounded">
      <thead class="border-b-1 border-gray-400 w-full">
        <tr class="flex justify-between w-full">
          <th class="cursor-pointer select-none" id="prev" @click="prevMonth">
            &laquo;
          </th>
          <th id="title" colspan="5">{{ calendarTitle }}</th>
          <th class="cursor-pointer select-none" id="next" @click="nextMonth">
            &raquo;
          </th>
        </tr>
        <tr class="mt-4 flex justify-around w-full">
          <th><div class="px-4">Sun</div></th>
          <th><div class="px-4">Mon</div></th>
          <th><div class="px-4">Tue</div></th>
          <th><div class="px-4">Wed</div></th>
          <th><div class="px-4">Thu</div></th>
          <th><div class="px-4">Fri</div></th>
          <th><div class="px-4">Sat</div></th>
        </tr>
      </thead>
      <tbody ref="calendarBody" class="w-full"></tbody>
      <!-- <tfoot>
        <tr>
          <td class="cursor-pointer select-none" id="today" colspan="7" @click="goToToday">Today</td>
        </tr>
      </tfoot> -->
    </table>
  </div>
  <AddGigModal @submit="storeGigInfo" @artistSelected="handleSelectedArtist" />
</template>

<style>
@import "tailwindcss";

@tailwind utilities;

@layer utilities {
  tbody div.disabled {
    @apply opacity-30;
  }

  td.today {
    @apply font-bold;
  }

  tbody tr {
    @apply flex justify-around w-full;
  }

  tbody td:first-child {
    @apply text-red-600;
  }

  tbody td:last-child {
    @apply text-blue-600;
  }

  tbody td {
    @apply cursor-pointer w-1/7 border border-gray-100 hover:bg-gray-50/50;
  }

  tbody div {
    @apply text-center px-6 pt-2 pb-20;
  }
}

.gig-label {
  background-color: #60a5fa; /* 青 */
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 4px;
  cursor: pointer;
}
</style>
