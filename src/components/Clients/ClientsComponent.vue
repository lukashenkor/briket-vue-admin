<template>
  <div class="clients">
    <FetchSpinnerComponent :fetching="fetching"/>
    <q-slide-transition :duration="1000">
      <div v-show="!selectedClient.length" v-if="!fetching">
        <q-table
          title="Список клиентов"
          :columns="columns"
          :rows="filteredClients"
          row-key="label"
          no-data-label="Список клиентов пуст"
          :rows-per-page-options="[10, 20, 0]"
          v-model:selected="selectedClient"
          :pagination="{
            sortBy: isRatingPage ? 'rating' : 'id',
            descending: isRatingPage,
          }"
        >
          <template v-slot:top-right>
            <div style="border: 1px solid; border-radius: 8px; padding: 0 10px;">
              <p class="text-center" style="border-bottom: 1px solid;">Фильтрация клиентов:</p>
              <div class="q-gutter-sm">
                <q-radio keep-color v-model="filter" val="available" label="Активные" color="teal" />
                <q-radio keep-color v-model="filter" val="disabled" label="Удаленные" color="red" />
                <q-radio keep-color v-model="filter" val="All" label="Все" color="black" />
              </div>
            </div>
            <q-separator
              vertical
              inset
              spaced
              style="margin: 0 20px;"
            />
            <q-btn
              label="Добавить"
              color="positive"
              @click="dialog = true"
              v-if="userRoles.includes('corners-create')"
            />
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="props.row.disabled ? 'client-disabled' : ''"
              @click="selectClient(props.row)"
              class="client-row"
            >
              <q-td v-for="item in columns.map(column => column.name)" :key="item">
                {{ props.row[item] }}
              </q-td>
            </q-tr>

          </template>
        </q-table>
      </div>

    </q-slide-transition>
    <q-slide-transition :duration="800">
      <div class="client-info" v-show="selectedClient.length" v-if="selectedClient.length">
        <ClientInfoComponent v-model="selectedClient[0]" @goBackClick="goBackClickHandler" @onClientDelete="onClientDelete" @editClient="editClient"/>
      </div>
    </q-slide-transition>
    <QSelect />

    <DraggableDialog v-model="dialog" title="Добавление клиента" min-width="700" :onHide="onHideDialog">
      <q-form @submit.prevent="submitHandler" style="width: 80%;">
        <FieldInput
          v-for="field in Object.values(client).filter(item => item.input)"
          :key="field.attributes.name"
          v-model="field.value"
          :field="field"
          @blur="field.blurred = true"
        />
        <ClientContactsComponent
          v-model="client.contacts.value"
        />
        <q-btn
          label="Добавить контакт"
          size="sm"
          @click="addContact"
        />
        <div class="dialog-buttons">
          <q-btn
            label="Добавить"
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
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import FieldInput from 'components/FieldInput';
import ClientInfoComponent from 'components/Clients/ClientInfoComponent';
import ClientContactsComponent from 'components/Clients/ClientContactsComponent';
import FetchSpinnerComponent from 'components/FetchSpinnerComponent';
import { apiRoutes, requestJson } from "src/api";
import DraggableDialog from "components/DraggableDialog";
import { useUserStore } from "stores/user";
import { useObject } from "src/hooks/useObject";
import { minLength, required } from 'src/utils/validators';
import { useUtilsStore } from "stores/utils";
import { refreshFields } from "src/utils/object";


const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const userStore = useUserStore();
const userRoles = computed(() => userStore.data.roles);
const props = defineProps([ "isRatingPage", "corner_id" ]);
const fetching = ref(false);
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'label', label: 'Наименование', field: 'label', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'login', label: 'Логин', field: 'login', sortable: false, align: "left", editable: false, readonly: true, },
  { name: 'area_size', label: 'Площадь (кв.м.)', field: 'area_size', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'power', label: 'Мощность (кВт)', field: 'power', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'number', label: 'Номер', field: 'number', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'rating', label: 'Рейтинг', field: 'rating', sortable: true, align: "left", editable: true, readonly: false, },

];

