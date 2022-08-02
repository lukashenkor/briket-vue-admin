<template>
  <q-table
    :rows="items"
    key="id"
    :columns="goalsColumns"
    v-show="tab === 'goals'"
    no-data-label="Список целей пуст"
  >
    <template v-slot:top-left>
      <q-btn
        label="Добавить"
        color="positive"
        size="md"
        @click="null"
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="date_start" :props="props">
          {{ props.row.date_start }}
        </q-td>
        <q-td key="date_end" :props="props">
          {{ props.row.date_end }}
        </q-td>
        <q-td key="goal" :props="props">
          {{ props.row.goal }}
        </q-td>
        <q-td key="actions" :props="props" class="table-actions">
          <q-icon name="edit" color="warning" size="sm" @click="showEditDialog(props.row)" />
          <q-icon name="delete" color="negative" size="sm" @click="showDeleteDialog(props.row)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
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

const goalsColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_start', label: 'Дата начала', field: 'date_start', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_end', label: 'Дата окончания', field: 'date_end', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'goal', label: 'Цель', field: 'goal', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', sortable: false, align: "left", editable: false, readonly: true, },
];

const showEditDialog = item => {
  console.log('item', item);
};

const showDeleteDialog = item => {
  console.log('item', item);
};
</script>

<style scoped>

</style>
