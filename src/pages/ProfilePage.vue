<template>
  <div class="profile">
    <q-card class="q-pa-md" bordered>
      <h3 class="text-center">Профиль</h3>
      <q-separator inset spaced/>
      <div class="profile-body__choice flex row justify-center q-pa-md" v-if="!editMode">
        <q-btn
          class="q-ma-md"
          label="Изменить пароль"
          color="warning"
          @click="editMode = 'password'"
        />
        <q-btn
          class="q-ma-md"
          label="Изменить имя"
          color="warning"
          @click="editMode = 'name'"
        />
      </div>
      <div class="profile-body__action flex column items-center justify-sm-between" v-if="editMode">
        <q-form @submit.prevent="submitHandler" style="width: 80%;">
          <FieldInput
            v-for="fieldsObject in Object.values(user).filter(inputsTypeFilter)"
            :key="fieldsObject.attributes.name"
            v-model="fieldsObject.value"
            :field="fieldsObject"
            @blur="fieldsObject.blurred = true"
          />
          <p class="text-negative text-subtitle1 ">{{ errorMessage }}</p>
          <div class="profile-body__buttons">
            <q-btn
              :disable="waitingResponse"
              label="Сохранить"
              color="positive"
              size="md"
              type="submit"
            />
            <q-btn
              type="button"
              label="Отмена"
              color="primary"
              size="md"
              @click="refreshData"
            />
          </div>
        </q-form>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useObject } from "src/hooks/useObject";
import { minLength, required } from "src/utils/validators";
import { refreshFields } from "src/utils/object";
import { apiRoutes, requestJson } from "src/api";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia/dist/pinia";
import FieldInput from "components/FieldInput";


const userStore = useUserStore();
const { data: userData } = storeToRefs(userStore);
const waitingResponse = ref(false);
const editMode = ref("");
const passwordMinLength = 8;
const passwordMaxLength = 36;
const user = useObject({
  name: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    attributes: {
      name: "name",
      label: "Имя",
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
      type: "password",
      errorMessage: `Минимальная длина пароль ${passwordMinLength} символов`,
      maxlength: passwordMaxLength,
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
      type: "password",
      errorMessage: `Минимальная длина пароль ${passwordMinLength} символов`,
      maxlength: passwordMaxLength,
    },
  },
});

const submitHandler = async evt => {
  if (errorMessage.value) return;
  const body = {};
  for (const [ key, value ] of new FormData(evt.target)) {
    if (key === 'password_confirm') continue
    body[key] = value;
  }
  const url = `${apiRoutes.admins}/${userData.value.id}`
  try {
    await requestJson({
      url,
      body,
      method: "PUT",
    });
  } finally {
    refreshData();
  }
};

const refreshData = () => {
  refreshFields(user);
  editMode.value = null;
};

const inputsTypeFilter = item => {
  if (editMode.value === "password") {
    return item.attributes.type === 'password'
  } else {
    return item.attributes.type !== 'password'
  }
};

const errorMessage = computed(() => user.password.blurred && user.password_confirm.blurred && user.password.value !== user.password_confirm.value ? "Пароли не совпадают" : "");
</script>

<style scoped>
.profile {
  max-width: 700px;
  margin: auto;
}

.profile-body__action > label {
  min-width: 250px;
  margin: 10px 0;
}

.profile-body__buttons {
  display: flex;
  width: 60%;
  justify-content: space-between;
  margin: auto;
}
</style>
