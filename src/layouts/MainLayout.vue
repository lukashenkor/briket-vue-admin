<template>
  <q-layout view="hHh Lpr lFf">
    <q-header reveal class="bg-blue">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ currentRoute }}</q-toolbar-title>
        <user-bar/>
      </q-toolbar>
    </q-header>
    <q-page-container class="flex">
      <router-view />
    </q-page-container>

    <q-drawer
      v-model="drawer"
      :width="200"
      :breakpoint="700"
      bordered
      class="bg-dark"
    >
      <q-scroll-area class="fit">
        <div class="drawer-list">
          <div v-for="page in pages" :key="page.label" class="drawer-list__element">
            <router-link
              class="router-link"
              :to="page.path"
            >
              {{ page.label }}
            </router-link>
          </div>
        </div>

      </q-scroll-area>
    </q-drawer>

  </q-layout>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router/dist/vue-router';

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const drawer = ref(false)
    const currentRoute = computed(() => {
      return useRoute().name
    }).value

    const pages = [

      { label: 'Home', path: '/' },
      { label: 'Login', path: '/login' },
      { label: 'Create', path: '/create' },
      { label: 'Update', path: '/update' },
      { label: 'Delete', path: '/delete' },
    ];

    return {
      drawer,
      currentRoute,
      pages,
    }
  }
})
</script>

<style scoped>
.drawer-list {
  width: 100%;
}

.drawer-list__element {
  color: #ffffff;
  margin: 5px auto;
  position: relative;
  padding-left: 10px;
}

.drawer-list__element::after {
  content: "";
  width: 100%;
  height: 1px;
  color: #ffffff;
  position: absolute;
  bottom: 0;
  right: 0;
  border: 1px solid #fff;
}
</style>
