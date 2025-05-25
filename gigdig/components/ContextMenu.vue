<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  gig: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(['deleteGig', 'closeContextMenu']);

const handleDelete = () => {
  emit('deleteGig', props.gig);
  emit('closeContextMenu');
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-40"
    @click="$emit('closeContextMenu')"
  >
    <div
      class="shadow-lg z-50 rounded-md transition-all absolute"
      @click.stop
      :style="{ top: y + 'px', left: x + 'px' }">
      <button
        @click='handleDelete'
        class='w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-left bg-white hover:bg-gray-50 cursor-pointer rounded-md transition-all border border-gray-300 min-w-[80px] sm:min-w-[100px]'
        >
        🗑️ Delete
      </button>
    </div>
  </div>
</template>