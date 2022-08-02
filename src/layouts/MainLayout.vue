<template>
  <q-layout view="hHh Lpr lFf">
    <q-header reveal class="bg-blue">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ currentPageName }}</q-toolbar-title>
        <UserBar v-model="user" v-if="user?.username"/>
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
              v-if="!page.requiredRole || user.roles.indexOf(page.requiredRole) > -1"
              class="router-link"
              exact-active-class="router-link-active"
              exact
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
import { computed, defineComponent, ref } from 'vue'
import { useRouter, useRoute } from "vue-router";
import Routes from "src/router/routes";
import UserBar from 'components/UserBar'


export default defineComponent({
  name: 'MainLayout',
  components: {
    UserBar,
  },

  setup () {
    const router = useRouter();
    const drawer = ref(true);
    const pages = Routes[0].children.filter(page => !page.hidden);
    const currentPageName = computed(() => {
      return pages.find(page => page.name === useRoute().name)?.title || 'Домашняя страница';
    });

    const user = JSON.parse(localStorage.getItem('user'));


    return {
      drawer,
      currentPageName,
      pages,
      user,
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

.my-page-layout {
  padding: 10px;
  width: 90%;
  margin: 20px auto;
  border-radius: 5px;
  overflow-y: auto;
}
</style>
