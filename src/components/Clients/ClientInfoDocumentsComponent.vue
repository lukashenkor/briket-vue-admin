<template>
  <q-table
    :rows="items"
    key="id"
    :columns="documentsColumns"
    v-show="tab === 'documents'"
    no-data-label="Список документов пуст"
    :pagination="{sortBy: 'id', descending: true}"
  >
  <template v-slot:top-left>
    <q-btn 
      label="Изменить"
      color="warning"
      size="md"
      @click="openModalHandler"
    />
  </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="name" :props="props">
         {{ props.row.name }}
        </q-td>
        <q-td key="status" :props="props">
          {{ props.row.status ? '✅' : '⭕️' }}
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DraggableDialog v-model="updateDocumentsModal" min-height="300" title="Изменение документов" @onHide="onHideDialog(selectedDocuments)">
    <q-form @submit.prevent="submitHandler" style="width: 80%;">
      <div>
        <q-select
          v-model="selectedDocuments"
          class="dialog-input"
          :options="items"
          multiple
          options-dense
          use-chips
          :option-value="opt => Object(opt) === opt && 'id' in opt ? opt.id : null"
          :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : opt.id"
          map-options
          emit-value
          label="Список документов клиента"
        >
          <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label > {{ opt.name }} </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
</template>

<script setup>
import DraggableDialog from "components/DraggableDialog";
import { computed, ref } from "vue";
import { useUtilsStore } from "stores/utils";
import { apiRoutes, requestJson } from "src/api";

const props = defineProps([ "tab", "client", "modelValue" ]);

const emits = defineEmits([ "update:modelValue" ]);

const items = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const documentsColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'name', label: 'Наименование', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'status', label: 'Статус', field: 'status', sortable: true, align: "center", editable: true, readonly: false, },
];
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);

const updateDocumentsModal = ref(false);

const selectedDocuments = ref();

const openModalHandler = () => {
  selectedDocuments.value = items.value.filter(item => item.status).map(item => item.id)
  updateDocumentsModal.value = true
}

const submitHandler = async () => {
  const url = `${apiRoutes.cornerDocument.replace('[id]', props.client.id)}`
  const body = {
    document_ids: selectedDocuments.value
  }
  try {
    const response = await requestJson({
      url,
      body,
      method: "PUT",
    });

    if (response.success) {
      items.value = items.value.map(item => ({
        ...item,
        status: selectedDocuments.value.includes(item.id)
      }))
    }

  } finally {
    updateDocumentsModal.value = false;
  }
};

const onHideDialog = () => {
  selectedDocuments.value = [];
};

</script>
