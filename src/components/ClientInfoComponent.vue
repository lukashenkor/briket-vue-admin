<template>
  <div class="info-block">
    <div class="info-block__go-back" @click="() => { emits('goBackClick') }">
      <q-icon name="arrow_back" size="40px" />
    </div>
    <div class="info-block__text">
      <q-card bordered class="my-card">
        <q-card-section class="bg-grey text-white my-card-section">
          <div class="text-h6"><h5 class="text-center">Информация о клиенте <span class="text-amber-4">{{ client?.label }}</span></h5></div>
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
    <CardTabsComponent
      v-model="tab"
      :items="items"
      v-if="!fetching"
    />


<!--    <div class="info-block__tabs">
      <q-card bordered class="my-card bg-white">
        <q-card-section class="bg-grey my-card-section">
          <q-tabs
            v-model="tab"
            narrow-indicator
            dense
            align="justify"
            class="bg-grey text-white fit"
          >
            <q-tab :ripple="false" name="bills" icon="receipt" label="Счета" />
            <q-tab :ripple="false" name="goals" icon="emoji_flags" label="Цели" />
            <q-tab :ripple="false" name="change" icon="dangerous" label="Отхождение" />
          </q-tabs>
        </q-card-section>


        <q-card-section>

        </q-card-section>
      </q-card>
    </div>-->
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import CardTabsComponent from "components/CardTabsComponent";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { apiRoutes, requestJson } from "src/api";


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
    icon: "goals",
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
})

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
</style>
