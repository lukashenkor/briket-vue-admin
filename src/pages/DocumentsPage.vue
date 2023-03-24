<template>
  <q-table
    key="id"
    :rows="documents"
    :columns="documentsColumns"
    no-data-label="Список документов пуст"
    :pagination="{sortBy: 'id', descending: true}"
    :rows-per-page-options="[15, 20, 0]"
  >
    <template v-slot:top-left>
    <q-btn 
      label="Добавить документ"
      color="positive"
      size="md"
      @click="createMode = true"
    />
  </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="actions" :props="props" class="table-actions" auto-width>
          <EditIconComponent @click="showEditDialog(props.row)" />
          <DeleteIconComponent @click="showDeleteDialog(props.row)" />
        </q-td>
        <q-td key="id" :props="props" auto-width>
          {{ props.row.id }}
        </q-td>
        <q-td key="name" :props="props">
        {{ props.row.name }}
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DraggableDialog v-model="dialog" :title="dialogTitle" @onHide="onHideDialog(currentDocument)">
    <q-form @submit.prevent="submitHandler" style="width: 80%;">
      <h3 class="q-mx-auto text-center" v-if="deleteMode">
        Удалить документ?
        <br />
        <span class="selected-words text-amber-9 text-center">{{ currentDocument.name.value }}</span>
      </h3>
      <div v-else>
        <FieldInput
          v-for="field in Object.values(currentDocument).filter(item => item.input)"
          :key="field.attributes.name"
          v-model="field.value"
          :field="field"
          @blur="field.blurred = true"
        />
      </div>

      <div class="dialog-buttons">
        <q-btn
          :label="submitButtonLabel"
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
import { computed, onMounted, ref } from "vue";
import { useUtilsStore } from "stores/utils";
import { requestJson } from "src/api";
import { apiRoutes } from "src/api";
import EditIconComponent from "src/components/EditIconComponent.vue";
import DeleteIconComponent from "src/components/DeleteIconComponent.vue";
import { required } from "src/utils/validators";
import { useObject } from "src/hooks/useObject";
import DraggableDialog from "src/components/DraggableDialog.vue";
import { refreshFields, setFields } from "src/utils/object";
import FieldInput from "src/components/FieldInput.vue";


const documentsColumns = [

{ name: 'actions', label: 'Действия', field: 'actions', sortable: false, align: "center", editable: false, readonly: true, },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'name', label: 'Наименование', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
];
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);

const documents = ref([]);
onMounted(async () => {
  const response = await requestJson({
    url: apiRoutes.documents
  })
  if (response?.success) {
    documents.value = response.data;
  }
});

const editMode = ref(false);
const deleteMode = ref(false);
const createMode = ref(false);
const dialog = computed({
  get: () => editMode.value || deleteMode.value || createMode.value,
  set: () => {
    editMode.value = false;
    deleteMode.value = false;
    createMode.value = false;
  }
});

const dialogTitle = computed(() => {
  let label = '';
  if (editMode.value) label = 'Редактирование';
  if (deleteMode.value) label = 'Удаление';
  if (createMode.value) label = 'Создание';
  return `${label} документа`;
});
const submitButtonLabel = computed(() => {
  let label = '';
  if (createMode.value) label = 'Добавить';
  if (editMode.value) label = 'Сохранить';
  if (deleteMode.value) label = 'Удалить';
  return label;
});

const currentDocument = useObject({
  id: {
    value: '',
  },
  name: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    input: true,
    attributes: {
      name: "name",
      label: "Наименование документа"
    }
  }
});

const submitHandler = () => {
  createMode.value && createDocument();
  editMode.value && editDocument();
  deleteMode.value && deleteDocument();
};

const createDocument = async () => {
  const url = apiRoutes.documents;
  const body = {}
  for (const [key, inner] of Object.entries(currentDocument)) {
    if (key !== 'id') {
      body[key] = inner.value
    }
  }
  try {
    const response = await requestJson({
      url,
      body,
      method: "POST"
    });
    if (response?.success) {
      documents.value = [...documents.value, response.data];
    }
  } finally {
    dialog.value = false;
  }
};

const editDocument = async () => {
  const url = `${apiRoutes.documents}/${currentDocument.id.value}`;
  const body = {};
  for (const [key, inner] of Object.entries(currentDocument)) {
    if (key !== 'id') {
      body[key] = inner.value
    }
  }
  try {
    const response = await requestJson({
      url,
      body,
      method: "PUT"
    });
    if (response?.success) {
      const documentIndex = documents.value.findIndex(item => item.id === response.data.id)
      documents.value[documentIndex] = { ...response.data };
    }
  } finally {
    dialog.value = false;
  }
};

const deleteDocument = async (evt) => {
  const url = `${apiRoutes.documents}/${currentDocument.id.value}`;
  try {
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response?.success) {
      documents.value = documents.value.filter(item => item.id !== currentDocument.id.value)
    }
  } finally {
    dialog.value = false;
  }
};

const showEditDialog = item => {
  setFields(item, currentDocument);
  editMode.value = true;
};

const showDeleteDialog = item => {
  setFields(item, currentDocument);
  deleteMode.value = true;
};

const onHideDialog = (object) => {
  refreshFields(object);
};
</script>
