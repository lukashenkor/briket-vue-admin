<template>
  <div class="login">
    <h2>Login</h2>
    <q-form method="POST">
      <q-input
        label="Login"
        v-model="loginValue"
        type="text"
        outlined
      />
      <q-input
        label="Password"
        v-model="passwordValue"
        type="password"
        outlined
      />
      <q-btn
        type="button"
        label="Login"
        color="positive"
        size="md"
        @click="login(loginValue, passwordValue)"
      />
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiRoutes, request } from "src/api";
const loginValue = ref('');
const passwordValue = ref('');

const login = async (loginValue, passwordValue) => {
  // return console.log('apiRoutes.auth', apiRoutes.auth);

  const response = await request(
    apiRoutes.auth,
    'POST',
    {
      "username": loginValue.value,
      "password": passwordValue.value,
    }
  );
  console.log('response', response);
}

</script>

<style scoped>
  .login {
    padding: 40px;
    max-width: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-shadow: 2px 6px 11px -7px #e3e3e3;
    margin: auto;
    border-radius: 5px;
  }

  .login form {
    display: flex;
    flex-direction: column;
  }

  .login form > * {
    margin-bottom: 20px;
  }
</style>
