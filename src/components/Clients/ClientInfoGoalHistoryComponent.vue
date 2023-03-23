<template>
  <q-table
    :rows="items"
    key="date_start"
    :columns="goalHistoryColumns"
    v-show="tab === 'goalHistory'"
    no-data-label="История целей пуста"
    :pagination="{sortBy: 'date_start', descending: true}"
  >
    <template v-slot:body="props">
      <q-tr :props="props" :class="goalHistoryClass(props.row)" class="asd">
        <q-td key="date_start" :props="props">
         {{ dayjs(props.row.date_start, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
        </q-td>
        <q-td key="date_end" :props="props">
         {{ dayjs(props.row.date_end, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
        </q-td>
        <q-td key="summ" :props="props">
          {{ props.row.summ }}
        </q-td>
        <q-td key="goal" :props="props">
          {{ props.row.goal }}
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from "vue";
import dayjs from "dayjs";

const props = defineProps(['tab', 'modelValue']);

const dateNow = dayjs();

const items = computed({
  get: () => props.modelValue,
  // set: (val) => emits("update:modelValue", val),
});

const goalHistoryColumns = [
  { name: 'date_start', label: 'Дата начала', field: 'date_start', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'date_end', label: 'Дата окончания', field: 'date_end', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'goal', label: 'Цель', field: 'goal', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'summ', label: 'Сумма', field: 'summ', sortable: true, align: "left", editable: false, readonly: true, },
];

const goalHistoryClass = (row) => {
  if (row.summ >= row.goal) return "goal-history-completed"
  if (dayjs(row.date_end, 'YYYY-MM-DDTHH:mm:ss').isBefore(dateNow)) return "goal-history-expired"
  return "x"
}
</script>
