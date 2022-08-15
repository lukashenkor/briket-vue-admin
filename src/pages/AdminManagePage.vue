<template>
  <FetchSpinnerComponent :fetching="fetching"/>
  <div class="admin-manage" v-if="!fetching">
    <q-table
      :columns="columns"
      :rows="data.admins"
      row-key="id"
      no-data-label="Список администраторов пуст"
      :rows-per-page-options="[10, 20, 0]"
      :pagination="{sortBy: 'id', descending: true}"
    >
      <template v-slot:top-right>
        <q-btn
          label="Добавить"
          color="positive"
          size="md"
          @click="showCreateDialog"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td key="login" :props="props">
            {{ props.row.login }}
          </q-td>

          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="usergroup" :props="props">
            {{ data.groups[props.row.usergroup]?.label }}
          </q-td>

          <q-td key="actions" :props="props" class="table-actions">
            <EditIconComponent @click="showEditDialog(props.row)"/>
            <DeleteIconComponent @click="showDeleteDialog(props.row)"/>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <DraggableDialog v-model="deleteDialog" min-height="300" title="Удаление администратора" @onHide="onHideDialog(selectedAdmin)">
      <h3>Удалить администратора <span style="color: #374bc9">{{ selectedAdmin.name.value }}</span>?</h3>
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

    <DraggableDialog v-model="editDialog" title="Редактирование администратора" @onHide="onHideDialog(selectedAdmin)">
      <q-input
        v-for="field in Object.values(selectedAdmin).filter(item => item.input)"
        :key="field.attributes?.name"
        v-model="field.value"
        v-bind="field.attributes"
        class="dialog-input"
        @blur="blurred(selectedAdmin, field.attributes.name)"
        :error="!field.valid && field.blurred"
        :error-message="field.errors.required ? 'Поле не может быть пустым' : field.errors.minLength ? `Минимальная длина ${passwordMinLength} символов` : ''"
      >
        <template v-slot:append>
          <q-icon
            v-if="field.name.indexOf('password') > -1"
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <q-select
        v-model="selectedAdmin.usergroup.value"
        v-bind="selectedAdmin.usergroup.attributes"
        class="dialog-input"
        :options="Object.values(data.groups)"
      >
      </q-select>
      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
          color="positive"
          @click="confirmEdit"
          :disable="isInvalidEditingAdmin || waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
      <p
        v-show="error"
        class="text-negative"
      >{{ error }}</p>
    </DraggableDialog>

    <DraggableDialog v-model="createDialog" title="Добавление администратора" @onHide="onHideDialog(createAdmin)">
      <q-input
        v-for="field in createAdmin"
        :key="field.attributes.name"
        v-model="field.value"
        v-bind="field.attributes"
        class="dialog-input"
        @blur="blurred(createAdmin, field.attributes.name)"
        :error="!field.valid && field.blurred"
        :error-message="field.errors.required ? 'Поле не может быть пустым' : field.errors.minLength ? `Минимальная длина ${passwordMinLength} символов` : ''"
      >
        <template v-slot:append>
          <q-icon
            v-if="field.name.indexOf('password') > -1"
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
          color="positive"
          @click="addAdmin"
          :disable="isInvalidCreatingAdmin || waitingResponse"
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
      <p
        v-show="error"
        class="text-negative"
      >{{ error }}</p>
    </DraggableDialog>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import FetchSpinnerComponent from "components/FetchSpinnerComponent";
import { useObject } from "src/hooks/useObject";
import { apiRoutes, requestJson } from "src/api";
import { useUtilsStore } from "stores/utils";
import { refreshFields, blurred } from "src/utils/object";
import { minLength, required } from "src/utils/validators";
import EditIconComponent from "components/EditIconComponent";
import DeleteIconComponent from "components/DeleteIconComponent";


const fetching = ref(false);
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'login', label: 'Логин', field: 'login', sortable: true, align: "left", readonly: false, },
  { name: 'name', label: 'Имя', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'usergroup', label: 'Группа', field: 'usergroup', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', align: "left", readonly: true, },
];

const data = reactive({});

onBeforeMount(async () => {
  fetching.value = true;
  Promise.all([
    requestJson({url: apiRoutes.admins}),
    requestJson({url: apiRoutes.groups}),
  ])
    .then(([adminsResponse, groupsResponse]) => {
      if (adminsResponse.success) {
        data.admins = adminsResponse.data;
      }
      if (groupsResponse.success) {
        data.groups = groupsResponse.data.reduce((acc, item) => {
          const {id, name} = item;
          return {...acc, [id]: {label: name, value: id}}
        }, {});
      }
      fetching.value = false;
    });
});

const utilsStore = useUtilsStore();
const passwordMinLength = 8;
const passwordMaxLength = 36;
const isPwd = ref(true);
const passwordInputType = computed(() => isPwd.value ? "password" : "text");
const waitingResponse = computed(() => utilsStore.waitingResponse);

