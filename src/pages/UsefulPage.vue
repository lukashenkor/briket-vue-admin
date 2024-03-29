<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <CardTabsComponent
    v-if="!fetching && tab"
    :items="items"
    :fetching="virtualPagination"
    v-model="tab"
    @addItemClick="addItemClick"
    @editItemClick="editItemClick"
    @deleteItemClick="deleteItemClick"
    @intersection="onIntersection"
  />
  <DraggableDialog v-model="editItemDialog" title="Редактирование">
    <q-form @submit.prevent="editConfirm" class="q-gutter-md fit" >
      <div class="add-item-body">
        <q-input v-for="item in items[tab].fields.inputs" :key="item.name" v-bind="item" v-model="selectedItem.value[item.name]" />
        <q-file v-bind="items[tab].fields.uploader" v-model="selectedItem.value[items[tab].fields.uploader.name]" >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </div>

      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
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
    <h3>Удалить {{ tabTitles[tab] }}?
      <br />
      <span class="selected-words text-blue-grey-9">
        {{ `${selectedItem.value.title}` }}
      </span>
    </h3>
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
    <q-form @submit.prevent="addNewItem" class="q-gutter-md fit" method="post" enctype="multipart/form-data">
      <div class="add-item-body">
        <q-input v-for="item in items[tab].fields.inputs" :key="item.name" v-bind="item" v-model="newItem[item.name]" />
        <q-file v-bind="items[tab].fields.uploader" v-model="newItem[items[tab].fields.uploader.name]" >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
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
import { onMounted, ref, reactive, computed } from "vue";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import DraggableDialog from "components/DraggableDialog";
import { apiRoutes, requestForm, requestJson } from "src/api";
import { useUtilsStore } from "stores/utils";
import { useUserStore } from "stores/user";
import { required } from "src/utils/validators";


const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const fetching = ref(true);
const tab = ref();
const virtualPagination = ref(false);
const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);


const fetchLimit = 10;
const onIntersection = async (entry) => {
  if (!entry.isIntersecting) return;
  const tabName = tab.value;
  if (!items[tabName].requestOffset) return;

  try {
    virtualPagination.value = true;
    const response = await requestJson({
      url: apiRoutes[tabName],
      params: {
        offset: items[tabName].requestOffset,
        limit: fetchLimit,
      }
    });
    if (response.success) {
      if (response.data?.length === fetchLimit) {
        items[tabName].requestOffset += fetchLimit;
      } else {
        items[tabName].requestOffset = null;
      }
      items[tabName].data = [...items[tabName].data, ...response.data];
    }
  } finally {
    virtualPagination.value = false;
  }
};

const initParams = {
  offset: 0,
  limit: fetchLimit,
}

const items = reactive({
  "promo": {
    name: 'promo',
    label: 'Акции',
    lines: 2,
    icon: 'campaign',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
        {"label": "Превью", "name": "preview", "type": "text"},
        {"label": "Текст", "name": "text", "type": "textarea"},
      ],
      uploader: {
        label: "Выберите изображение",
        name: "img",
        outlined: true,
        clearable: true,
        accept: ".jpg, .jpeg, .png",
        rules: [required],
        "error-message": "Изображение не выбрано",
      },
    },
    role: "additional-promo",
    requestOffset: 0,
    url: apiRoutes.promo,
    params: initParams,
  },
  "guides": {
    name: 'guides',
    label: 'Гайды',
    lines: 2,
    icon: 'menu_book',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
      ],
      uploader: {label: "Выберите файлы", name: "files", outlined: true, clearable: true, multiple: true,},
    },
    role: "additional-guides",
    requestOffset: 0,
    url: apiRoutes.guides,
    params: initParams,
  },
  "knowledge": {
    name: 'knowledge',
    label: 'База знаний',
    lines: 2,
    icon: 'school',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
        {"label": "Текст", "name": "text", "type": "textarea"}
      ],
      uploader: {label: "Выберите файлы", name: "files", outlined: true, clearable: true, multiple: true,},
    },
    role: "additional-knowledge",
    requestOffset: 0,
    url: apiRoutes.knowledge,
    params: initParams,
  },
  "additionalReports": {
    name: 'additionalReports',
    label: 'Отчёты',
    lines: 2,
    icon: 'receipt_long',
    editable: true,
    deletable: true,
    addable: true,
    fields: {
      inputs: [
        {"label": "Заголовок", "name": "title", "type": "text"},
      ],
      uploader: {label: "Выберите файлы", name: "files", outlined: true, clearable: true, multiple: true,},
    },
    role: "additional-reports",
    requestOffset: 0,
    url: apiRoutes.additionalReports,
    params: initParams,
  },
});

const tabTitles = {
  guides: 'гайд',
  promo: 'акцию',
  knowledge: 'базу знаний',
  additionalReports: 'отчёт',
};

onMounted(() => {
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

        items[response.name].data = response.data;
        items[response.name].requestOffset = response.data?.length < fetchLimit ? null : items[response.name].requestOffset + fetchLimit;
        items[response.name].count = response.data.count;
      })
      fetching.value = false;
    });
});

const selectedItem = reactive({});
const addItemDialog = ref(false);
const editItemDialog = ref(false);
const deleteItemDialog = ref(false);

const addItemClick = () => {
  for (const key of Object.keys(newItem)) {
    newItem[key] = null;
  }
  addItemDialog.value = true;
};

const newItem = reactive({});
const addNewItem = async (evt) => {
  const formData = new FormData(evt.target);
  if (formData.has('files') && (!formData.getAll('files')[0].size && !formData.getAll('files')[0].name)) {
    formData.delete('files')
  }
  try {
    const response = await requestForm({
      url: apiRoutes[tab.value],
      formData: formData,
    });
    if (response.success) {
      items[tab.value].data = [response.data, ...items[tab.value].data];
      items[tab.value].requestOffset += 1;
      items[tab.value].count += 1;
    }
  } finally {
    addItemDialog.value = false;
  }
};


const editItemClick = item => {
  selectedItem.value = Object.assign({}, item);
  if (item.hasOwnProperty('img')) {
    selectedItem.value.img = null;
  } else {
    selectedItem.value.files = null;
  }
  editItemDialog.value = true;
};

const editConfirm = async (evt) => {
  const formData = new FormData(evt.target);
  const fileObjectKey = selectedItem.value.hasOwnProperty("img")
    ? "img"
    : "files";
  if (!formData.get(fileObjectKey)?.__key) {
    formData.delete(fileObjectKey);
  }
  const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
  try {
    const response = await requestForm({
      url,
      formData,
      method: "PUT",
    });
    if (response.success) {
      const updatedItemIndex = items[tab.value].data.findIndex(item => item.id === selectedItem.value.id);
      items[tab.value].data[updatedItemIndex] = response.data;
    }
  } finally {
    editItemDialog.value = false;
  }
};


const deleteItemClick = item => {
  selectedItem.value = item;
  deleteItemDialog.value = true;
};

const deleteConfirm = async () => {
  try {
    const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response.success) {
      items[tab.value].data = items[tab.value].data.filter(item => item.id !== selectedItem.value.id);
      items[tab.value].count -= 1;
    }
  } finally {
    deleteItemDialog.value = false;
  }

};
</script>

<style scoped>
.add-item-body > * {
  margin-top: 15px;
}
</style>
