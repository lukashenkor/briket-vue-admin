<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <CardTabsComponent
    v-if="!fetching"
    :items="items"
    v-model="tab"
    @addItemClick="addItemClick"
    @listItemClick="listItemClick"
    @editItemClick="editItemClick"
    @deleteItemClick="deleteItemClick"
  />
    <DraggableDialog v-model="editItemDialog" title="Редактирование">
      <q-form @submit.prevent="editConfirm" class="q-gutter-md fit">
        <div class="add-item-body">
          <q-input v-for="item in items[tab].fields.inputs" :key="item.name" v-bind="item" v-model="selectedItem.value[item.name]" />
          <q-file v-if="items[tab].fields.uploader" v-bind="items[tab].fields.uploader" v-model="selectedItem.value[items[tab].fields.uploader.name]" >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-slider
            v-if="items[tab].fields.slider"
            v-model="selectedItem.value.priority"
            v-bind="items[tab].fields.slider"
          />

          <DateTimePicker v-bind="items[tab].fields.dateTimePicker" v-model="selectedItem.value.date"/>
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
          <q-file v-if="items[tab].fields.uploader" v-bind="items[tab].fields.uploader" v-model="newItem[items[tab].fields.uploader.name]" >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-slider v-if="items[tab].fields.slider" v-bind="items[tab].fields.slider" v-model="newItem[items[tab].fields.slider.name]"/>
          <DateTimePicker v-bind="items[tab].fields.dateTimePicker" v-model="newItem.date"/>
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
import { computed, onMounted, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { requestJson, apiRoutes, requestForm } from "src/api";
import dayjs from "dayjs";
import { useUtilsStore } from "stores/utils";
import { required } from "src/utils/validators";
import DateTimePicker from "components/DateTimePicker";


const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
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
        {
          "label": "Заголовок",
          "name": "title",
          "type": "text",
          "rules": [required],
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
        },
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true},
      dateTimePicker: {label: "Укажите дату", withoutTime: false, name: "date"}
    },
    role: "news",
  },
  "alerts": {
    name: 'alerts',
    label: 'Важные события',
    lines: 0,
    icon: 'notification_important',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {
          "label": "Заголовок",
          "name": "title",
          "type": "text",
          "rules": [required],
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
        },
      ],
      slider: {"label": true, "name": "priority", "min": 1, "max": 10, markers: true, "marker-labels": true},
      dateTimePicker: {label: "Укажите дату", withoutTime: true, name: "date"}
    },
    role: "alerts",
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
        {
          "label": "Заголовок",
          "name": "title",
          "type": "text",
          "rules": [required],
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
        },
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true},
      dateTimePicker: {label: "Укажите дату", withoutTime: true, name: "date"}
    },
    role: "events",
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
  for (const [ key, value ] of formData) {
    console.log('key', key);
    console.log('value', value);
  }
  return
  try {
    const response = await requestForm({
      url,
      formData,
      method: "PUT",
    });
  //  TODO: Получать ответ от сервера и на основе его добавлять изменения на странице
  } finally {
    editItemDialog.value = false;
  }
};


const deleteItemClick = (item) => {
  console.log('deleteItemClick', item);
  selectedItem.value = item;
  deleteItemDialog.value = true;
};

const deleteConfirm = async () => {
  const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
  const response = await requestJson({
    url,
    method: "DELETE",
  });
  deleteItemDialog.value = false;
  if (response.success) {
    items[tab.value].data = items[tab.value].data.filter(item => item.id !== selectedItem.value.id);
  }
};

const addItemClick = () => {
  for (const key of Object.keys(newItem)) {
    newItem[key] = null;
  }
  tab.value === 'alerts' && (newItem['priority'] = 1);
  addItemDialog.value = true;
};

const newItem = reactive({});
const addNewItem = async (evt) => {
  const formData = new FormData();
  const url = apiRoutes[tab.value];
  // TODO: Протестировать, как отправляется formData для alerts
  // const json = Object.fromEntries(new FormData(evt.target));
  // console.log('json', json);
  // console.log('evt.target', evt.target);
  for (const [ key, value ] of new FormData(evt.target)) {
    if (value) {
      formData.append(key, value);
      // console.log('key', key);
      // console.log('value', value);
    }
  }
  // return
  try {
    const response = await requestForm({
      url: url,
      formData: formData,
      method: "POST",
    });
    if (response.success) {

      console.log('response.data', response.data);
    }

  } finally {
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
  margin: 15px auto auto;
}
</style>
