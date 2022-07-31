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
<!--  <q-card bordered class="my-card bg-white">
    <q-card-section class="bg-grey my-card-section">
      <q-tabs
        v-model="tab"
        narrow-indicator
        dense
        align="justify"
        class="bg-grey text-white fit"
      >
        <q-tab :ripple="false" name="promotions" icon="campaign" label="Акции">
          <q-badge color="blue-7" text-color="white" floating>{{ promotionsCount }}</q-badge>
        </q-tab>
        <q-tab :ripple="false" name="guides" icon="menu_book" label="Гайды">
          <q-badge color="blue-7" text-color="white" floating>{{ guidesCount }}</q-badge>
        </q-tab>
        <q-tab :ripple="false" name="knowledge" icon="school" label="База знаний" >
          <q-badge color="blue-7" text-color="white" floating>{{ knowledgeBaseCount }}</q-badge>
        </q-tab>
      </q-tabs>
    </q-card-section>

    <q-card-section>
      <h3>{{ tabTitles[tab] }}</h3>
      <q-btn
        class="q-my-md"
        label="Добавить"
        color="positive"
        @click="addItemDialog = true"
      />
      <q-separator/>
      <div class="promotions" v-show="tab && tab === 'promotions'">
        <ListComponent :items="promotions"  editable deletable @listItemClick="listItemClick" @editItemClick="editItemClick" @deleteItemClick="deleteItemClick"/>
      </div>
      <div class="guides" v-show="tab && tab === 'guides'">
        <ListComponent :items="guides" editable deletable @listItemClick="listItemClick" @editItemClick="editItemClick" @deleteItemClick="deleteItemClick"/>
      </div>
      <div class="knowledge" v-show="tab && tab === 'knowledge'">
        <ListComponent :items="knowledgeBase" editable deletable @listItemClick="listItemClick" @editItemClick="editItemClick" @deleteItemClick="deleteItemClick"/>
      </div>
    </q-card-section>-->

  <DraggableDialog v-model="editItemDialog" title="Редактирование">
    <q-form @submit.prevent="editConfirm" class="q-gutter-md fit" >
      <div class="add-item-body">
        <q-input v-for="item in items[tab].fields.inputs" :key="item.name" v-bind="item" v-model="selectedItem.value[item.name]" />
        <q-file v-bind="items[tab].fields.uploader" v-model="selectedItem.value[items[tab].fields.uploader.name]" >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
<!--        <q-input
          name="title"
          maxlength="200"
          v-model="selectedItem.value.title"
          label="Заголовок"
          type="text"
        />
        <br />
        <q-input
          v-if="tab !== 'promo'"
          name="text"
          v-model="selectedItem.value.text"
          label="Текст"
          type="textarea"
        />
        <br />
        <q-file
          v-model="selectedItem.value.files"
          label="Выберите файлы"
          multiple
          name="files"
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
<!--        <q-input
          name="title"
          maxlength="200"
          v-model="newItem.title"
          label="Заголовок"
          type="text"
        />
        <br />
        <q-input
          v-if="tab !== 'promo'"
          name="text"
          v-model="newItem.text"
          label="Текст"
          type="textarea"
        />
        <br />
        <q-file
          v-model="newItem.files"
          label="Выберите файл"
          :name="tab !== 'promo' ? 'files' : 'img'"
          :multiple="tab !== 'promo'"
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
      uploader: {label: "Выберите изображение", name: "img", outlined: true, clearable: true},
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
    .then(([promoRequest, guidesRequest, knowledgeRequest]) => {
      fetching.value = false;
      console.log('promoRequest', promoRequest);
      console.log('guidesRequest', guidesRequest);
      console.log('knowledgeRequest', knowledgeRequest);

      promoRequest.success && (items.promo.data = promoRequest.data);
      guidesRequest.success && (items.guides.data = guidesRequest.data);
      knowledgeRequest.success && (items.knowledge.data = knowledgeRequest.data);

    });
});

const selectedItem = reactive({});
const addItemDialog = ref(false);
const editItemDialog = ref(false);
const deleteItemDialog = ref(false);

const listItemClick = item => {
  console.log('listItemClick - item', item);
};

const newItem = reactive({});
const addNewItem = async (evt) => {
  console.log('addNewItem');
  const formData = new FormData(evt.target);
  const response = await requestForm({
    url: apiRoutes[tab.value],
    formData: formData,
  });

  console.log('response', response);
};


const editItemClick = item => {
  console.log('editItemClick', item);
  selectedItem.value = Object.assign({}, item);
  console.log('Object.values(selectedItem.files)', selectedItem.value.files);
  editItemDialog.value = true;
};

const editConfirm = async (evt) => {
  console.log('editConfirm');
  const formData = new FormData(evt.target);
  const url = `${apiRoutes[tab.value]}/${selectedItem.value.id}`;
  const file = new File()
  const response = await requestForm({
    url,
    formData,
    method: "PUT",
  });
  console.log('response', response);
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
    deleteItemDialog.value = false;
    if (response.success) {
      items[tab.value].data = items[tab.value].data.filter(item => item.id !== selectedItem.value.id);
    }
  } finally {
    waitingResponse.value = false;
  }

};

/* const promoCount = computed(() => promo.value.length);
const guidesCount = computed(() => guides.value.length);
const knowledgeBaseCount = computed(() => knowledgeBase.value.length); */
</script>

<style scoped>
.add-item-body > * {
  margin-top: 15px;
}
</style>
