<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <q-card bordered class="my-card bg-white" v-if="!fetching">
    <q-card-section class="bg-grey my-card-section">
      <q-tabs
        narrow-indicator
        dense
        v-model="tab"
      >
        <q-tab name="managers" label="Список менеджеров" />
        <q-tab name="shifts" label="Смены" />
      </q-tabs>

    </q-card-section>

    <q-card-section>
      <div v-show="tab === 'managers'">
        <div class="q-pa-md duty-manager__content">
            <q-table
              :columns="columns"
              :rows="rows"
              row-key="id"
              :pagination="{sortBy: 'id'}"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="id" :props="props">
                    {{ props.row.id }}
                  </q-td>
                  <q-td key="name" :props="props">
                    {{ props.row.name }}
                  </q-td>
                  <q-td key="phone" :props="props">
                    {{ props.row.phone }}
                  </q-td>
                  <q-td key="actions" :props="props">
                    <EditIconComponent size="sm" @click="showEditDialog(props.row)" />
                    <DeleteIconComponent size="sm" @click="showDeleteDialog(props.row)" />
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:bottom>
                <q-btn
                  class="q-my-md"
                  label="Добавить"
                  color="positive"
                  @click="addDialog = true"
                />
              </template>
            </q-table>
          </div>
      </div>

      <div v-show="tab === 'shifts'">
        <q-splitter
          v-model="splitterModel"
          style="height: 450px"
        >

          <template v-slot:before>
            <div class="q-pa-md">
              <q-date
                v-model="date"
                :events="events"
                event-color="green-6"
                first-day-of-week="1"
                today-btn
                @navigation="(view) => testLog(view)"
              />
            </div>
          </template>

          <template v-slot:after>
            <q-tab-panels
              v-model="date"
              animated
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <QTabPanel
                v-for="shift in shifts"
                v-bind:key="shift.shift_id"
                :name="dayjs(shift.date_start).format('YYYY/MM/DD')"
                style="overflow: hidden"
              >
                <div style="overflow: hidden; padding: 20px">

                  <div class="text-h4 q-mb-md">Дежурный менеджер: {{shift.name}}</div>
                  <p>Дата начала: {{ dayjs(shift.date_start).format('DD.MM.YYYY HH:mm:ss') }}</p>
                  <p>Дата окончания: {{ dayjs(shift.date_end).format('DD.MM.YYYY HH:mm:ss') }}</p>
                  <q-splitter horizontal />
                </div>
              </QTabPanel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </div>
    </q-card-section>
  </q-card>


  <DraggableDialog v-model="addDialog" title="Добавление нового менеджера" @onHide="onHideDialog">
    <q-input
      v-model="selectedRow.name.value"
      label="Имя"
      :error="selectedRow.name.blurred && !selectedRow.name.valid"
      :error-message="getErrorMessage(selectedRow.name.errors)"
      class="dialog-input"
      @blur="blurred(selectedRow, 'name')"
    />
    <q-input
      v-model="selectedRow.phone.value"
      label="Номер телефона"
      :error="selectedRow.phone.blurred && !selectedRow.phone.valid"
      :error-message="getErrorMessage(selectedRow.phone.errors)"
      mask="+7-(###)-###-##-##"
      class="dialog-input"
      @blur="blurred(selectedRow, 'phone')"
    />
    <div class="dialog-buttons">
      <q-btn
        label="Сохранить"
        color="positive"
        @click="confirmAdd"
        :disable="isInvalidEditing || waitingResponse"
      />
      <q-btn
        label="Отмена"
        color="primary"
        v-close-popup
      />
    </div>
    <p
      class="q-mt-lg text-negative text-weight-bold text-subtitle1"
      v-show="editingError"
    >
      {{ editingError }}</p>
  </DraggableDialog>


  <DraggableDialog v-model="editDialog" title="Редактирование" @onHide="onHideDialog">
    <q-input
      v-model="selectedRow.name.value"
      label="Имя"
      :error="selectedRow.name.blurred && !selectedRow.name.valid"
      :error-message="getErrorMessage(selectedRow.name.errors)"
      class="dialog-input"
      @blur="blurred(selectedRow, 'name')"
    />
    <q-input
      v-model="selectedRow.phone.value"
      label="Номер телефона"
      :error="selectedRow.phone.blurred && !selectedRow.phone.valid"
      :error-message="getErrorMessage(selectedRow.phone.errors)"
      mask="+7-(###)-###-##-##"
      class="dialog-input"
      @blur="blurred(selectedRow, 'phone')"
    />
    <div class="dialog-buttons">
      <q-btn
        label="Сохранить"
        color="positive"
        @click="confirmEdit"
        :disable="isInvalidEditing || waitingResponse"
      />
      <q-btn
        label="Отмена"
        color="primary"
        v-close-popup
      />
    </div>
    <p
      class="q-mt-lg text-negative text-weight-bold text-subtitle1"
      v-show="editingError"
    >
      {{ editingError }}</p>
  </DraggableDialog>

  <DraggableDialog v-model="deleteDialog" title="Удаление" @onHide="onHideDialog">
    <h3>Удалить дежурного менеджера <span style="color: #374bc9">{{ selectedRow.name.value }}</span>?</h3>
    <div class="dialog-buttons">
      <q-btn
        label="Удалить"
        color="negative"
        :disable="waitingResponse"
        @click="confirmDelete"
      />
      <q-btn
        label="Отмена"
        color="primary"
        v-close-popup
      />
    </div>
  </DraggableDialog>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import { useObject } from "src/hooks/useObject";
