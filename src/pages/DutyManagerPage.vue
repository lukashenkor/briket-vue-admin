<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <q-card bordered class="my-card bg-white" v-if="!fetching">
    <q-card-section class="bg-grey my-card-section">
      <q-tabs
        narrow-indicator
        dense
        align="justify"
        class="bg-grey text-white fit"
        v-model="tab"
      >
        <q-tab name="managers" label="Список менеджеров" />
        <q-tab name="shifts" label="Смены" />
      </q-tabs>

    </q-card-section>

    <q-card-section style="padding: 0;">
      <div v-show="tab === 'managers'">
        <div class="q-pa-md duty-manager__content" style="padding: 0">
            <q-table
              :columns="columns"
              :rows="managersList"
              row-key="id"
              :pagination="{sortBy: 'id'}"
              no-data-label="Список менеджеров пуст"
            >
              <template v-slot:top-left>
                <q-btn
                  class="q-my-md"
                  label="Добавить"
                  color="positive"
                  @click="addDialog = true"
                />
              </template>
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
            </q-table>
          </div>
      </div>

      <div v-show="tab === 'shifts'">
        <h4 style="text-align: center; padding: 5px 0; border-bottom: 1px solid #cdcdcd;">
            Текущий дежурный менеджер: <b>{{ currentShift?.name || 'Не найден' }}</b>
          </h4>
        <q-splitter
          disable
          :model-value="30"
        >
          <template v-slot:before>
            <div class="q-pa-md flex column flex-center">
              <q-date
                v-model="date"
                :events="calendarEvents"
                first-day-of-week="1"
                today-btn
                @navigation="(view) => datepickerDateChangeHandler(view)"
                :locale="qDateLocale"
              />
              <q-btn
                dense
                color="positive"
                label="Добавить смену"
                class="q-mt-sm"
                style="width: 290px;"
                @click="openShiftDialog('POST')"
              />
            </div>
          </template>

          <template v-slot:after>
            <FetchSpinnerComponent :fetching="shiftsFetching"/>
            <q-tab-panels
              v-model="date"
              animated
              transition-prev="jump-up"
              transition-next="jump-up"
              v-show="!shiftsFetching"
            >
            <QTabPanel
              v-for="[key, eventsArray] in Object.entries(events)"
              v-bind:key="key"
              :name="dayjs(key).format('YYYY/MM/DD')"
              style="overflow: hidden"
              >
                <div
                  v-for="event in eventsArray"
                  :key="event.id"
                  style="overflow: hidden; padding: 20px; display:flex; flex-direction: row; border-bottom: 1px solid #a1a1a1;"
                  :style="`backgroundColor: ${dayjs(event.start_at).isSame(date, 'date') ? '#26a69a1c' : 'none'}`"
                >
                  <div class="q-mr-md" style="display:flex; flex-direction: column; align-items: center; justify-content: space-around">
                    <edit-icon-component @click="openShiftDialog('PUT', event)"/>
                    <delete-icon-component @click="openShiftDialog('DELETE', event)"/>
                  </div>
                  <div>
                    <h4 class="q-mb-sm">Дежурный менеджер: {{event.name}}</h4>
                    <p>Дата начала: {{ dayjs(event.start_at).format('YYYY.MM.DD HH:mm:ss') }}</p>
                    <p>Дата окончания: {{ dayjs(event.end_at).format('YYYY.MM.DD HH:mm:ss') }}</p>
                  </div>
                </div>
              </QTabPanel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </div>
    </q-card-section>
  </q-card>


  <DraggableDialog v-model="shiftDialog" title="Смены" @onHide="onHideDialog(selectedShift)">
    <div style="width: 50%; min-width: 400px; display:flex; flex-direction: column; gap: 40px" v-if="shiftMethod !== 'DELETE'">
      <q-select
        label="Менеджер"
        :options="managersList.map(row => ({ value: row.id, label: row.name}))"
        v-model="selectedShift.manager_id.value"
        v-show="shiftMethod === 'POST'"
      />

      <DateTimePicker
        label="Дата начала"
        v-model="selectedShift.start_at.value"
        @blur="blurred(selectedShift, 'start_at')"
      />

      <DateTimePicker
        label="Дата окончания"
        v-model="selectedShift.end_at.value"
        @blur="blurred(selectedShift, 'end_at')"
      />
    </div>
    <h4 v-else>
      Вы действительно хотите удалить смену?
    </h4>

    <div class="dialog-buttons">
      <q-btn
        label="Подтвердить"
        color="positive"
        @click="confirmShiftRequest"
        :disable="isShiftInvalid || waitingResponse"
      />
      <q-btn
        label="Отмена"
        color="primary"
        v-close-popup
      />
    </div>

    <p style="color: #940a0a">{{ shiftError }}</p>
  </DraggableDialog>


  <DraggableDialog v-model="addDialog" title="Добавление нового менеджера" @onHide="onHideDialog(selectedManager)">
    <q-input
      v-model="selectedManager.name.value"
      label="Имя"
      :error="selectedManager.name.blurred && !selectedManager.name.valid"
      :error-message="getErrorMessage(selectedManager.name.errors)"
      class="dialog-input"
      @blur="blurred(selectedManager, 'name')"
    />
    <q-input
      v-model="selectedManager.phone.value"
      label="Номер телефона"
      :error="selectedManager.phone.blurred && !selectedManager.phone.valid"
      :error-message="getErrorMessage(selectedManager.phone.errors)"
      mask="+7-(###)-###-##-##"
      class="dialog-input"
      @blur="blurred(selectedManager, 'phone')"
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

  <DraggableDialog v-model="editDialog" title="Редактирование менеджера" @onHide="onHideDialog(selectedManager)">
    <q-input
      v-model="selectedManager.name.value"
      label="Имя"
      :error="selectedManager.name.blurred && !selectedManager.name.valid"
      :error-message="getErrorMessage(selectedManager.name.errors)"
      class="dialog-input"
      @blur="blurred(selectedManager, 'name')"
    />
    <q-input
      v-model="selectedManager.phone.value"
      label="Номер телефона"
      :error="selectedManager.phone.blurred && !selectedManager.phone.valid"
      :error-message="getErrorMessage(selectedManager.phone.errors)"
      mask="+7-(###)-###-##-##"
      class="dialog-input"
      @blur="blurred(selectedManager, 'phone')"
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

  <DraggableDialog v-model="deleteDialog" title="Удаление менеджера" @onHide="onHideDialog(selectedManager)">
    <h3>Удалить дежурного менеджера <span style="color: #374bc9">{{ selectedManager.name.value }}</span>?</h3>
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
import { apiRoutes, requestJson } from "src/api";
import { useUtilsStore } from "stores/utils";
import { blurred, hasInvalidFields, refreshFields } from 'src/utils/object';
import { required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";
import { parseQDateNavigationMinMaxMonthDate } from 'src/utils/date';
import DateTimePicker from 'components/DateTimePicker.vue';

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
const managersList = ref([]);
const shifts = ref([]);
const tab = ref("managers");
const calendarEvents = ref([]);
const currentShift = ref({});

const parseShifts = shifts => {
  const evts = {}
  calendarEvents.value = [];
  currentShift.value = {};
  const todayDate = dayjs();
  shifts.forEach(shift => {
    const start_at = dayjs(shift.start_at);
    const end_at = dayjs(shift.end_at);

    if (todayDate.isAfter(start_at) && todayDate.isBefore(end_at)) {
      currentShift.value = shift;
    }

    if (!calendarEvents.value.includes(start_at.format('YYYY/MM/DD'))) {
      calendarEvents.value.push(start_at.format('YYYY/MM/DD'));
    }
    const diff = end_at.date() - start_at.date();

    for (let i = 0; i <= diff; i++) {
      const shiftDateRange = start_at.add(i, 'days').format('YYYY/MM/DD');

      if (evts[shiftDateRange]) {
        evts[shiftDateRange].push(shift);
      } else {
        evts[shiftDateRange] = [shift];
      }
    }
  })
  Object.entries(evts).forEach(([key, eventArray]) => {
    evts[key] = eventArray.sort((a, b) => dayjs(a.start_at).isAfter(dayjs(b.start_at)) ? 1 : -1)
  })
  events.value = evts;
};

onMounted(async () => {
  const currentDate = dayjs(date.value, 'YYYY/MM/DD')
  const { maxDate, minDate } = parseQDateNavigationMinMaxMonthDate({month: currentDate.month() + 1, year: currentDate.year()});
    const shiftRequestParams = {
      start_at: minDate.format("YYYY-MM-DDTHH:mm:ss"),
      end_at: maxDate.format("YYYY-MM-DDTHH:mm:ss"),
    }
  try {
    fetching.value = true;
    const [dutyManagerResponse, shiftResponse] = await Promise.all([
      requestJson({
        url: apiRoutes.dutymanager,
      }),
      requestJson({
        url: apiRoutes.shift,
        params: shiftRequestParams,
      })
    ]);
    shifts.value = shiftResponse.data;
    parseShifts(shiftResponse.data);
    managersList.value = dutyManagerResponse.data;
  } finally {
    fetching.value = false;
  }
});

const editingError = ref(null);

const addDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedManager = useObject({
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
  setFields(row, selectedManager);
  editDialog.value = true;
};

const confirmAdd = async () => {
  const body = {};
  for (const [ key, innerObject ] of Object.entries(selectedManager)) {
    body[key] = innerObject.value;
  }
  const url = `${apiRoutes.dutymanager}`;
  try {
    const response = await requestJson({
      url,
      method: "POST",
      body
    });
    if (!response.success) return

    managersList.value.push(response.data);
  } finally {
    addDialog.value = false;
  }
}

const confirmEdit = async () => {
  const body = {};
  for (const [ key, inner ] of Object.entries(selectedManager)) {
    if (inner.edited) {
      body[key] = inner.value;
    }
  }
  const url = `${apiRoutes.dutymanager}/${selectedManager.id.value}`;
  const response = await requestJson({
    url,
    method: "PUT",
    body
  });
  if (!response.success) {
    return
  }
  const editedManagerIndex = managersList.value.findIndex(item => item.id === selectedManager.id.value);
  Object.keys(managersList.value[editedManagerIndex]).forEach(key => {
    if (selectedManager.hasOwnProperty(key)) {
      managersList.value[editedManagerIndex][key] = selectedManager[key].value;
    }
  });
  editDialog.value = false;
};

const showDeleteDialog = row => {
  setFields(row, selectedManager);
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    const url = `${ apiRoutes.dutymanager }/${ selectedManager.id.value }`;
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response.success) {
      managersList.value = managersList.value.filter(row => row.id !== selectedManager.id.value);
    }
  } finally {
    deleteDialog.value = false;
  }
};

