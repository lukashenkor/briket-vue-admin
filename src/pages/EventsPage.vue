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

          <DateTimePicker v-for="datePicker in items[tab].fields.dateTimePicker" :key="datePicker.name" v-bind="datePicker" v-model="selectedItem.value[datePicker.name]"/>
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
          <q-file 
            v-if="items[tab].fields.uploader" 
            v-bind="items[tab].fields.uploader" 
            v-model="newItem[items[tab].fields.uploader.name]" 
            :rules="[(val) => val || 'Выберите файл']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-slider v-if="items[tab].fields.slider" v-bind="items[tab].fields.slider" v-model="newItem[items[tab].fields.slider.name]"/>
          <DateTimePicker v-for="datePicker in items[tab].fields.dateTimePicker" :key="datePicker.name" v-bind="datePicker" v-model="newItem[datePicker.name]"/>
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
import { useUserStore } from "stores/user";
import { required } from "src/utils/validators";
import DateTimePicker from "components/DateTimePicker";


const utilsStore = useUtilsStore();
const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);
const waitingResponse = computed(() => utilsStore.waitingResponse);
const fetching = ref(true);
const tab = ref();
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
          "error-message": "Введите заголовок новости",
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
          "error-message": "Введите текст новости",
        },
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true},
      dateTimePicker: [{label: "Укажите дату", withoutTime: false, name: "publish_at"}]
    },
    role: "news",
    url: apiRoutes.news,
    params: {},
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
          "error-message": "Введите заголовок события",
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
          "error-message": "Введите текст события",
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
      dateTimePicker: [
        {label: "Укажите дату публикации", withoutTime: true, name: "publish_at"},
        {label: "Укажите дату окончания", withoutTime: true, name: "expire_at", rules: []},
      ]
    },
    role: "alerts",
    url: apiRoutes.alerts,
    params: {
      offset: 0,
      limit: 500,
    },
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
          "error-message": "Введите заголовок события",
        },
        {
          "label": "Текст",
          "name": "text",
          "type": "textarea",
          "rules": [required],
          "error-message": "Введите текст события",
        },
      ],
      uploader: {label: "Выберите изображение", accept: ".jpg, .jpeg, .png", name: "img", outlined: true, clearable: true},
      dateTimePicker: [
        { label: "Укажите дату публикации", withoutTime: true, name: "publish_at" },
        { label: "Укажите дату окончания", withoutTime: true, name: "expire_at" }
      ],
      // dateTimePicker: {label: "Укажите дату", withoutTime: true, name: "expire_at"}
    },
    role: "events",
    url: apiRoutes.events,
    params: {
      start: "2020-01-01",
      end: dayjs().add(1, 'year').format("YYYY-MM-DD")
    }
  }
});

onMounted( () => {
  const requests = [];
  for (const [ key, inner ] of Object.entries(items)) {
    if (userRoles.value.includes(inner.role)) {
      if (!tab.value) {
        tab.value = key;
      }

      requests.push((requestJson({
        url: inner.url,
        params: inner.params,
        name: key
      })))
    }
  }
  Promise.all(requests)
    .then((responses) => {
      responses.forEach(response => {
        if (!response.success) return

        if (response.name === 'news') {
          items[response.name].data = response?.data?.news?.sort(sortByDate)
        } else {
          items[response.name].data = response?.data?.sort(sortByDate)
        }
      })
    })
    .finally(() => fetching.value = false);
});


const selectedItem = reactive({});
const listItemClick = (item) => {
};

const editItemClick = (item) => {
  selectedItem.value = Object.assign({}, item);
  selectedItem.value.publish_at = dayjs(selectedItem.value.publish_at, 'YYYY-MM-DDTHH:mm:ss').format(items[tab.value].dateDisplayFormat)
  if (selectedItem.value.expire_at) {
    selectedItem.value.expire_at = dayjs(selectedItem.value.expire_at, 'YYYY-MM-DDTHH:mm:ss').format(items[tab.value].dateDisplayFormat)
  }
  delete selectedItem.value.img;
  editItemDialog.value = true;
};

const editConfirm = async (evt) => {
  const formData = new FormData(evt.target);
  for (const [key, value] of formData) {
    if (typeof value === 'string' && !value) {
      formData.delete(key)
    }
  }
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

const sortByDate = (a, b) => dayjs(b.publish_at).isBefore(dayjs(a.publish_at)) ? -1 : 1;

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
