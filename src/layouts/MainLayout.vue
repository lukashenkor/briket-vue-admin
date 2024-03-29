<template>
  <q-layout view="hHh Lpr lFf">
    <q-header reveal class="bg-blue">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ currentPageName }}</q-toolbar-title>
        <UserBar v-model="username" v-if="username"/>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div class="my-page-layout">
        <router-view />
      </div>
    </q-page-container>

    <q-drawer
      v-model="drawer"
      :width="200"
      :breakpoint="700"
      class="bg-grey-9"
      v-if="!isLoginPage"
      elevated
    >
      <q-scroll-area class="fit">
        <div class="drawer-list">
          <div
            v-for="page in pages"
            :key="page.name"
            class="drawer-list__element"
          >
            <router-link
              :to="page.path"
              v-if="!page.requiredRole"
              class="router-link"
              exact-active-class="router-link-active"
              exact
              @click.prevent="drawer = false"
            >
              {{ page.title }}
            </router-link>
          </div>
        </div>

      </q-scroll-area>
    </q-drawer>

  </q-layout>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import Routes from "src/router/routes";
import UserBar from 'components/UserBar'
import { useUserStore } from "stores/user";
import { hasRole } from "src/utils/validators";


export default defineComponent({
  name: 'MainLayout',
  components: {
    UserBar,
  },

  setup () {
    const store = useUserStore();
    const userRoles = computed(() => store.data.roles);
    const drawer = ref(true);
    const route = useRoute();
    const pages = computed(() => Routes[0].children.filter(page => !page.hidden && (!page.meta?.role || hasRole(page.meta?.role, userRoles.value))));
    const currentPageName = computed(() => {
      return Routes[0].children.find(page => page.name === route.name)?.title || 'Домашняя страница';
    });

    const isLoginPage = computed(() => currentPageName.value.toLowerCase().indexOf('логин') > -1)

    const username = computed(() => store.getUsername);

    return {
      drawer,
      currentPageName,
      pages,
      username,
      isLoginPage
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
  margin: 10px 5px;
  position: relative;
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
  border-radius: 100px;
}

.my-page-layout {
  padding: 10px;
  width: 100%;
  margin: 0 auto;
  border-radius: 5px;
  overflow-y: auto;
  height: 100%;
}
</style>
