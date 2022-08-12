<template>
  <div class="login">
    <h2>Login</h2>
    <q-form method="POST" @submit.prevent="login">
      <q-input
        label="Login"
        v-model="loginValue"
        type="text"
        filled
        :rules="[required]"
        error-message="Поле не может быть пустым"
      />
      <q-input
        label="Password"
        v-model="passwordValue"
        :type="isPwd ? 'password' : 'text'"
        filled
        :rules="[required]"
        error-message="Поле не может быть пустым"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <q-btn
        :disable="waitingResponse"
        type="submit"
        label="Login"
        color="positive"
        size="md"
      />
    </q-form>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiRoutes, requestJson } from "src/api";
import { useUserStore } from "stores/user";
import { useUtilsStore } from "stores/utils";
import axios from "axios";
import { required } from "src/utils/validators";


const userStore = useUserStore();
const utilsStore = useUtilsStore();
const loginValue = ref("");
const passwordValue = ref("");
const isPwd = ref(true);
const waitingResponse = computed(() => utilsStore.waitingResponse);
const router = useRouter();
const route = useRoute();

const login = async () => {
  const response = await requestJson({
    url: apiRoutes.auth,
    method: "POST",
    body: {
      username: loginValue.value,
      password: passwordValue.value
    },
    message: "Авторизация",
  });

  if (response.success) {
    const data = response.data;
    saveUserData(data);
    const redirect = route.query.redirect || "/";
    await router.push(redirect);
  }
};


const saveUserData = (data) => {
  Object.entries(data).forEach(entry => {
    const [ key, value ] = entry;
    localStorage.setItem(key, JSON.stringify(value));
    if (key === "user") {
      userStore.updateUserData(value);
    }
  });
  const accessToken = JSON.parse(localStorage.getItem('access_token'));
  userStore.updateAccessToken(accessToken);
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
};

</script>

<style scoped>
.login {
  padding: 40px;
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-shadow: 4px 9px 22px 5px #e3e3e3;
  margin: 20px auto 40px;
  border-radius: 5px;
}

.login > h2 {
  margin-bottom: 20px;
}

.login form {
  display: flex;
  flex-direction: column;
  width: 300px;
}

.login form > * {
  margin-bottom: 20px;
}

.login form > button {
  width: 80%;
  margin: auto;
}
</style>