const rows = reactive({});
const dialog = ref(false);
const filter = ref('available')

onBeforeMount(async () => {
  fetching.value = true;
  try {
    const response = await requestJson({
      url: apiRoutes.corners
    });
    rows.clients = response.data.corners;

    if (props.corner_id) {
      const client = rows.clients.find(row => row.id === Number(props.corner_id))
      if (client) {
        selectClient(client);
      }
    }
  } finally {
    fetching.value = false;
  }
});

const filteredClients = computed(() => {
  switch (filter.value) {
    case 'available':
      return rows.clients.filter(client => !client.disabled)
    case 'disabled':
      return rows.clients.filter(client => client.disabled)
  }
  return rows.clients;
})

const selectedClient = ref([]);

const passwordMinLength = 8;
const passwordMaxLength = 36;

const client = useObject({
   login: {
    value: "",
    prevValue: "",
    validators: { required },
    blurred: false,
    input: true,
    attributes: {
      name: "login",
      label: "Логин клиента",
      type: "text",
    },
  },
  password: {
    value: "",
    prevValue: "",
    validators: { required, minLength: minLength(passwordMinLength) },
    blurred: false,
    input: true,
    attributes: {
      name: "password",
      label: "Пароль клиента",
      type: "password",
      maxlength: passwordMaxLength
    },
  },
  label: {
    value: "",
    prevValue: "",
    validators: { required },
    blurred: false,
    input: true,
    attributes: {
      name: "label",
      label: "Наименование",
      type: "text",
    },
  },
  area_size: {
    value: "",
    prevValue: "",
    validators: { required },
    blurred: false,
    input: true,
    attributes: {
      name: "area_size",
      label: "Площадь",
      type: "number",
      "min": 0.0,
      step: 0.1,
      markers: 1,
      markerLabels: true,
    },
  },
  power: {
    value: "",
    prevValue: "",
    validators: { required },
    blurred: false,
    input: true,
    attributes: {
      name: "power",
      label: "Мощность",
      type: "number",
      "min": 0.0,
      step: 0.1,
      markers: 1,
      markerLabels: true,
    },
  },
  number: {
    value: "",
    prevValue: "",
    validators: { required },
    blurred: false,
    input: true,
    attributes: {
      name: "number",
      label: "Номер",
      type: "number",
    },
  },
  contacts: {
    value: null,
  },
});


const addContact = () => {
  if (Array.isArray(client.contacts.value)) {
    client.contacts.value = [...client.contacts.value, {"name": '', "phone": '', "position": ''}];
  } else {
    client.contacts.value = [{"name": '', "phone": '', "position": ''}];
  }
};

const editClient = editedClient => {
  const clientIndex = rows.clients.findIndex(row => row.id === editedClient.id);
  rows.clients[clientIndex] = editedClient;
};

const submitHandler = async () => {
  const body = {};
  for (const [ key, innerObject ] of Object.entries(client)) {
    body[key] = innerObject.value;
  }
  !body["contacts"] && (body["contacts"] = []);
  try {
    const response = await requestJson({
      url: apiRoutes.corners,
      method: "POST",
      body,
    });
    if (response.success) {
      rows.clients = [ ...rows.clients, response.data ];
    }
  } finally {
    dialog.value = false;
  }
};

const selectClient = (row) => {
  if (!selectedClient.value || !selectedClient.value.length) {
    selectedClient.value = [ row ];
  }
};

const onClientDelete = id => {
  rows.clients.find(client => client.id === id).disabled = true;
  selectedClient.value = [];
};

const goBackClickHandler = () => {
  selectedClient.value = [];
};

const onHideDialog = () => {
  refreshFields(client);
};
</script>

<style>
.client-disabled {
  background-color: antiquewhite;
}

.client-row {
  cursor: pointer;
}
</style>
