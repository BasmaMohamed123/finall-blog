<template>
  <div>
    <button v-if="isOwner" @click="onEdit">Edit</button>
    <button v-if="isOwner || isPostOwner" @click="onDelete">Delete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    isOwner: {
      type: Boolean,
      required: true
    },
    commentId: {
      type: Number,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    onEdit() {
      this.$emit('edit', this.commentId);
    },
    onDelete() {
      this.$emit('delete', this.commentId);
    }
  }
});
</script>

<style scoped>
.comment-actions {
  margin-top: 10px;
}
.edit-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  margin-right: 5px;
  cursor: pointer;
}
.delete-button {
  background-color: #c21c10;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
.edit-button:hover, .delete-button:hover {
  opacity: 0.8;
  

}
</style>
