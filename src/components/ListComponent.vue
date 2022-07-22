<template>
  <q-list>
    <div class="list-item__wrapper" v-for="item in items" :key="item.id" @click="listItemClickHandler(item)">

      <q-item>
        <span class="list-item__id">{{ item.id }}</span>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label caption lines="1">{{ item.text }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption>{{ dayjs(item.date).format('DD.MM.YYYY HH:mm:ss') }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced inset />

      <slot></slot>
    </div>
    <DraggableDialog v-model="dialog" :title="selectedItem?.value?.title" @onHide="onHide">
      <h6>Текст обращения</h6>
      <p class="paragraph-text">{{ selectedItem.value.text }}</p>
      <q-input
        type="textarea"
        v-model="answerText"
        filled
        label="Ответ"
        class="fit"
        no-error-icon
        hide-hint
        hide-bottom-space
      />
      <div class="dialog-buttons">
        <q-btn
          label="Отправить"
          color="positive"
          @click="sendAnswer"
          :disable="!answerText.length"
          v-close-popup
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </DraggableDialog>
  </q-list>
</template>

<script setup>
import * as dayjs from "dayjs";
import { computed, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";

const emits = defineEmits(['sendAnswer']);
const props = defineProps(['items']);
const items = computed(() => props.items);
const dialog = ref(false);
const selectedItem = reactive({});
const answerText = ref('');

const listItemClickHandler = item => {
  console.log('item', item);
  dialog.value = true;
  selectedItem.value = item;
  console.log('selectedItem.value', selectedItem.value);
};

const sendAnswer = () => {
  // TODO: post request to add feedback answer
  console.log('answerText.value', answerText.value);
  emits('sendAnswer', selectedItem);
};

const onHide = () => {
  answerText.value = '';
  selectedItem.value = {};
}

</script>

<style scoped>
.list-item__id {
  margin: 0 10px;
  font-size: 42px;
}
</style>
