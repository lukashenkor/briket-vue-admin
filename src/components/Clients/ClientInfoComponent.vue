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
          <p class="info-block__item">
            <span>ID:</span> {{ client.id }}
          </p>
          <p class="info-block__item">
            <span>Площадь:</span> {{ client.area }}
          </p>
          <p class="info-block__item">
            <span>Number:</span> {{ client.number }}
          </p>
          <p class="info-block__item">
            <span>Power:</span> {{ client.power }}
          </p>
          <p class="info-block__item">
            <span>Рейтинг:</span> {{ client.rating }}
          </p>

        </q-card-section>
        <q-btn
          class="q-ma-md"
          label="Изменить рейтинг"
          color="primary"
          @click="ratingEdit = true"
          v-show="!ratingEdit"
        />
        <div class="save-rating" v-show="ratingEdit">
          <q-btn
            class="q-ma-md"
            label="Сохранить"
            color="positive"
            @click="editRatingConfirm"
          />
          <q-btn
            class="q-ma-md"
            label="Отмена"
            color="negative"
            @click="editRatingCancel"
          />
        </div>
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

      <ClientInfoInvoiceComponent :tab="tab" :client="client" :items="items.invoice?.data || []" />
      <ClientInfoGoalsComponent :tab="tab" :client="client" :items="items.goals?.data || []"/>
    </q-card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { apiRoutes, requestJson } from "src/api";
import ClientInfoInvoiceComponent from "components/Clients/ClientInfoInvoiceComponent";
import ClientInfoGoalsComponent from "components/Clients/ClientInfoGoalsComponent";


const ratingEdit = ref(false);
const newRating = ref(null);
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

      items.invoice.data = invoiceResponse.data.filter(item => item.corner === client.value.id);
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
