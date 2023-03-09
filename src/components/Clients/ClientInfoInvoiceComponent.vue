<template>
  <q-table
    :rows="items"
    key="id"
    :columns="invoiceColumns"
    v-show="tab === 'invoice'"
    no-data-label="Список счетов пуст"
    :pagination="{sortBy: 'id', descending: true}"
  >
    <template v-slot:top-left>
      <q-btn
        label="Добавить"
        color="positive"
        size="md"
        @click="createMode = true"
      />
    </template>
    <template v-slot:body="props">
      <q-tr q-tr :props="props" :class="invoiceRowClassSpecifier(props.row)">
        <q-td key="actions" :props="props" class="table-actions">
          <EditIconComponent @click="showEditDialog(props.row)" />
          <DeleteIconComponent @click="showDeleteDialog(props.row)" />
        </q-td>
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="date_at" :props="props">
          {{ dayjs(props.row.date_at, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
        </q-td>
        <q-td key="start_at" :props="props">
          {{ props.row.start_at }}
        </q-td>
        <q-td key="end_at" :props="props">
          {{ dayjs(props.row.end_at, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
        </q-td>
        <q-td key="amount" :props="props">
          {{ props.row.amount }}
        </q-td>
        <q-td key="paid" :props="props">
          {{ props.row.paid }}
        </q-td>
        <q-td key="number" :props="props">
          {{ props.row.number }}
        </q-td>
        <q-td key="file" :props="props">
          <q-chip
            square
            icon="description"
            clickable
            @click.stop="fileClickHandler(props.row.file)"
          >
            {{ props.row.file.name }}
          </q-chip>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DraggableDialog v-model="dialog" :title="dialogTitle" @onHide="onHideDialog(invoice)">
    <q-form @submit.prevent="submitHandler" style="width: 80%;">
      <h3 class="q-mx-auto text-center" v-if="deleteMode">
        Удалить счёт?
        <br />
        <span class="selected-words text-amber-9 text-center">№ {{ invoice.id.value }}</span>
      </h3>
      <div v-else>
        <DateTimePicker
          v-for="field in Object.values(invoice).filter(item => item.isDate)"
          :key="field.attributes.name"
          v-model="field.value"
          v-bind="field.attributes"
          @blur="blurred(invoice, field.attributes.name)"
          class="dialog-input"
          :without-time="true"
        />
        <FieldInput
          v-for="field in Object.values(invoice).filter(filterInvoiceInputs)"
          :key="field.attributes.name"
          v-model="field.value"
          :field="field"
          @blur="field.blurred = true"
        />
        <q-select
          v-if="editMode"
          v-model="invoice.type.value"
          v-bind="invoice.type.attributes"
          class="dialog-input"
          :options="invoiceTypeOptions"
          option-label="label"
          option-value="value"
          map-options
          emit-value
        />
        <q-file
          v-model="invoice.file.value"
          v-bind="invoice.file.attributes"
          :rules="[...Object.values(invoice.file.validators)]"
          error-message="Поле не может быть пустым"
          :disable="waitingResponse"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
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
import { computed, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import FieldInput from "components/FieldInput";
import { useObject } from "src/hooks/useObject";
import DateTimePicker from "components/DateTimePicker";
import { useUtilsStore } from "stores/utils";
import { apiRoutes, requestForm, requestJson } from "src/api";
import { refreshFields, blurred, setFields } from "src/utils/object";
import { required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";
import dayjs from "dayjs";


const props = defineProps(['tab', 'client', 'modelValue']);

const emits = defineEmits(["update:modelValue"]);/*  */

const items = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const invoiceColumns = [
  { name: 'actions', label: 'Действия', field: 'actions', sortable: false, align: "left", editable: false, readonly: true, },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_at', label: 'Дата', field: 'date_at', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'start_at', label: 'Дата начала', field: 'start_at', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'end_at', label: 'Дата окончания', field: 'end_at', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'amount', label: 'Сумма', field: 'amount', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'paid', label: 'Выплачено', field: 'paid', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'number', label: 'Номер', field: 'number', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'file', label: 'Файл', field: 'file', sortable: false, align: "center", editable: false, readonly: true, },
];

const invoiceTypeOptions = [
  { value: 0, label: 'Неоплачен ❌' },
  { value: 1, label: 'Частично оплачен 🟡' },
  { value: 2, label: 'Оплачен ✅' },
];

const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);

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
  return `${label} счёта`;
});
const submitButtonLabel = computed(() => {
  let label = '';
  if (createMode.value) label = 'Добавить';
  if (editMode.value) label = 'Сохранить';
  if (deleteMode.value) label = 'Удалить';
  return label;
});

const invoice = useObject({
  id: {
    value: '',
  },
  date_at: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "date_at",
      label: "Дата",
    },
  },
  start_at: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "start_at",
      label: "Дата начала",
    },
  },
  end_at: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "end_at",
      label: "Дата окончания",
    },
  },
  amount: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    input: true,
    attributes: {
      name: "amount",
      label: "Сумма",
      type: "number",
    },
  },
  paid: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    input: true,
    attributes: {
      name: "paid",
      label: "Выплачено",
      type: "number",
    },
  },
  number: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    input: true,
    attributes: {
      name: "number",
      label: "Номер",
      type: "number",
    },
  },
  type: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    attributes: {
      name: "type",
      label: "Тип",
      type: "number",
    },
  },
  file: {
    value: null,
    blurred: false,
    validators: {
      required,
    },
    attributes: {
      label: "Выберите файл",
      name: "file",
      outlined: true,
      clearable: true,
    }
  },
});


