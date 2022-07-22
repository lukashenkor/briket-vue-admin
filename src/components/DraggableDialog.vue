<template>
  <q-dialog ref="myDialog" no-backdrop-dismiss no-esc-dismiss @show="onShow" @hide="onHide">
    <q-card :style="{minWidth: minWidth + 'px', minHeight: minHeight + 'px'}">
      <q-bar
        class="bg-primary text-white"
        :class="draggable ? 'cursor-move' : ''"
      >
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <div class="dialog-body">
        <slot></slot>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";


const props = defineProps({
  minWidth: {
    type: String,
    default: "600"
  },
  minHeight: {
    type: String,
    default: "400"
  },
  draggable: {
    type: Boolean,
    default: true
  },
  modelDialog: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
});
const emits = defineEmits(['onShow', 'onHide']);

const target = ref(null);
const nodeDragg = ref(null);

const onShow = () => {
  let dialogElements = document.getElementsByClassName("q-dialog");
  target.value = dialogElements[0].querySelector(".q-card");
  nodeDragg.value = target.value.querySelector(".q-bar");
  if (props.draggable) {
    nodeDragg.value.addEventListener("mousedown", onGrab);
  }

  emits("onShow");
};

const onHide = () => {
  if (props.draggable) {
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", onLetGo);
    nodeDragg.value.removeEventListener("mousedown", onGrab);
  }
  emits("onHide");
};

const onDrag = (e) => {
  let originalStyles = window.getComputedStyle(target.value);
  target.value.style.left =
    parseInt(originalStyles.left) + e.movementX + "px";
  target.value.style.top = parseInt(originalStyles.top) + e.movementY + "px";
};

const onLetGo = () => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", onLetGo);
};

const onGrab = () => {
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", onLetGo);
};

</script>

<style>
.cursor-move {
  cursor: pointer;
}

.dialog-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  padding: 40px 10px;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.dialog-body > h1,
.dialog-body > h2,
.dialog-body > h3,
.dialog-body > h4,
.dialog-body > h5,
.dialog-body > h6 {
  text-align: center;
}

.dialog-buttons {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
</style>
