<template>
  <div class="admin-manage">
    <q-table
      :columns="columns"
      :rows="data.admins"
      row-key="email"
      no-data-label="Список администраторов пуст"
      :rows-per-page-options="[10, 20, 0]"
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

          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="edit" color="warning" size="sm" @click="showEditDialog(props.row)" />
            <q-icon name="delete" color="negative" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <DraggableDialog v-model="deleteDialog" min-height="300" title="Удаление администратора" @onHide="onHideDialog(selectedAdmin)">
      <h3>Удалить администратора <span style="color: #374bc9">{{ selectedAdmin.username.value }}</span>?</h3>
      <div class="dialog-buttons">
        <q-btn
          label="Удалить"
          color="negative"
          :disable="waitingResponse"
          @click="deleteAdmin"
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
        v-for="field in Object.values(selectedAdmin).filter(item => !item.hidden)"
        :key="field.input?.name"
        v-model="field.value"
        v-bind="field.input"
        class="dialog-input"
        @blur="blurred(selectedAdmin, field.input.name)"
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
        v-show="editAdminError"
        class="text-negative"
      >{{ editAdminError }}</p>
    </DraggableDialog>

    <DraggableDialog v-model="createDialog" title="Добавление администратора" @onHide="onHideDialog(createAdmin)">
      <q-input
        v-for="field in createAdmin"
        :key="field.input.name"
        v-model="field.value"
        v-bind="field.input"
        class="dialog-input"
        @blur="blurred(createAdmin, field.input.name)"
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
        v-show="createAdminError"
        class="text-negative"
      >{{ createAdminError }}</p>
    </DraggableDialog>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import { isEmailValid, isUsernameValid } from "src/utils/validate";
import { useEditField } from "src/hooks/useEditField";
import { apiRoutes, requestJson } from "src/api";


const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'login', label: 'Login', field: 'login', sortable: true, align: "left", readonly: false, },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: "left", editable: true, readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', align: "left", readonly: true, },
];

const data = reactive({});

onBeforeMount(async () => {
  const response = await requestJson({
    url: apiRoutes.admins
  });
  if (response.success) {
    data.admins = response.data;
  }
});

const required = val => !!val;
const minLength = num => val => val.length >= num;
const passwordMinLength = 8;
const isPwd = ref(true);
const passwordInputType = computed(() => isPwd.value ? "password" : "text");
const waitingResponse = ref(false);

const selectedAdmin = useEditField({
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
    input: {
      name: "login",
      label: "Login",
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
    input: {
      name: "password",
      label: "Password",
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
    input: {
      name: "password_confirm",
      label: "Password Confirm",
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
    input: {
      name: "name",
      label: "Name",
      type: "text",
    },
  },
});


const createAdmin = useEditField({
  login: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    input: {
      label: "Login",
      name: "login",
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
    input: {
      name: "password",
      label: "Password",
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
    input: {
      name: "password_confirm",
      label: "Password Confirm",
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
    input: {
      name: "name",
      label: "Name",
      type: "text",
    },
  },
});

const createAdminError = ref('');

const setAdminFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [key, value] = entry;
    if (object.hasOwnProperty(key)) {
      object[key].value = value;
      object[key].prevValue = value;
      object[key].blurred = false;
    }
  });
};

const blurred = (object, field) => {
  object[field].blurred = true;
}

const deleteDialog = ref(false);
const editDialog = ref(false);
const createDialog = ref(false);

const showDeleteDialog = (row) => {
  setAdminFields(row, selectedAdmin);
  deleteDialog.value = true;
};

const addAdmin = async () => {
  if (createAdmin.password.value !== createAdmin.password_confirm.value) {
    return createAdminError.value = "Пароли не совпадают"
  }
  const body = {
    login: createAdmin.login.value,
    password: createAdmin.password.value,
    name: createAdmin.name.value,
  };
  try {
    waitingResponse.value = true;
    const response = await requestJson({
      url: apiRoutes.admins,
      method: "POST",
      body,
    });
    if (response.success) {
      // TODO: Получать объект созданного администратора и добавление в общий массив
      /* data.admins.push({
        name: createAdmin.name.value,
        login: createAdmin.login.value,
        id: createAdmin.id.value,
      }); */
    }
  } finally {
    waitingResponse.value = false;
    createDialog.value = false;
  }
};

const editAdminError = ref(null);

const confirmEdit = async () => {
  // TODO: send put request to update admin data
  // const adminIndex = data.admins.findIndex(item => item.id === selectedAdmin.id.value);
  if (selectedAdmin.password.edited && selectedAdmin.password.value !== selectedAdmin.password_confirm.value) {
    return editAdminError.value = "Пароли не совпадают"
  }
  const body = {}
  for (const [ key, innerObject ] of Object.entries(selectedAdmin)) {
    if (innerObject.edited) {
      if (key.indexOf('confirm') + 1) continue;
      body[key] = innerObject.value;
      // data.admins[adminIndex][key] = innerObject.value;
    }
  }
  const url = `${ apiRoutes.admins }/${ selectedAdmin.id.value }`;
  const response = await requestJson({
    url,
    body,
    method: "PUT",
  });
};

const deleteAdmin = async () => {
  const url = `${ apiRoutes.admins }/${ selectedAdmin.id.value }`;
  try {
    waitingResponse.value = true;
    const response = await requestJson({
      url,
      method: "DELETE",
    });
    if (response.success) {
      data.admins = data.admins.filter(el => el.id !== selectedAdmin.id.value);
    }
  } finally {
    deleteDialog.value = false;
    waitingResponse.value = false;
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

const refreshAdminObject = (object) => {
  Object.keys(object).forEach(key => {
    object[key].value = '';
    object[key].prevValue = '';
    object[key].blurred = false;
    object[key].valid = true;
  })
};

const onHideDialog = (object) => {
  refreshAdminObject(object);
};

</script>

<style scoped>
.table-actions > * {
  margin-right: 20px;
}

.table-actions > *:last-child {
  margin-right: 0;
}

.table-actions i {
  transition: all 0.3s;
  cursor: pointer;
}

.table-actions i:hover {
  transform: scale(1.3);
}
</style>
