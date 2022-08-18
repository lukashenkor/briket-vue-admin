<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <div class="duty-manager flex justify-center" v-if="!fetching">
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
            <q-td key="date_start" :props="props">
              {{ dayjs(props.row.date_start, [
              "DD.MM.YYYY HH:mm:ss",
              "DD.MM.YYYY HH:mm",
              "DD.MM.YYYY",
              "YYYY-MM-DDTHH:mm:ss"
            ]).format("YYYY.MM.DD HH:mm") }}
            </q-td>
            <q-td key="date_end" :props="props">
              {{ dayjs(props.row.date_end, [
              "DD.MM.YYYY HH:mm:ss",
              "DD.MM.YYYY HH:mm",
              "DD.MM.YYYY",
              "YYYY-MM-DDTHH:mm:ss"
            ]).format("YYYY.MM.DD HH:mm") }}
            </q-td>
            <q-td key="actions" :props="props">
              <EditIconComponent size="sm" @click="showEditDialog(props.row)" />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

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
      <DateTimePicker
        label="Дата начала"
        v-model="selectedRow.date_start.value"
        @blur="blurred(selectedRow, 'date_start')"
        :with-time="true"
      />
      <DateTimePicker
        label="Дата окончания"
        v-model="selectedRow.date_end.value"
        @blur="blurred(selectedRow, 'date_end')"
        :with-time="true"
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
  </div>
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
import { blurred } from "src/utils/object";
import { required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";


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
    name: "date_start",
    label: "Дата начала",
    field: "date_start",
    sortable: true,
    align: "center",
    readonly: false
  },
  {
    name: "date_end",
    label: "Дата окончания",
    field: "date_end",
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


onMounted(async () => {
  const defaultGetParams = {
    date_start: "2021-01-01",
    date_end: dayjs().format("YYYY-MM-DD"),
  };
  try {
    fetching.value = true;
    const response = await requestJson({
      url: apiRoutes.dutymanager,
      params: defaultGetParams,
    });
    if (response.success) {
      rows.value = response.data;
    }
  } finally {
    fetching.value = false;
  }
});

const editingError = ref(null);


const editDialog = ref(false);
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
  date_start: {
    value: "",
    prevValue: "",
    validators: {
      required,
    },
    blurred: false,
    isDate: true
  },
  date_end: {
    value: "",
    prevValue: "",
    validators: {
      required,
    },
    blurred: false,
    isDate: true
  }
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

    if (object[key].isDate) {
      const formattedDate = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      object[key].value = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      object[key].prevValue = formattedDate;
    } else {
      object[key].prevValue = value;

    }

    object[key].blurred = false;
  });
};


const confirmEdit = async () => {
  const dStart = dayjs(selectedRow.date_start.value);
  const dEnd = dayjs(selectedRow.date_end.value);

  if (dEnd.isBefore(dStart)) {
    editingError.value = 'Дата начала позже даты окончания';
    return
  }
  const body = {};
  for (const [ key, inner ] of Object.entries(selectedRow)) {
    if (inner.edited) {
      if (inner.isDate) {
        body[key] = inner.value;
      } else {
        body[key] = inner.value;
      }
    }
  }
  console.log('body', body);
  const url = `${apiRoutes.dutymanager}/${selectedRow.id.value}`;
  const response = await requestJson({
    url,
    method: "PUT",
    body
  });
  // return console.log('response', response);
  if (!response.success) {
    return
  }
  const editedManagerIndex = rows.value.findIndex(item => item.id === selectedRow.id.value);
  Object.keys(rows.value[editedManagerIndex]).forEach(key => {
    if (selectedRow.hasOwnProperty(key)) {
      rows.value[editedManagerIndex][key] = selectedRow[key].value;
    }
  });
  console.log("confirmEdit");
  editDialog.value = false;
};

const showEditDialog = (row) => {
  setFields(row, selectedRow);
  editDialog.value = true;
};

const onHideDialog = () => {
  editingError.value = '';
}


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
