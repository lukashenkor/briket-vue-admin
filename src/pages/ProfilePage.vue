<template>
  <div class="profile">
    <q-card class="q-pa-md" bordered>
      <h3 class="text-center">Profile</h3>
      <q-separator inset spaced/>
      <div class="profile-body flex column items-center justify-sm-between">
        <q-input
          v-for="fieldsObject in user"
          :key="fieldsObject.name"
          v-model="fieldsObject.value"
          :label="fieldsObject.name"
          :type="fieldsObject.type === 'password' ? isPwd ? 'password' : 'text' : fieldsObject.type"
          filled
        >
          <template v-slot:append v-if="fieldsObject.type === 'password'">
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <div class="profile__buttons">
          <q-btn
            :disable="waitingResponse"
            label="Сохранить"
            color="positive"
            size="md"
          />
          <q-btn
            type="submit"
            label="Отмена"
            color="primary"
            size="md"
            @click="goBack"
          />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { useObject } from "src/hooks/useObject";
import { useRouter } from "vue-router";


const router = useRouter();
const waitingResponse = ref(false);
const required = val => !!val;
const isPwd = ref(true);
const minLength = num => val => val.length >= num;
const user = useObject({
  name: {
    value: '',
    prevValue: '',
    validators: {
      required,
      minLength: minLength(2),
    },
    blurred: false,
    type: "text",
  },
  password: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    type: "password"
  },
  password_confirm: {
    value: '',
    prevValue: '',
    validators: {
      required,
    },
    blurred: false,
    type: "password"
  },
});

onBeforeMount(() => {
  console.log('Получаем данные о пользователе');

  console.log('Object.keys(user)[0]', Object.keys(user)[0]);
});

const goBack = () => {
  router.back(1);
}
</script>

<style scoped>
.profile {
  max-width: 700px;
  margin: auto;
}

.profile-body > label {
  min-width: 250px;
  margin: 10px 0;
}

.profile__buttons {
  display: flex;
  width: 50%;
  justify-content: space-around;
}
</style>
