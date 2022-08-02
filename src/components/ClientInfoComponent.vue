<template>
  <div class="info-block">
    <div class="info-block__go-back" @click="() => { emits('goBackClick') }">
      <q-icon name="arrow_back" size="40px" />
    </div>
    <div class="info-block__text">
      <q-card bordered class="my-card">
        <q-card-section class="bg-grey text-white my-card-section">
          <div class="text-h6">
            <h5 class="text-center">Информация о клиенте:</h5>
            <p class="text-amber-4 text-center">{{ client?.label }}</p>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <p v-for="item in clientInfo" :key="item.name" class="info-block__item">
            <span>{{ item[0] }}:</span> {{ item[1] }}

<!--            <q-separator inset spaced />-->
          </p>

        </q-card-section>
      </q-card>
    </div>

    <FetchSpinnerComponent :fetching="fetching"/>
    <q-card bordered class="my-card bg-white" v-if="!fetching">
      <q-card-section class="bg-grey my-card-section">
        <q-tabs
          v-model="tab"
          narrow-indicator
          dense
          align="justify"
          class="bg-grey text-white fit"
        >
          <q-tab v-for="item in items" :key="item.name" :name="item.name" :icon="item.icon" :label="item.label">
            <q-badge color="blue-7" text-color="white" floating v-if="item?.data?.length">{{ item?.data?.length }}</q-badge>
          </q-tab>
        </q-tabs>
      </q-card-section>

      <q-table
        :rows="items.invoice.data"
        key="id"
        :columns="invoiceColumns"
        v-show="tab === items.invoice.name"
      >
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
          </q-tr>
        </template>
      </q-table>
      <q-table
        :rows="items.goals.data"
        key="id"
        :columns="goalsColumns"
        v-show="tab === items.goals.name"
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
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { apiRoutes, requestJson } from "src/api";


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
  // { name: 'phoneNumber', label: 'Номер телефона', field: 'phoneNumber', sortable: true, align: "center", readonly: false, },
];

const goalsColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_start', label: 'Дата начала', field: 'date_start', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'date_end', label: 'Дата окончания', field: 'date_end', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'goal', label: 'Цель', field: 'goal', sortable: true, align: "left", editable: true, readonly: false, },
]

const emits = defineEmits(['update:modelValue', 'goBackClick']);
const fetching = ref(false);
const tab = ref('invoice');
const props = defineProps({
  modelValue: {
    type: Object
  }
});

const client = computed({
  get() {
    return props.modelValue ? props.modelValue : {};
  },
  set(newValue) {
    emits("update:modelValue", newValue);
  }
})


const items = reactive({
  invoice: {
    name: "invoice",
    label: "Счета",
    icon: "receipt",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
  },
  goals: {
    name: "goals",
    label: "Цели",
    icon: "flag",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
  },
  deviation: {
    name: "deviation",
    label: "Отклонения",
    icon: "dangerous",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
  }
})

onMounted(() => {
  console.log('ClientInfoComponent is mounted');
  console.log('client', client);

  fetching.value = true;
  Promise.all([
    requestJson({
      url: apiRoutes.invoice,
      params: {
        offset: 0,
        limit: 100,
        status: 0,
      },
    }),
    requestJson({
      url: apiRoutes.goals.replace('[id]', client.value.id),
      params: {
        start: "2020-02-02",
      },
    })
  ])
    .then(([invoiceResponse, goalsResponse]) => {
      console.log('invoiceResponse', invoiceResponse);
      console.log('goalsResponse', goalsResponse);

      items.invoice.data = invoiceResponse.data;
      items.goals.data = goalsResponse.data;
      items.deviation.data = [];
    })
    .finally(() => {
      fetching.value = false;
    });
});

onUnmounted(() => {
  console.log('ClientInfoComponent is unmounted');
});

const fileClickHandler = (file) => {
  window.open(file.url, "_blank");
};

const clientInfo = computed(() => {
  return client?.value
    ? Object.entries(client?.value).filter(([ key, value ]) => {
      return typeof value === "string" || typeof value === "number";
    })
    : [];
});
console.log('clientInfo', clientInfo);
</script>

<style scoped>
.info-block {
  min-height: 30vh;
  max-height: 100%;
  display: flex;
}

.info-block > div {
  margin: 0 15px;
  min-width: 300px;
}

.info-block > .info-block__go-back {
  text-align: center;
  min-width: initial;
  width: 80px;
  cursor: pointer;
  transition: background-color .2s;
  border-radius: 4px;
}

.info-block > .info-block__go-back:hover {
  background-color: #e3e3e3;
}

.info-block > .info-block__go-back:active {
  background-color: #cccccc;
}

.info-block__text {
  max-width: 400px;
  font-size: 24px;
}

.info-block__item {
  position: relative;
}

.info-block__item::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  color: #ececec;
  bottom: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid;
}

.my-card {
  width: 100%;
  height: 100%;
}
</style>
