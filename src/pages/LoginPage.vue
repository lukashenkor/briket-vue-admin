<template>
  <div class="login">
    <h2>Login</h2>
    <q-form method="POST" @submit.prevent="login">
      <q-input
        label="Login"
        v-model="loginValue"
        type="text"
        filled
      />
      <q-input
        label="Password"
        v-model="passwordValue"
        :type="isPwd ? 'password' : 'text'"
        filled
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiRoutes, requestJson } from "src/api";
import { notifySuccess, notifyError } from "src/utils/notification";


const loginValue = ref("");
const passwordValue = ref("");
const isPwd = ref(true);
const waitingResponse = ref(false);
const router = useRouter();

const login = async () => {
  waitingResponse.value = true;
  try {
    const response = await requestJson({
      url: apiRoutes.auth,
      method: "POST",
      body: {
        username: loginValue.value,
        password: passwordValue.value
      }
    });

    if (response.success) {
      const data = response.data;
      saveUserData(data);
      notifySuccess("Успешная авторизация");
      router.push("/");
    }
  } finally {
    waitingResponse.value = false;
  }


  // console.log('response', response);
};


const saveUserData = (data) => {
  // Object.entries(data).forEach(entry => {
  //   const [ key, value ] = entry;
  //   localStorage.setItem(key, JSON.stringify(value));
  // });
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
