<template>
  <div
    id=''
    class='w-3/10 mx-auto mt-4 rounded border border-gray-400 p-4 shadow relative'
  >
    <div class='absolute top-2 right-4 w-fit'>
      <button
        type='button'
        class='text-gray-500 hover:text-gray-700 cursor-pointer'
        @click='handleCloseModal'
      >
        &times;
      </button>
    </div>
    <p class='font-bold text-2xl'>Gig Detail</p>
    <div class='flex flex-col gap-4 p-4'>
      <div>
        <p class="font-semibold">Date</p>
        <p>2025/05/22</p>
      </div>
      <div>
       <p class="font-semibold">Artist</p>
       <p>Oasis</p>
      </div>
    </div>
  </div>
</template>