const selectedAdmin = useObject({
  id: {
    value: null,
    hidden: true,
  },
  login: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    attributes: {
      name: "login",
      label: "Логин",
      type: "text",
    },
  },
  password: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(passwordMinLength),
    },
    blurred: false,
    attributes: {
      name: "password",
      label: "Пароль",
      type: passwordInputType,
      maxlength: passwordMaxLength,
    },
    input: true,
  },
  password_confirm: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(passwordMinLength),
    },
    blurred: false,
    attributes: {
      name: "password_confirm",
      label: "Подтвердите пароль",
      type: passwordInputType,
      maxlength: passwordMaxLength,
    },
    input: true,
  },
  name: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    attributes: {
      name: "name",
      label: "Имя",
      type: "text",
    },
    input: true,
  },
  usergroup: {
    value: '',
    prevValue: '',
    blurred: false,
    attributes: {
      name: "usergroup",
      label: "Группа",
      multiple: false,
      "stack-label": false,
    },
  },
});


const createAdmin = useObject({
  login: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    attributes: {
      name: "login",
      label: "Логин",
      type: "text",
    },
  },
  password: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(passwordMinLength),
    },
    blurred: false,
    attributes: {
      name: "password",
      label: "Пароль",
      type: passwordInputType,
      maxlength: 36,
    },
  },
  password_confirm: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(passwordMinLength),
    },
    blurred: false,
    attributes: {
      name: "password_confirm",
      label: "Подтвердите пароль",
      type: passwordInputType,
      maxlength: 36,
    },
  },
  name: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    attributes: {
      name: "name",
      label: "Имя",
      type: "text",
    },
  },
});

const error = ref('');

const setAdminFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [key, value] = entry;
    if (object.hasOwnProperty(key)) {
      if (key === "usergroup") {
        object[key].value = data.groups[row.usergroup]
        object[key].prevValue = data.groups[row.usergroup]
      } else {
        object[key].value = value;
        object[key].prevValue = value;
      }
        object[key].blurred = false;
    }
  });
};

const deleteDialog = ref(false);
const editDialog = ref(false);
const createDialog = ref(false);

const showDeleteDialog = (row) => {
  setAdminFields(row, selectedAdmin);
  deleteDialog.value = true;
};

const addAdmin = async () => {
  error.value = '';
  if (createAdmin.password.value !== createAdmin.password_confirm.value) {
    return error.value = "Пароли не совпадают"
  }
  const body = {
    login: createAdmin.login.value,
    password: createAdmin.password.value,
    name: createAdmin.name.value,
  };
  try {
    const response = await requestJson({
      url: apiRoutes.admins,
      method: "POST",
      body,
    });
    if (response.success) {
      data.admins.push(response.data);
    }
  } finally {
    createDialog.value = false;
  }
};

const confirmEdit = async () => {
  error.value = "";
  if (selectedAdmin.password.edited && selectedAdmin.password.value !== selectedAdmin.password_confirm.value) {
    return error.value = "Пароли не совпадают"
  }
  const body = {}
  for (const [ key, innerObject ] of Object.entries(selectedAdmin)) {
    if (innerObject.edited) {
      if (key.indexOf('password_confirm') + 1) continue;
      body[key] = typeof innerObject.value === "object"
        ? innerObject.value.value
        : innerObject.value;
    }
  }
  const url = `${ apiRoutes.admins }/${ selectedAdmin.id.value }`;
  try {
    const response = await requestJson({
      url,
      body,
      method: "PUT",
    });
    if (response.success) {
      const adminIndex = data.admins.findIndex(admin => admin.id === selectedAdmin.id.value);
      data.admins[adminIndex] = response.data;
    }
  } finally {
    editDialog.value = false;
  }
};

const confirmDelete = async () => {
  const url = `${ apiRoutes.admins }/${ selectedAdmin.id.value }`;
  try {
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response.success) {
      data.admins = data.admins.filter(el => el.id !== selectedAdmin.id.value);
    }
  } finally {
    deleteDialog.value = false;
  }
};


const isInvalidEditingAdmin = computed(() => {
  for (const [ key, value ] of Object.entries(selectedAdmin)) {
    if (value.hasOwnProperty('valid') && !value.valid) {
      if (key.indexOf('password') + 1 && !value.blurred) continue
      return true
    }
  }
  return false;
});

const isInvalidCreatingAdmin = computed(() => {
  for (const value of Object.values(createAdmin)) {
    if (value.hasOwnProperty('valid') && !value.valid) {
      return true;
    }
  }
  return false;
});

const showCreateDialog = () => {
  createDialog.value = true;
};

const showEditDialog = (row) => {
  setAdminFields(row, selectedAdmin);
  editDialog.value = true;
};

const onHideDialog = (object) => {
  refreshFields(object);
  error.value = "";
};

</script>

<style scoped>

</style>
