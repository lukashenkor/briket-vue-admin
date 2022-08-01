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
    <h3>Удалить {{ tabTitles[tab] }}?
      <br />
      <span class="selected-words text-blue-grey-9">
        {{ `${selectedItem.value.id} ${selectedItem.value.title}` }}
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
import { onMounted, ref, reactive } from "vue";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import DraggableDialog from "components/DraggableDialog";
import { apiRoutes, requestForm, requestJson } from "src/api";


const waitingResponse = ref(false);
const fetching = ref(true);
const tab = ref('promo');
const items = reactive({
  "promo": {
    name: 'promo',
    label: 'Акции',
    lines: 0,
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
      uploader: {label: "Выберите изображение", name: "img", outlined: true, clearable: true, accept: ".jpg, .jpeg, .png"},
    },
  },
  "guides": {
    name: 'guides',
    label: 'Гайды',
    lines: 0,
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
  },
  "knowledge": {
    name: 'knowledge',
    label: 'База знаний',
    lines: 0,
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
  },
});

const tabTitles = {
  guides: 'гайд',
  promo: 'акцию',
  knowledge: 'базу знаний',
};

onMounted(() => {
  const defaultGetParams = {
    offset: 0,
    limit: 20,
  };

  Promise.all([
    requestJson({
      url: apiRoutes.promo,
      params: defaultGetParams,
    }),
    requestJson({
      url: apiRoutes.guides,
      params: defaultGetParams,
    }),
    requestJson({
      url: apiRoutes.knowledge,
      params: defaultGetParams,
    }),
  ])
    .then(([promoResponse, guidesResponse, knowledgeResponse]) => {
      fetching.value = false;
      console.log('promoResponse', promoResponse);
      console.log('guidesResponse', guidesResponse);
      console.log('knowledgeResponse', knowledgeResponse);

      promoResponse.success && (items.promo.data = promoResponse.data);
      guidesResponse.success && (items.guides.data = guidesResponse.data);
      knowledgeResponse.success && (items.knowledge.data = knowledgeResponse.data);

    });
});

const selectedItem = reactive({});
const addItemDialog = ref(false);
const editItemDialog = ref(false);
const deleteItemDialog = ref(false);

const listItemClick = item => {
  console.log('listItemClick - item', item);
};

const addItemClick = () => {
  for (const key of Object.keys(newItem)) {
    newItem[key] = null;
  }
  addItemDialog.value = true;
};

const newItem = reactive({});
const addNewItem = async (evt) => {
  console.log('addNewItem');
  const formData = new FormData(evt.target);
  try {
    waitingResponse.value = true;
    await requestForm({
      url: apiRoutes[tab.value],
      formData: formData,
    });
  //  TODO: Принимать ответ от сервера с новыми данными и добавлять их на странице
  } finally {
    addItemDialog.value = false;
    waitingResponse.value = false;
  }
};


const editItemClick = item => {
  console.log('editItemClick', item);
  selectedItem.value = Object.assign({}, item);
  if (item.hasOwnProperty('img')) {
    selectedItem.value.img = null;
  } else {
    selectedItem.value.files = null;
  }
  editItemDialog.value = true;
};

const editConfirm = async (evt) => {
  console.log('editConfirm');
  const formData = new FormData(evt.target);
  if (!formData.get("files")?.__key) {
    formData.delete("files");
  }
  const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
  try {
    waitingResponse.value = true;
    await requestForm({
      url,
      formData,
      method: "PUT",
    });

  } finally {
    editItemDialog.value = false;
    waitingResponse.value = false;
  }
};


const deleteItemClick = item => {
  console.log('deleteItemClick - item', item);
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
    if (response.success) {
      items[tab.value].data = items[tab.value].data.filter(item => item.id !== selectedItem.value.id);
    }
  } finally {
    deleteItemDialog.value = false;
    waitingResponse.value = false;
  }

};
</script>

<style scoped>
.add-item-body > * {
  margin-top: 15px;
}
</style>