const onHideDialog = (object) => {
  editingError.value = '';
  shiftError.value = '';
  shiftMethod.value = '';
  refreshFields(object, false);
};


const isInvalidEditing = computed(() => {
  return hasInvalidFields(selectedManager)
});


const getErrorMessage = errors => {
  for (const [ key, value ] of Object.entries(errors)) {
    if (value) {
      switch (key) {
        case 'required':
          return 'Поле не может быть пустым'
      }
    }
  }
};


const shiftDialog = ref(false);
const shiftsFetching = ref(false);
const shiftMethod = ref("");
const shiftError = ref('');

const selectedShift = useObject({
  id: {
    value: null,
    hidden: true,
  },
  manager_id: {
    value: null,
    prevValue: "",
    validators: {
      required,
    },
    methods: ['POST'],
    blurred: false
  },
  start_at: {
    value: null,
    prevValue: "",
    isDate: true,
    validators: {
      required,
    },
    methods: ['POST', 'PUT'],
    blurred: false
  },
  end_at: {
    value: null,
    prevValue: "",
    isDate: true,
    validators: {
      required,
    },
    methods: ['POST', 'PUT'],
    blurred: false
  }
});

const confirmShiftRequest = async () => {
  if (shiftMethod.value !== "DELETE"
    && dayjs(selectedShift.start_at.value).isAfter(dayjs(selectedShift.end_at.value))
  ) {
    return shiftError.value = 'Дата начала не должна быть больше даты окончания';
  }
  shiftError.value = "";

  const body = {};
  for (const [ key, inner ] of Object.entries(selectedShift)) {
    if ((inner.hasOwnProperty('hidden') && inner.hidden) || !inner?.methods?.includes(shiftMethod.value)) continue;
    if (key === 'manager_id') {
      body[key] = inner.value.value;
    } else {
      body[key] = inner.value;
    }
  }
  const urlPostfix = shiftMethod.value === 'POST' ? '' : `/${selectedShift.id.value}`;
  const url = `${ apiRoutes.shift }${urlPostfix}`;
  const options = {
    url,
    method: shiftMethod.value || "POST"
  };
  if (shiftMethod.value !== 'delete') {
    options.body = body;
  }
  try {
    const response = await requestJson(options);

    if (!response.success) return
    
    if  (shiftMethod.value === 'POST') {
      const shiftManager = managersList.value.find(manager => manager.id === selectedShift.manager_id.value.value);
      const newShift = {
        start_at: response.data.start_at,
        end_at: response.data.end_at,
        id: response.data.id,
        manager_id: response.data.duty_manager_id,
        name: shiftManager.name,
        phone: shiftManager.phone
      };
  
      shifts.value.push(newShift);
    } else if (shiftMethod.value === 'PUT') {
      const editedShift = shifts.value.find(shift => shift.id === selectedShift.id.value)
      editedShift.start_at = response.data.start_at;
      editedShift.end_at = response.data.end_at;
    } else {
      shifts.value = shifts.value.filter(shift => shift.id !== selectedShift.id.value);
    }

    parseShifts(shifts.value);

  } finally {
    shiftDialog.value = false;
  }
};


