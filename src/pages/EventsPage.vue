<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <CardTabsComponent
    v-if="!fetching"
    :items="items"
    v-model="tab"
    @addItemClick="addItemDialog = true"
    @listItemClick="listItemClick"
    @editItemClick="editItemClick"
    @deleteItemClick="deleteItemClick"
  />
    <DraggableDialog v-model="editItemDialog" title="Редактирование">
      <q-form @submit.prevent="editConfirm" class="q-gutter-md fit">
        <div class="add-item-body">
          <q-input
            name="title"
            maxlength="200"
            v-model="selectedItem.value.title"
            label="Заголовок"
            type="text"
          />
          <br />
          <q-input
            name="text"
            v-model="selectedItem.value.text"
            label="Текст"
            type="textarea"
          />
          <br />
          <q-file
            v-model="selectedItem.value.img"
            label="Выберите файл"
            accept=".jpg, .jpeg, .png"
            name="img"
            outlined
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>

        <div class="dialog-buttons">
          <q-btn
            label="Редактировать"
            color="positive"
            type="submit"
            :disable="waitingResponse"
          />
          <q-btn
            label="Отмена"
            color="primary"
            v-close-popup
          />
        </div>
      </q-form>
    </DraggableDialog>

    <DraggableDialog v-model="deleteItemDialog" title="Удаление" min-width="800">
      <h3>Удалить {{ tab === 'news' ? 'новость' : 'событие' }} "<span class="selected-words text-blue-grey-9">{{ `${selectedItem.value.id} ${selectedItem.value.title}` }}</span>"?</h3>
      <div class="dialog-buttons">
        <q-btn
          label="Удалить"
          color="negative"
          :disable="waitingResponse"
          @click="deleteConfirm"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
    </DraggableDialog>

    <DraggableDialog v-model="addItemDialog" title="Добавление">
      <q-form @submit.prevent="addNewItem" class="q-gutter-md fit" enctype="multipart/form-data">
        <div class="add-item-body">
          <q-input v-for="item in items[tab].fields.inputs" :key="item.name" v-bind="item" v-model="newItem[item.name]" />
          <q-file v-bind="items[tab].fields.uploader" v-model="newItem[items[tab].fields.uploader.name]" >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-input
            name="date"
            v-model="newItem.date"
            label="Дата"
            type="text"
            v-show="false"
          />
<!--          <q-input
            name="title"
            maxlength="200"
            v-model="newItem.title"
            label="Заголовок"
            type="text"
          />
          <br />
          <q-input
            name="text"
            v-model="newItem.text"
            label="Текст"
            type="textarea"
          />
          <br />
          <q-input
            name="date"
            v-model="newItem.date"
            label="Дата"
            type="text"
            v-show="false"
          />
          <br />
          <q-file
            v-model="newItem.img"
            label="Выберите изображение"
            accept=".jpg, .jpeg, .png"
            name="img"
            outlined
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>-->
        </div>

        <div class="dialog-buttons">
          <q-btn
            label="Добавить"
            color="positive"
            type="submit"
            :disable="waitingResponse"
          />
          <q-btn
            label="Отмена"
            color="primary"
            v-close-popup
          />
        </div>
      </q-form>

    </DraggableDialog>

</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { requestJson, apiRoutes, requestForm } from "src/api";
import dayjs from "dayjs";
import axios from "axios";


const waitingResponse = ref(false);
const fetching = ref(true);
const tab = ref('news');
const news = reactive({});
const events = reactive({});
const items = reactive({
  "news": {
    name: 'news',
    label: 'Новости',
    lines: 0,
    icon: 'newspaper',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
        {"label": "Текст", "name": "text", "type": "textarea"},
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true}
    }
  },
  "events": {
    name: 'events',
    label: 'События',
    lines: 0,
    icon: 'event',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
        {"label": "Текст", "name": "text", "type": "textarea"},
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true}
    }

  }
});

onMounted( () => {
  // TODO: add events and news get requests
  console.log('Отправляем запрос на получение данных');

  Promise.all([
    requestJson({
      url: apiRoutes.events,
      params: {
        start: "2020-01-01",
        end: "2023-01-01",
      }
    }),
    requestJson({
      url: apiRoutes.news,
    })
  ])
    .then(([eventsResponse, newsResponse]) => {
      console.log('eventsResponse', eventsResponse);
      console.log('newsResponse', newsResponse);
      items.news.data = newsResponse.data.news.sort((a, b) => dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1);
      items.events.data = eventsResponse.data.sort((a, b) => dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1);
    })
    .finally(() => fetching.value = false);
});


const selectedItem = reactive({});
const listItemClick = (item) => {
  console.log('listItemClick', item);
};

const editItemClick = (item) => {
  console.log('editItemClick', item);
  selectedItem.value = Object.assign({}, item);
  delete selectedItem.value.img;
  editItemDialog.value = true;
};

const editConfirm = async (evt) => {
  const formData = new FormData(evt.target);
  if (!formData.get("img")?.__key) {
    formData.delete("img");
  }
  const selId = selectedItem.value.id;
  const url = `${apiRoutes[tab.value]}/${selId}`;
  try {
    waitingResponse.value = true;
    const response = await requestForm({
      url,
      formData,
      method: "PUT",
    });
  } finally {
    waitingResponse.value = false;
    editItemDialog.value = false;
  }
};


const deleteItemClick = (item) => {
  console.log('deleteItemClick', item);
  selectedItem.value = item;
  deleteItemDialog.value = true;
};

const deleteConfirm = async () => {
  waitingResponse.value = true;
  try {
    const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    deleteItemDialog.value = false;
    if (response.success) {
      items[tab.value].data = items[tab.value].data.filter(item => item.id !== selectedItem.value.id);
    }
  } finally {
    waitingResponse.value = false;
  }
};

const newItem = reactive({
  date: "2021-09-23T16:00:00+03:00",
});
const addNewItem = async (evt) => {
  const formData = new FormData(evt.target);
  const url = apiRoutes[tab.value];
  try {
    waitingResponse.value = true;
    await requestForm({
      url: url,
      formData: formData,
      method: "POST",
    });

  } finally {
    waitingResponse.value = false;
    addItemDialog.value = false;
  }
};


const addItemDialog = ref(false);
const editItemDialog = ref(false);
const deleteItemDialog = ref(false);


</script>

<style scoped>
.selected-words {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.add-item-body {
  width: 80%;
  margin: auto;
}

.add-item-body > * {
  width: 100%;
  margin: auto;
}
</style>
