<template>
  <q-list>
    <div class="list-item__wrapper" v-for="(item, index) in items" :key="item.id" @click="listItemClickHandler(item)">

      <q-item>
        <span class="list-item__id">{{ item.id }}</span>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label caption :lines="lines">{{ item.text }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption v-if="item.date">{{ dayjs(item.date).format(dateDisplayFormat) }}</q-item-label>
          <q-item-label caption v-if="item.priority" style="color: #374bc9">Приоритет:{{ item.priority }}</q-item-label>
        </q-item-section>
      </q-item>
      <div class="list-item__bottom">
        <div class="list-item__actions" >
          <EditIconComponent v-if="editable" @click.stop="editItemClick(item)"/>
          <DeleteIconComponent v-if="deletable" @click.stop="deleteItemClick(item)"/>
        </div>
        <q-separator vertical spaced inset />

        <q-img
          style="max-height: 200px;"
          v-if="item?.img?.hasOwnProperty('url')"
          class="q-ml-xl cursor-pointer"
          :src="item.img.url"
          @click="imgClickHandler($event)"
          loading="lazy"
          fit="contain"
        >
          <template v-slot:error>
            <img
              src="/icons/no-image.png"
              alt="No image"
            />
          </template>
        </q-img>

        <div class="list-item__files flex column" v-if="item.files?.length">
          <q-chip
            v-for="file in item.files"
            :key="file.name"
            square
            icon="description"
            clickable
            @click.stop="fileClickHandler(file)"
          >
            {{ file.name }}
          </q-chip>
        </div>
      </div>

      <q-separator spaced inset v-if="index !== items.length - 1" />

      <slot></slot>
    </div>
  </q-list>
</template>

<script setup>
import * as dayjs from "dayjs";
import { ref } from "vue";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";


defineProps({
  items: {
    type: Array
  },
  lines: {
    type: [Number, String],
    default: 0,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  deletable: {
    type: Boolean,
    default: false,
  },
  dateDisplayFormat: {
    type: String,
    default: "YYYY-MM-DD HH:mm:ss"
  }
});


const emits = defineEmits(['listItemClick', 'editItemClick', 'deleteItemClick']);
const listItemClickHandler = item => {
  emits('listItemClick', item);
};

const editItemClick = item => {
  emits('editItemClick', item);
};

const deleteItemClick = item => {
  emits('deleteItemClick', item);
};

const imgClickHandler = event => {
  console.log('event', event);
  window.open(event.target.src, '_blank');
};

const fileClickHandler = file => {
  console.log('fileClickHandler ListComponent. file: ', file);
  window.open(file.url, "_blank");
}

</script>

<style scoped>
.list-item__id {
  margin: 0 10px;
  font-size: 42px;
}

.list-item__actions {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-item__actions * {
  transition: all 0.2s;
  cursor: pointer;
}

.list-item__actions > *:hover {
  transform: scale(1.3);
}

.list-item__bottom {
  display: flex;
}

.list-item__wrapper {
  position: relative;
}


</style>
