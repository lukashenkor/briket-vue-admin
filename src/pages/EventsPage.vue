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
import { apiRoutes, requestForm, requestJson } from "src/api";
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
    dateDisplayFormat: "YYYY-MM-DD HH:mm:ss",
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
    dateDisplayFormat: "YYYY-MM-DD",
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
      slider: {
        "label-value": "Приоритет",
        "label": true,
        "name": "priority",
        "min": 1,
        "max": 10,
        markers: true,
        "marker-labels": true,
      },
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
    dateDisplayFormat: "YYYY-MM-DD",
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
  const todayPlusYear = dayjs().add(1, 'year').format("YYYY-MM-DD");
  Promise.all([
    requestJson({
      url: apiRoutes.events,
      params: {
        start: "2020-01-01",
        end: todayPlusYear,
      }
    }),
    requestJson({
      url: apiRoutes.news,
    }),
    requestJson({
      url: apiRoutes.alerts,
      params: {
        offset: 0,
        limit: 500,
      }
    }),
  ])
    .then(([eventsResponse, newsResponse, alertsResponse]) => {
      items.news.data = newsResponse.data.news.sort(sortByDate);
      items.events.data = eventsResponse.data.sort(sortByDate);
      items.alerts.data = alertsResponse.data.sort(sortByDate);
    })
    .finally(() => fetching.value = false);
});


const selectedItem = reactive({});
const listItemClick = (item) => {
};

const editItemClick = (item) => {
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
    const response = await requestForm({
      url,
      formData,
      method: "PUT",
    });
    if (response.success) {
      const updatedItemIndex = items[tab.value].data.findIndex(item => item.id === selId);
      items[tab.value].data[updatedItemIndex] = response.data;
    }
  } finally {
    editItemDialog.value = false;
  }
};


const deleteItemClick = (item) => {
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
  for (const [ key, value ] of new FormData(evt.target)) {
    if (value) {
      formData.append(key, value);
    }
  }
  try {
    const response = await requestForm({
      url: url,
      formData: formData,
      method: "POST",
    });
    if (response.success) {
      items[tab.value].data = [
        ...items[tab.value].data,
        response.data
      ].sort(sortByDate);
    }

  } finally {
    addItemDialog.value = false;
  }
};

const sortByDate = (a, b) => dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1;

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
