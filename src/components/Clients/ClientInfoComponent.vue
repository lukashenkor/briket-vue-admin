<template>
  <div class="info-block">
    <div class="info-block__go-back" @click="() => { emits('goBackClick') }">
      <q-icon name="arrow_back" size="40px" />
      <q-tooltip anchor="top end">Назад к списку</q-tooltip>
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
            <span>Login:</span> {{ client.login }}
          </p>
          <p class="info-block__item">
            <span>ID:</span> {{ client.id }}
          </p>
          <p class="info-block__item">
            <span>Площадь (кв.м.):</span> {{ client.area_size }}
          </p>
          <p class="info-block__item">
            <span>Номер:</span> {{ client.number }}
          </p>
          <p class="info-block__item">
            <span>Мощность (кВт):</span> {{ client.power }}
          </p>
          <p class="info-block__item">
            <span>Рейтинг:</span> {{ client.rating }}
          </p>
          <div class="info-block__item" v-if="client.contacts?.length">
            <q-table
              :columns="contactsColumns"
              :rows="client.contacts"
              hide-bottom
              title="Контакты"
              :rows-per-page-options="[0]"
              flat
            />
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
        <q-btn
          class="q-ma-md"
          label="Сменить пароль"
          color="warning"
          @click="showPasswordChangeDialog"
          v-if="userRoles.includes('corners-update')"
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
          <q-tab v-for="item in Object.values(items).filter(i => userRoles.includes(i.role))" :key="item.name" :name="item.name" :icon="item.icon" :label="item.label">
            <q-badge color="blue-7" text-color="white" floating v-if="item?.data?.length">{{ item?.data?.length }}</q-badge>
          </q-tab>
        </q-tabs>
      </q-card-section>

      <ClientInfoInvoiceComponent
        v-model="items.invoice.data"
        :tab="tab"
        :client="client"
        v-if="userRoles.includes('finance_invoices')"
      />
      <ClientInfoGoalsComponent
        v-model="items.goals.data"
        :tab="tab"
        :client="client"
        v-if="userRoles.includes('corners-goal')"
      />
      <ClientInfoReportComponent
        v-model="items.report.data"
        :tab="tab"
        :client="client"
        :loading="reportLoading"
        @onMonthPickerInput="reportMonthChange"
        v-if="userRoles.includes('finance_report')"
      />
    </q-card>
  </div>

  <DraggableDialog v-model="dialog" :title="dialogTitle" :onHide="onHideDialog">
    <q-form @submit="submitHandler" style="width: 90%;">
      <div v-if="!changePasswordMode">
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
            :label-value="`Рейтинг: ${clientObject.rating.value}`"
          />
          <ClientContactsComponent v-model="clientObject.contacts.value"/>
          <q-btn
            class="q-mt-md"
            label="Добавить контакт"
            size="sm"
            @click="addContact"
          />
        </div>
      </div>
      <div v-else>
        <FieldInput
            key="newPassword.password.attributes.name"
            v-model="newPassword.password.value"
            :field="newPassword.password"
          />
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
import { required, requiredOfArray } from "src/utils/validators";
import DraggableDialog from "components/DraggableDialog";
import { refreshFields, setFields } from "src/utils/object";
import { useUtilsStore } from "stores/utils";
import { useUserStore } from "stores/user";
import ClientContactsComponent
  from "components/Clients/ClientContactsComponent";
import ClientInfoReportComponent
  from "components/Clients/ClientInfoReportComponent";
import dayjs from "dayjs";
import { minLength } from "src/utils/validators";
import { isEqual } from 'lodash';


const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);
const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const emits = defineEmits(['update:modelValue', 'goBackClick', 'onClientDelete', 'editClient']);
const fetching = ref(false);
const tab = ref('invoice');
const props = defineProps(['modelValue']);
const reportLoading = ref(false);

const contactsColumns = [
  { name: 'name', label: 'Имя', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'phone', label: 'Телефон', field: 'phone', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'position', label: 'Должность', field: 'position', sortable: true, align: "left", editable: true, readonly: false, },
];

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
    role: "finance_invoices"
  },
  goals: {
    name: "goals",
    label: "Цели",
    icon: "flag",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
    role: "corners-goal",
  },
  report: {
    name: "report",
    label: "Отчёты",
    icon: "receipt_long",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
    role: "finance_report",
  },
  // Нет понимания, что такое отклонения
  /* deviation: {
    name: "deviation",
    label: "Отклонения",
    icon: "dangerous",
    lines: 0,
    editable: false,
    deletable: false,
    addable: false,
  }, */
});

