<template>
  <div class="info-block">
    <div class="info-block__go-back" @click="() => { emits('goBackClick') }">
      <q-icon name="arrow_back" size="40px" />
      <q-tooltip anchor="top end">Вернуться назад</q-tooltip>
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
          <div class="info-block__item">
            <span>Контакты:</span>
            <div class="info-block__contacts">
              <q-card
                v-for="contact in client.contacts"
                :key="contact.phone"
                bordered

              >
                <div class="text-h7">{{ contact.name }}</div>
                <div class="text-subtitle2">{{ contact.position }}</div>
                <div class="text-subtitle2">{{ contact.phone }}</div>

              </q-card>
            </div>
          </div>

        </q-card-section>
        <q-btn
          class="q-ma-md"
          label="Редактировать"
          color="primary"
          @click="showEditDialog"
          v-if="userRoles.includes('corners-update')"
        />
        <q-btn
          class="q-ma-md"
          label="Удалить"
          color="negative"
          @click="showDeleteDialog"
          v-if="userRoles.includes('corners-delete')"
        />
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

      <ClientInfoInvoiceComponent
        v-model="items.invoice.data"
        :tab="tab"
        :client="client"
      />
      <ClientInfoGoalsComponent
        v-model="items.goals.data"
        :tab="tab"
        :client="client"
      />
    </q-card>
  </div>

  <DraggableDialog v-model="dialog" :title="dialogTitle" :onHide="onHideDialog">
    <q-form @submit="submitHandler" style="width: 80%;">
      <h3 class="q-mx-auto text-center" v-if="deleteMode">Удалить клиента?<br /> <span class="selected-words text-amber-9 text-center">{{ client.label }}</span></h3>
      <div v-else>
        <FieldInput
          v-for="field in Object.values(clientObject).filter(item => item.input)"
          :key="field.attributes.name"
          v-model="field.value"
          :field="field"
        />
        <q-slider
          v-bind="clientObject.rating.attributes"
          v-model="clientObject.rating.value"
        />
        <ClientContactsComponent v-model="clientObject.contacts.value"/>
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
import { computed, onMounted, reactive, ref } from "vue";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import FieldInput from "components/FieldInput";
import { apiRoutes, requestJson } from "src/api";
import ClientInfoInvoiceComponent from "components/Clients/ClientInfoInvoiceComponent";
import ClientInfoGoalsComponent from "components/Clients/ClientInfoGoalsComponent";
import { useObject } from "src/hooks/useObject";
import { required } from "src/utils/validators";
import DraggableDialog from "components/DraggableDialog";
import { refreshFields, setFields } from "src/utils/object";
import { useUtilsStore } from "stores/utils";
import { useUserStore } from "stores/user";
import ClientContactsComponent
  from "components/Clients/ClientContactsComponent";


const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const emits = defineEmits(['update:modelValue', 'goBackClick', 'onClientDelete']);
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
});

onMounted(() => {
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

      items.invoice.data = invoiceResponse.data.filter(item => item.corner === client.value.id);
      items.goals.data = goalsResponse.data;
      items.deviation.data = [];
    })
    .finally(() => {
      fetching.value = false;
    });
});

const clientObject = useObject({
  id: {
    value: '',
    hidden: true
  },
  label: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      name: "label",
      label: "Имя клиента",
      type: "text",
    },
    input: true,
  },
  area: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      name: "area",
      label: "Площадь",
      type: "number",
      step: "0.01",
    },
    input: true,
  },
  number: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      name: "number",
      label: "Number",
      type: "number",
    },
    input: true,
  },
  power: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      name: "power",
      label: "Power",
      type: "number",
      step: "0.01",
    },
    input: true,
  },
  rating: {
    value: 1,
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      "label": true,
      "name": "rating",
      "min": 1,
      "max": 10,
      markers: true,
      "marker-labels": true,
    },
  },
  contacts: {
    value: null,
  },
});

const editMode = ref(false);
const deleteMode = ref(false);
const dialog = computed({
  get: () => editMode.value || deleteMode.value,
  set: () => {
    editMode.value = false;
    deleteMode.value = false;
  }
});
const dialogTitle = computed(() => {
  let label = '';
  if (editMode.value) label = 'Редактирование';
  if (deleteMode.value) label = 'Удаление';
  return `${label} клиента`;
});
const submitButtonLabel = computed(() => {
  let label = '';
  if (editMode.value) label = 'Сохранить';
  if (deleteMode.value) label = 'Удалить';
  return label;
});

const submitHandler = evt => {
  editMode.value && editClient();
  deleteMode.value && deleteClient();
};


const showEditDialog = () => {
  setFields(client.value, clientObject);
  const contacts = [];
  for (const value of Object.values(client.value.contacts)) {
    const el = Object.assign({}, value)
    contacts.push(el);
  }
  clientObject["contacts"].value = contacts;
  editMode.value = true;
};

const showDeleteDialog = () => {
  console.log('showDeleteDialog');
  deleteMode.value = true;
};

const editClient = async () => {
  const body = {};
  for (const [ key, inner ] of Object.entries(clientObject)) {
    if (!inner.edited || key === 'rating') continue
    body[key] = inner.value;
  }
  body["contacts"] = clientObject.contacts.value;
  try {
    const response = await requestJson({
      url: `${apiRoutes.corners}/${client.value.id}`,
      method: "PUT",
      body
    });
    if (response.success) {
      // Object.entries(body).forEach(([key, value]) => {
      client.value = { ...client.value, ...response.data };
      // });
    }
  } finally {
    dialog.value = false;
  }
};

const deleteClient = async () => {
  try {
    const response = await requestJson({
      url: `${apiRoutes.corners}/${client.value.id}`,
      method: "DELETE",
    });
    if (response.success) {
      emits("onClientDelete", client.value.id);
    }
  } finally {
    dialog.value = false;
  }
};

const onHideDialog = () => {
  refreshFields(clientObject);
};
</script>

<style scoped>
.info-block {
  min-height: 30vh;
  max-height: 100%;
  display: flex;
}

.info-block > div {
  margin: 0 15px;
  min-width: 350px;
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
  height: min-content;
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

.info-block__item > span {
  color: #232222;
}

.my-card {
  width: 100%;
  height: 100%;
}

.info-block__contacts {
  display: flex;
  flex-wrap: wrap;
  word-wrap: anywhere;
  justify-content: space-between;
}

.info-block__contacts > div {
  text-align: center;
  padding: 5px;
  margin: 5px;
  width: 45%;
}

.tel-link {
  text-decoration: none;
  color: inherit;
}

.tel-link:hover {
  text-decoration: underline;
}
</style>
