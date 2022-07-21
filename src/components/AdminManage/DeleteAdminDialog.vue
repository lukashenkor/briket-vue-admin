<template>
  <q-dialog
    ref="myDialog"
  >
    <div class="delete-admin-dialog">
      <h3>Удалить администратора <span style="color: #374bc9">{{ username }}</span>?</h3>
      <div class="delete-admin-dialog__button">
        <q-btn
          label="Удалить"
          color="negative"
          @click="deleteAdmin"
        />
        <q-btn
          label="Отмена"
          color="primary"
          @click="hideDialog"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";


const props = defineProps(['username', 'email']);
const emit = defineEmits([ "deleteAdmin" ]);
const myDialog = ref(null);

const hideDialog = () => {
  myDialog.value.hide();
}

const deleteAdmin = () => {
  console.log('request to delete admin with email = ', props.email);
  emit("deleteAdmin");
  hideDialog();
}

</script>

<style scoped>
.delete-admin-dialog {
  min-width: 600px;
  height: 400px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.delete-admin-dialog__button {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
</style>
