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
          <q-td key="username" :props="props">
            {{ props.row.username }}
          </q-td>

          <q-td key="email" :props="props">
            {{ props.row.email }}
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
          @click="deleteAdmin"
          v-close-popup
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
        v-for="column in columns.filter(el => !el.readonly)"
        :key="column.name"
        v-model="selectedAdmin[column.name].value"
        :label="column.name"
        :error="!selectedAdmin[column.name].valid"
        :error-message="selectedAdmin[column.name].errors.required ? 'Поле не может быть пустым' : ''"
        class="dialog-input"
      />
      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
          color="positive"
          @click="confirmEdit"
          :disable="isInvalidEditingAdmin"
          v-close-popup
        />
        <q-btn
          label="Отмена"
          color="primary"
          v-close-popup
        />
      </div>
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
          :disable="isInvalidCreatingAdmin"
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
  { name: 'username', label: 'Username', field: 'username', sortable: true, align: "center", editable: true, readonly: false, },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: "center", readonly: false, },
  { name: 'actions', label: 'Действия', field: 'actions', align: "center", readonly: true, },
];

const data = reactive({});

onBeforeMount(async () => {
  const request = await requestJson({
    url: apiRoutes.admins
  });
  console.log('request', request);
  data.admins = [
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    { username: "Roman", email: "qwerty@qwerty.com", id: 7 },
  ];
});

const required = val => !!val;
const minLength = num => val => val.length >= num;
const passwordMinLength = 8;
const isPwd = ref(true);
const passwordInputType = computed(() => isPwd.value ? "password" : "text");

const selectedAdmin = useEditField({
  username: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(2),
    },
    blurred: false,
  },
  email: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
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
    },
  },
  username: {
    value: '',
    prevValue: '',
    validators: {
      required
    },
    blurred: false,
    input: {
      name: "username",
      label: "Username",
      type: "text",
    },
  },
});

const createAdminError = ref('');

const setAdminFields = (row, object) => {
  Object.entries(row).forEach(entry => {
    const [key, value] = entry;
    if (!object.hasOwnProperty(key)) {
      object[key] = {
        value: value,
      };
    } else {
      object[key].value = value;
    }

    object[key].prevValue = value;
    object[key].blurred = false;
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

const addAdmin = () => {
  //  TODO: send post request to add new admin
  if (createAdmin.password !== createAdmin.password_confirm) {
    return createAdminError.value = "Пароли не совпадают"
  }
  data.admins.push({
    username: createAdmin.username.value,
    email: createAdmin.email.value,
    id: 1000,
  });
};

const confirmEdit = () => {
  // TODO: send put request to update admin data
  const adminIndex = data.admins.findIndex(item => item.id === selectedAdmin.id.value);
  for (const [ key, innerObject ] of Object.entries(selectedAdmin)) {
    if (innerObject.edited) {
      data.admins[adminIndex][key] = innerObject.value;
    }
  }
};

const deleteAdmin = () => {
  // TODO: send delete request to delete admin
  data.admins = data.admins.filter(el => el.email !== selectedAdmin.email.value);
};

const isInvalidEditingAdmin = computed(() => {
  for (const value of Object.values(selectedAdmin)) {
    if (value.hasOwnProperty('valid') && !value.valid) {
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