const submitHandler = evt => {
  createMode.value && createInvoice(evt);
  editMode.value && editInvoice(evt);
  deleteMode.value && deleteInvoice(evt);
};

const editInvoice = async () => {
  const formData = new FormData();
  formData.append("corner_id", props.client.id);
  for (const [key, innerObject] of Object.entries(invoice)) {
    if (innerObject.edited) {
      formData.append(key, innerObject.value);
    }
  }
  const url = `${apiRoutes.invoice}/${invoice.id.value}`;
  try {
    const response = await requestForm({
      url,
      formData,
      method: "PUT",
    });
    if (response.success) {
      const invoiceIndex = items.value.findIndex(item => item.id === invoice.id.value);
      items.value[invoiceIndex] = { ...response.data };
    }
  } finally {
    dialog.value = false;
  }
};

const deleteInvoice = async () => {
  const url = `${apiRoutes.invoice}/${invoice.id.value}`;
  try {
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response.success) {
      items.value = items.value.filter(item => item.id !== invoice.id.value);
    }
  } finally {
    dialog.value = false;
  }

};

const createInvoice = async (evt) => {
  const formData = new FormData(evt.target);
  formData.append("corner_id", props.client.id);
  formData.append("type", '0');
  try {
    const response = await requestForm({
      url: apiRoutes.invoice,
      formData
    });
    if (response.success) {
      items.value = [...items.value, response.data];
    }
  } finally {
    dialog.value = false;
  }
};

const showEditDialog = item => {
  setFields(item, invoice);
  editMode.value = true;
};

const showDeleteDialog = item => {
  invoice.id.value = item.id;
  deleteMode.value = true;
};

const onHideDialog = (object) => {
  refreshFields(object);
};

const fileClickHandler = (file) => {
  window.open(file.url, '_blank');
};

const filterInvoiceInputs = item => {
  if (createMode.value) {
    return item.input && item.attributes.name !== "paid";
  }
  return item.input;
};

const invoiceRowClassSpecifier = (row) => {
  switch (row.type) {
    case 0:
      return 'invoice-row-unpaid';
    case 1:
      return 'invoice-row-partially-paid';
    case 2:
      return 'invoice-row-paid';
  }
};
</script>

<style scoped>
.invoice-row-unpaid {
  background-color: rgb(249, 206, 211);
}

.invoice-row-partially-paid {
  background-color: rgb(253, 255, 216);
}

.invoice-row-paid {
  background-color: rgb(192, 255, 228);
}

</style>
