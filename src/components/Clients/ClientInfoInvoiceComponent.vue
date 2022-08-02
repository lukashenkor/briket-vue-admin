<template>
  <q-table
    :rows="items"
    key="id"
    :columns="invoiceColumns"
    v-show="tab === 'invoice'"
    no-data-label="Список счетов пуст"
  >
    <template v-slot:top-left>
      <q-btn
        label="Добавить"
        color="positive"
        size="md"
        @click="createDialog = true"
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="date" :props="props">
          {{ props.row.date }}
        </q-td>
        <q-td key="date_start" :props="props">
          {{ props.row.date_start }}
        </q-td>
        <q-td key="date_end" :props="props">
          {{ props.row.date_end }}
        </q-td>
        <q-td key="summ" :props="props">
          {{ props.row.summ }}
        </q-td>
        <q-td key="payed" :props="props">
          {{ props.row.payed }}
        </q-td>
        <q-td key="number" :props="props">
          {{ props.row.number }}
        </q-td>
        <q-td key="type" :props="props">
          {{ props.row.type }}
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
        <q-td key="actions" :props="props" class="table-actions">
          <q-icon name="edit" color="warning" size="sm" @click="showEditDialog(props.row)" />
          <q-icon name="delete" color="negative" size="sm" @click="showDeleteDialog(props.row)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DraggableDialog v-model="createDialog" min-height="300" title="Создание счёта" @onHide="onHideDialog(invoice)">
    <DateTimePicker
      v-for="field in Object.values(invoice).filter(item => item.isDate)"
      :key="field.attributes.name"
      v-model="field.value"
      v-bind="field.attributes"
      @blur="blurred(invoice, field.attributes.name)"
      class="dialog-input"
    />
    <q-input
      v-for="field in Object.values(invoice).filter(item => item.input)"
      :key="field.attributes.name"
      v-model="field.value"
      v-bind="field.attributes"
      class="dialog-input"
      @blur="blurred(invoice, field.attributes.name)"
      :error="!field.valid && field.blurred"
      :error-message="field.errors.required ? 'Поле не может быть пустым' : ''"
    />
  </DraggableDialog>

  <DraggableDialog v-model="editDialog" min-height="300" title="Редактирование счёта" @onHide="onHideDialog(invoice)">

  </DraggableDialog>

  <DraggableDialog v-model="deleteDialog" min-height="300" title="Удаление счёта" @onHide="onHideDialog(invoice)">

  </DraggableDialog>

</template>

<script setup>
import { ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import { useObject } from "src/hooks/useObject";
import DateTimePicker from "components/DateTimePicker";


const props = defineProps({
  tab: {
    type: String,
    default: ""
  },
  client: {
    type: Object,
    default: null,
  },
  items: {
    type: Array,
    default: null,
  }
});

const invoiceColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date', label: 'Дата', field: 'date', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_start', label: 'Дата начала', field: 'date_start', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_end', label: 'Дата окончания', field: 'date_end', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'summ', label: 'Сумма', field: 'summ', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'payed', label: 'Выплачено', field: 'payed', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'number', label: 'Number', field: 'number', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'type', label: 'Тип', field: 'type', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'file', label: 'Файл', field: 'file', sortable: false, align: "center", editable: false, readonly: true, },
  { name: 'actions', label: 'Действия', field: 'actions', sortable: false, align: "left", editable: false, readonly: true, },
];

const deleteDialog = ref(false);
const editDialog = ref(false);
const createDialog = ref(false);

const required = val => !!val;
const invoice = useObject({
  id: {
    value: '',
    prevValue: '',
  },
  date: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "date",
      label: "Дата",
    },
  },
  date_start: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "date_start",
      label: "Дата начала",
    },
  },
  date_end: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    isDate: true,
    attributes: {
      name: "date_end",
      label: "Дата окончания",
    },
  },
  summ: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    input: true,
    attributes: {
      name: "summ",
      label: "Сумма",
      type: "number",
    },
  },
  payed: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    input: true,
    attributes: {
      name: "payed",
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
      label: "Number",
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
    input: true,
    attributes: {
      name: "type",
      label: "Тип",
      type: "number",
    },
  },
  file: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
  },
});

const blurred = (object, field) => {
  object[field].blurred = true;
};

const showEditDialog = item => {
  console.log('item', item);
};

const showDeleteDialog = item => {
  console.log('item', item);
};

const onHideDialog = (object) => {
  console.log('object', object);
};

const fileClickHandler = (file) => {
  window.open(file.url, '_blank');
}
</script>

<style scoped>

</style>
