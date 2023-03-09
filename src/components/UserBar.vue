<template>
  <div class="user-bar">
    <span>{{ nameFirstLetter }}</span>
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item clickable v-close-popup @click="goToProfile">
          <q-item-section>Профиль</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="logout">
          <q-item-section>Выйти</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "stores/user";
import { apiRoutes, requestJson } from "src/api";


const store = useUserStore();
const router = useRouter();
const props = defineProps(['modelValue']);
const nameFirstLetter = computed(() => {
  return props.modelValue ? props.modelValue[0].toUpperCase() : '?';
})

const goToProfile = () => {
  router.push("/profile");
};

const logout = async () => {
  localStorage.clear();
  await requestJson({
    url: apiRoutes.logout,
    method: "POST",
    message: "Выход из аккаунта",
  });
  store.$reset();
  await router.push('/login')
};
</script>

<style scoped>
  .user-bar {
    border-radius: 50%;
    border: 1px solid #ffffff;
    background-color: #5db28d;
    width: 50px;
    height: 50px;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .user-bar > * {
    margin: 0;
  }

  .user-bar > span {
    font-size: 28px;
  }
</style>