import DraggableDialog from "src/components/DraggableDialog";
import FetchSpinnerComponent from "src/components/FetchSpinnerComponent";
import DateTimePicker from "components/DateTimePicker";
import { apiRoutes, requestJson } from "src/api";
import { useUtilsStore } from "stores/utils";
import { blurred, refreshFields } from 'src/utils/object';
import { required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";
import { parseQDateNavigationMinMaxMonthDate } from 'src/utils/date';

const testLog = (view) => {
  const { maxDate, minDate } = parseQDateNavigationMinMaxMonthDate(view);
}
const splitterModel = ref(35);
const date = ref(dayjs(new Date).format("YYYY/MM/DD"))
const events = ref([  ]);

const utilsStore = useUtilsStore();
const waitingResponse = computed(() => utilsStore.waitingResponse);
const fetching = ref(false);
const columns = [
  {
    name: "id",
    label: "ID",
    field: "id",
    sortable: true,
    align: "center",
    editable: false,
    readonly: true
  },
  {
    name: "name",
    label: "Имя",
    field: "name",
    sortable: true,
    align: "center",
    readonly: false
  },
  {
    name: "phone",
    label: "Номер телефона",
    field: "phone",
    sortable: true,
    align: "center",
    readonly: false
  },
  {
    name: "actions",
    label: "Действия",
    field: "actions",
    sortable: false,
    align: "center",
    readonly: true
  }
];
const rows = ref([]);
const shifts = ref([]);
const tab = ref("managers");

onMounted(async () => {
  const defaultGetParams = {
    date_start: "2021-01-01",
    date_end: dayjs().format("YYYY-MM-DD"),
  };
  try {
    fetching.value = true;
    const [dutyManagerResponse, shiftResponse] = await Promise.all([
      requestJson({
        url: apiRoutes.dutymanager,
        // params: defaultGetParams,
      }),
      requestJson({
        url: apiRoutes.shift,
        // params: defaultGetParams,
      })
    ]);
    shifts.value = shiftResponse.data;
    events.value = shiftResponse.data.map(item => dayjs(item.date_start).format('YYYY/MM/DD'));
    rows.value = dutyManagerResponse.data;
  } finally {
    fetching.value = false;
  }
});

const editingError = ref(null);

const addDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedRow = useObject({
  name: {
    value: "",
    prevValue: "",
    validators: {
      required,
    },
    blurred: false
  },
  phone: {
    value: "",
    prevValue: "",
    validators: {
      required,
    },
    blurred: false
  },
});

const setFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [ key, value ] = entry;

    if (!object.hasOwnProperty(key)) {
      object[key] = {
        value: value
      };
    } else {
      object[key].value = value;
    }

    object[key].prevValue = value;
    object[key].blurred = false;
  });
};

const showEditDialog = row => {
  setFields(row, selectedRow);
  editDialog.value = true;
};

const confirmAdd = async () => {
  const body = {};
  for (const [ key, innerObject ] of Object.entries(selectedRow)) {
    body[key] = innerObject.value;
  }

  // return console.log('body', body);
  const url = `${apiRoutes.dutymanager}`;
  try {
    const response = await requestJson({
      url,
      method: "POST",
      body
    });
    if (!response.success) return

    rows.value.push(response.data);
  } finally {
    addDialog.value = false;
  }
}

const confirmEdit = async () => {
  const body = {};
  for (const [ key, inner ] of Object.entries(selectedRow)) {
    if (inner.edited) {
      body[key] = inner.value;
    }
  }
  const url = `${apiRoutes.dutymanager}/${selectedRow.id.value}`;
  const response = await requestJson({
    url,
    method: "PUT",
    body
  });
  if (!response.success) {
    return
  }
  const editedManagerIndex = rows.value.findIndex(item => item.id === selectedRow.id.value);
  Object.keys(rows.value[editedManagerIndex]).forEach(key => {
    if (selectedRow.hasOwnProperty(key)) {
      rows.value[editedManagerIndex][key] = selectedRow[key].value;
    }
  });
  editDialog.value = false;
};

const showDeleteDialog = row => {
  setFields(row, selectedRow);
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    const url = `${ apiRoutes.dutymanager }/${ selectedRow.id.value }`;
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    console.log('response', response);
    if (response.success) {
      rows.value = rows.value.filter(row => row.id !== selectedRow.id.value);
    }
  } finally {
    deleteDialog.value = false;
  }
};

const onHideDialog = () => {
  editingError.value = '';
  refreshFields(selectedRow);
};


const isInvalidEditing = computed(() => {
  for (const value of Object.values(selectedRow)) {
    if (value.hasOwnProperty("valid") && !value.valid) {
      return true;
    }
  }
  return false;
});


const getErrorMessage = errors => {
  for (const [ key, value ] of Object.entries(errors)) {
    if (value) {
      switch (key) {
        case 'required':
          console.log('required');
          return 'Поле не может быть пустым'
      }
    }
  }
};

</script>

<style scoped>

</style>
