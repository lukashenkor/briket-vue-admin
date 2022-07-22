<template>
  <div class="admin-manage">
    <q-table
      :columns="columns"
      :rows="data.admins"
      row-key="email"
      no-data-label="Список администраторов пуст"
    >
      <template v-slot:body="props">
        <q-tr :props="props"><!--
          <q-td key="username" :props="props">
            {{ props.row.username }}
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="edit" color="yellow-7" size="sm" @click="showEditDialog(props.row)" />
            <q-icon name="delete" color="red-7" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>
        -->
<!--          <q-td v-for="column in columns" :key="column.name" :props="props">
            {{ props.row[column.name] }}
            <q-popup-edit
              :model-value="props.row[column.name]"
              v-model="props.row[column.name]"
              :title="`Update ${column.name}`"
              buttons
              v-slot="scope"
              v-if="!column.readonly"
              :validate="validators[column.name]"
              @save="(value, initialValue) => confirmEdit(value, initialValue, props.row)"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="delete" color="red-7" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>-->
          <q-td key="username" :props="props">
            {{ props.row.username }}
            <q-popup-edit
              :model-value="props.row.username"
              v-model="props.row.username"
              v-slot="scope"
              buttons
              :validate="validators['username']"
            >
              <q-input type="text" v-model="scope.value" autofocus dense/>
            </q-popup-edit>
          </q-td>

          <q-td key="email" :props="props">
            {{ props.row.email }}
            <q-popup-edit
              :model-value="props.row.email"
              v-model="props.row.email"
              v-slot="scope"
              buttons
              :validate="validators['email']"
            >
              <q-input type="text" v-model="scope.value" autofocus dense/>
            </q-popup-edit>
          </q-td>

          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="edit" color="yellow-7" size="sm" @click="showEditDialog(props.row)" />
            <q-icon name="delete" color="red-7" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <DraggableDialog v-model="deleteDialog">
      <h3>Удалить администратора <span style="color: #374bc9">{{ selectedAdmin.username }}</span>?</h3>
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
          @click="onHideDialog"
          v-close-popup
        />
      </div>
    </DraggableDialog>

    <DraggableDialog v-model="editDialog">
      <h3>Редактирование администратора <span style="color: #374bc9">{{ selectedAdmin.username }}</span></h3>
      <pre>{{ editingAdmin.username }}</pre>
      <pre>{{ editingAdmin.email }}</pre>
      <q-input
        v-for="column in columns.filter(el => !el.readonly)"
        :key="column.name"
        v-model="editingAdmin[column.name].value"
        :label="column.name"
        :error="!editingAdmin[column.name].valid"
        :error-message="editingAdmin[column.name].errors.required ? 'Поле не может быть пустым' : ''"
      />
      <div class="dialog-buttons">
        <q-btn
          label="Сохранить"
          color="positive"
          @click="confirmEdit"
          v-close-popup
        />
        <q-btn
          label="Отмена"
          color="primary"
          @click="onHideDialog"
          v-close-popup
        />
      </div>
    </DraggableDialog>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
import DraggableDialog from "components/DraggableDialog";
import { isEmailValid, isUsernameValid } from "src/utils/validate";
import { useEditAdmin } from "src/hooks/useEditAdmin";


const columns = [
  { name: 'username', label: 'Username', field: 'username', sortable: true, align: "center", editable: true, readonly: false, },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: "center", readonly: false, },
  { name: 'actions', label: 'Actions', field: 'actions', align: "center", readonly: true, },
];

const data = reactive({});

onBeforeMount(() => {
  // TODO: get all admins request
  console.log("Отправлен запрос на список всех администраторов");
  data.admins = [
    {username: "Roman", email: "qwerty@qwerty.com", id: 1 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 2 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 3 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 4 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 5 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 6 },
    {username: "Roman", email: "qwerty@qwerty.com", id: 7 },
  ];
});

const validators = reactive({
  email: isEmailValid,
  username: isUsernameValid
});

const required = val => !!val;
const minLength = num => val => val.length >= num;


const selectedAdmin = reactive({});
// const editingAdmin = reactive({});

const deleteDialog = ref(false);
const editDialog = ref(false);

const showDeleteDialog = (row) => {
  selectedAdmin.username = row.username;
  selectedAdmin.email = row.email;
  deleteDialog.value = true;
};

const editingAdmin = useEditAdmin({
  username: {
    value: 'testUsername',
    validators: {
      required,
      minLength: minLength(2)
    }
  },
  email: {
    value: 'testEmail@gmail.com',
    validators: {
      required,
    }
  },
});

const showEditDialog = (row) => {
  // selectedAdmin.username = row.username;
  // selectedAdmin.email = row.email;
  /* Object.entries(row).forEach(entry => {
    const [key, value] = entry;
    editingAdmin[key] = value;
  }) */
  editDialog.value = true;
};

const confirmEdit = () => {
  const isValid = {};
  for (const [key, value] of Object.entries(editingAdmin)) {
    console.log('validators[key](value)', validators[key] && validators[key](value));
    isValid[key] = validators[key](value);
  }
  return
  Object.entries(editingAdmin).forEach(entry => {
    const [key, value] = entry;
    validators[key](value);
  });

  const adminIndex = data.admins.findIndex(item => item.id = editingAdmin.id);
  data.admins[adminIndex] = editingAdmin;
}

const deleteAdmin = () => {
  console.log('request to delete admin with email = ', selectedAdmin.email);
  data.admins = data.admins.filter((el) => el.email !== selectedAdmin.email);
}

const onHideDialog = () => {
  Object.entries(selectedAdmin).forEach(entry => {
    const [key, _] = entry;
    selectedAdmin[key] = '';
  })
}

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

.delete-admin-dialog {
  min-width: 600px;
  height: 400px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
}
</style>