const datepickerDateChangeHandler = async (view) => {
  const { maxDate, minDate } = parseQDateNavigationMinMaxMonthDate(view);
  const params = {
    start_at: minDate.format("YYYY-MM-DDTHH:mm:ss"),
    end_at: maxDate.format("YYYY-MM-DDTHH:mm:ss")
  };

  shiftsFetching.value = true;
  try {
    const response = await requestJson({
      url: apiRoutes.shift,
      params,
    });

    if (response.success) {
      parseShifts(response.data);
    }
  } finally {
    shiftsFetching.value = false;
  }
}

const openShiftDialog = (method, shift) => {
  if (shift) {
    for (const [key, value] of Object.entries(shift)) {
      if (selectedShift.hasOwnProperty(key)) {
        if (key === 'manager_id') {
          selectedShift.manager_id.value = {label: shift.name, value}
        } else if (selectedShift[key].isDate) {
          selectedShift[key].value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        } else {
          selectedShift[key].value = value;
        }
      }
    }
  } else {
    selectedShift.start_at.value = dayjs(date.value).format('YYYY-MM-DD HH:mm:ss');
  }
  shiftDialog.value = true;
  shiftMethod.value = method;
};


const isShiftInvalid = computed(() => {
  return hasInvalidFields(selectedShift);
});
</script>

<style scoped>

</style>