onMounted(() => {
  const date = dayjs().endOf('month');
  fetching.value = true;
  Promise.all([
    requestJson({
      url: apiRoutes.invoice,
      params: {
        corner_id: client.value.id,
        offset: 0,
        limit: 100,
      },
    }),
    requestJson({
      url: apiRoutes.goals.replace('[id]', client.value.id),
      params: {},
    }),
    requestJson({
      url: apiRoutes.report,
      params: {
        start: date.startOf("month").format("YYYY-MM-DD"),
        end: date.endOf("month").format("YYYY-MM-DD"),
        corner_id: client.value.id,
      },
    })
  ])
    .then(([invoiceResponse, goalsResponse, reportsResponse]) => {
      items.invoice.data = invoiceResponse?.success ?
        invoiceResponse?.data?.filter(item => item.corner_id === client.value.id) || []
        : [];
      items.goals.data = goalsResponse?.success ?
        goalsResponse.data || []
        : [];
      // items.deviation.data = [];
      items.report.data = reportsResponse?.success
        ? reportsResponse.data || []
        : [];
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
  area_size: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      name: "area_size",
      label: "Площадь",
      type: "number",
      step: "0.01",
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
      label: "Мощность",
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
  rating: {
    value: '',
    prevValue: '',
    validators: { required },
    blurred: false,
    attributes: {
      "label": true,
      "label-always": true,
      "name": "rating",
      "min": 0.0,
      "max": 10.0,
      step: 0.1,
      markers: 1,
      markerLabels: true,
    },
  },
  contacts: {
    value: null,
    validators: { requiredOfArray },
  },
});
const passwordMinLength = 8;
const passwordMaxLength = 36;

const editMode = ref(false);
const deleteMode = ref(false);
const changePasswordMode = ref(false);
const newPassword = useObject({
  password: {
    value: '',
    prevValue: '',
    validators: { required, minLength: minLength(passwordMinLength) },
    blurred: false,
    attributes: {
      name: "password",
      label: "Новый пароль",
      type: "password",
      maxlength: passwordMaxLength
    },
    input: true,
  }
});
const dialog = computed({
  get: () => editMode.value || deleteMode.value || changePasswordMode.value,
  set: () => {
    editMode.value = false;
    deleteMode.value = false;
    changePasswordMode.value = false;
  }
});
const dialogTitle = computed(() => {
  let label = '';
  if (editMode.value) label = 'Редактирование';
  else if (deleteMode.value) label = 'Удаление';
  else if (changePasswordMode.value) label = 'Изменение пароля';
  return `${label} клиента`;
});
const submitButtonLabel = computed(() => {
  let label = '';
  if (editMode.value || changePasswordMode.value) label = 'Сохранить';
  else if (deleteMode.value) label = 'Удалить';
  return label;
});

const submitHandler = () => {
  editMode.value && editClient();
  deleteMode.value && deleteClient();
  changePasswordMode.value && changeClientPassword();
};


const changeClientPassword = async () => {
  const body = { password: newPassword.password.value };
  try {
    requestJson({
      url: `${apiRoutes.users}/${client.value.user_id}`,
      method: "PUT",
      body,
      message: "Редактирование пароля"
    });
  } finally {
    dialog.value = false;
  }
};


const showEditDialog = () => {
  setFields(client.value, clientObject);
  const contacts = [];
  if (client?.value?.contacts?.length) {
    for (const value of Object.values(client?.value?.contacts)) {
      const el = Object.assign({}, value)
      contacts.push(el);
    }
  }
  clientObject["contacts"].value = contacts;
  editMode.value = true;
};

const showDeleteDialog = () => {
  deleteMode.value = true;
};

const showPasswordChangeDialog = () => {
  changePasswordMode.value = true;
}

const editClient = async () => {
  const body = {};
  for (const [ key, inner ] of Object.entries(clientObject)) {
    if (!inner.edited) continue
    body[key] = inner.value;
  }
  if (isEqual(clientObject["contacts"]?.value, clientObject["contacts"]?.prevValue)) {
    delete body["contacts"];
  }
  try {
    const response = await requestJson({
      url: `${apiRoutes.corners}/${client.value.id}`,
      method: "PUT",
      body
    });
    if (response.success) {
      const editedClient = { ...client.value, ...response.data };
      client.value = editedClient;
      emits('editClient', editedClient);
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

const reportMonthChange = async dayjsObject => {
  reportLoading.value = true;
  items.report.data = [];
  try {
    const response = await requestJson({
      url: apiRoutes.report,
      params: {
        start: dayjsObject.startOf("month").format("YYYY-MM-DD"),
        end: dayjsObject.endOf("month").format("YYYY-MM-DD"),
        corner_id: client.value.id,
      }
    });
    if (response.success) {
      items.report.data = response.data;
    }
  } finally {
    reportLoading.value = false;
  }
};

const addContact = () => {
  if (Array.isArray(clientObject.contacts.value)) {
    clientObject.contacts.value = [...clientObject.contacts.value, {"name": '', "phone": '', "position": ''}];
  } else {
    clientObject.contacts.value = [{"name": '', "phone": '', "position": ''}];
  }
};

const onHideDialog = () => {
  refreshFields(clientObject);
  refreshFields(newPassword);
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
  min-width: 400px;
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
  max-width: 430px;
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

.info-block__contacts > div {
  text-align: center;
  padding: 5px;
  margin: 5px;
  width: 45%;
}

</style>
