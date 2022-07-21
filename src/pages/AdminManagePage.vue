<template>
  <div class="admin-manage">
    <q-table
      :columns="columns"
      :rows="data.admins"
      row-key="email"
      no-data-label="Список администраторов пуст"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="username" :props="props">
            {{ props.row.username }}
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="actions" :props="props" class="table-actions">
            <q-icon name="edit" color="yellow-7" size="sm" />
            <q-icon name="delete" color="red-7" size="sm" @click="showDeleteDialog(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <DeleteAdminDialog @deleteAdmin="deleteAdmin" v-model="deleteDialog" :username="pickedUser.username" :email="pickedUser.email" />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import DeleteAdminDialog from 'components/AdminManage/DeleteAdminDialog';


const columns = [
  { name: 'username', label: 'Username', field: 'username', sortable: true, align: "center" },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: "center" },
  { name: 'actions', label: 'Actions', field: 'actions', align: "center" },
]

const data = reactive(
  {admins: [{username: "Roman", email: "qwerty@qwerty.com", }]})

const pickedUser = reactive({});

const deleteDialog = ref(false);
const showDeleteDialog = (row) => {
  pickedUser.username = row.username;
  pickedUser.email = row.email;
  deleteDialog.value = true;
};

const deleteAdmin = () => {
  console.log('qjdkjkljdsakdkqwl');
  data.admins = data.admins.filter((el) => el.email !== pickedUser.email);
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

.delete-admin-dialog__button {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
</style>
