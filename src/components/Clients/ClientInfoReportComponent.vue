<template>
  <q-table
    :rows="items"
    key="id"
    :columns="invoiceColumns"
    v-show="tab === 'report'"
    no-data-label="Список счетов пуст"
    :pagination="{sortBy: 'date', descending: true}"
    :loading="loading"
    loading-label="Загрузка данных"
  >
    <template v-slot:top-left>
      <p style="margin: 0; color:#4f4f4f;">Период отчётности:</p>
      <month-picker-input
        style="z-index: 100"
        clearable
        show-year
        :default-month="defaultDate.month"
        :default-year="defaultDate.year"
        lang="ru"
        @input="onMonthPickerInput"
        placeholder="Период отчётности"
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="date" :props="props">
         {{ dayjs(props.row.date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
        </q-td>
        <q-td key="summ" :props="props">
          {{ props.row.summ }}
        </q-td>
        <q-td key="checks" :props="props">
          {{ props.row.checks }}
        </q-td>
        <q-td key="img" :props="props">
          <q-chip
            square
            icon="description"
            clickable
            @click.stop="fileClickHandler(props.row.img)"
          >
            {{ props.row.img.name }}
          </q-chip>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from "vue";
import { MonthPickerInput } from "vue-month-picker";
import dayjs from "dayjs";

const props = defineProps(['tab', 'client', 'modelValue', 'loading']);

const emits = defineEmits([ "update:modelValue", "onMonthPickerInput" ]);/*  */

const items = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val),
});

const invoiceColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'date', label: 'Дата', field: 'date', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'summ', label: 'Сумма', field: 'summ', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'checks', label: 'Чеки', field: 'checks', sortable: true, align: "left", editable: false, readonly: true, },
  { name: 'img', label: 'Изображение', field: 'img', sortable: false, align: "left", editable: false, readonly: true, },
];

const defaultDate = {
  month: dayjs().month() + 1,
  year: dayjs().year(),
};

const fileClickHandler = (file) => {
  window.open(file.url, '_blank');
};

const onMonthPickerInput = obj => {
  const dayjsObject = dayjs(`${obj.year}-${obj.monthIndex}`, 'YYYY-MM');
  emits("onMonthPickerInput", dayjsObject);
}
</script>

<style scoped>

</style>
