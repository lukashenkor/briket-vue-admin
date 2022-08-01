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
};


const saveUserData = (data) => {
  Object.entries(data).forEach(entry => {
    const [ key, value ] = entry;
    localStorage.setItem(key, JSON.stringify(value));
  });
  // TODO: Remove hardcode below when access_token problem is solved
  localStorage.setItem('access_token', JSON.stringify("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTY4NDI5ODksIm5iZiI6MTY1Njg0Mjk4OSwianRpIjoiMjI5NTRhMjYtOWZjMi00NTM1LTljNGUtMzk2MjM2ODRmZjJiIiwiZXhwIjoxNjg4Mzc4OTg5LCJpZGVudGl0eSI6InRlc3QiLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2NsYWltcyI6eyJyb2xlcyI6WyJjb3JuZXJzLXJlYWQiLCJjb3JuZXJzLWNyZWF0ZSIsImNvcm5lcnMtdXBkYXRlIiwiY29ybmVycy1kZWxldGUiLCJhZGRpdGlvbmFsX2d1aWRlcyIsImFkZGl0aW9uYWxfa25vd2xlZGdlIiwiYWRkaXRpb25hbF9wcm9tbyIsImFkZGl0aW9uYWxfcmVwb3J0cyIsImFkbWlucyIsImFkbWluLXJvbGVzIiwiYWxlcnRzIiwiY29ybmVycy1nb2FsIiwiY29ybmVycy1zdW1tIiwiZHV0eW1hbmFnZXJzIiwiZXZlbnRzIiwiZmVlZGJhY2siLCJmaW5hbmNlX2ludm9pY2VzIiwiZmluYW5jZV9yZXBvcnQiLCJsb2dzIiwiYWN0aW9uLWxvZ3MiLCJhZG1pbi1hY3Rpb24tbG9ncyIsIm5ld3MiLCJyZXF1ZXN0cy1yZWFkIiwicmVxdWVzdHMtdXBkYXRlIiwicmVxdWVzdHMtZGVsZXRlIiwidXNlcnMiLCJ1c2VyLXJvbGVzIiwiZmluYW5jZV9zdGF0Il19fQ.5xJdMXfLJwdFQXpkpPniwt8_PBrWfTIaJ-s0EqLlueA"));
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
