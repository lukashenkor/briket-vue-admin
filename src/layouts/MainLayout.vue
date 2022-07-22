<template>
  <q-layout view="hHh Lpr lFf">
    <q-header reveal class="bg-blue">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ currentPageName }}</q-toolbar-title>
        <UserBar :username="user.username"/>
      </q-toolbar>
    </q-header>
    <q-page-container class="flex">
      <div class="page">
        <router-view />
      </div>
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
          <div
            v-for="page in pages"
            :key="page.name"
            class="drawer-list__element"
          >
            <router-link
              :to="page.path"
              v-if="!page.requiredRole ||
              user.roles.indexOf(page.requiredRole) >
               -1"
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
import { useRoute } from 'vue-router/dist/vue-router';
import UserBar from 'components/UserBar'
import { pagesName } from "src/utils/variables";
import Routes from "src/router/routes";

export default defineComponent({
  name: 'MainLayout',
  components: {
    UserBar,
  },

  setup () {
    const drawer = ref(false)
    const currentPageName = computed(() => {
      return pagesName[useRoute().name]
    });

    console.log(Routes);

    const pages = Routes[0].children.map(item => item);
    console.log('pages', pages);

    const user = {
      username: 'Roman',
      roles: ['admin', 'superadmin'],
    }

    return {
      drawer,
      currentPageName,
      pages,
      user,
      pagesName,
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

.page {
  max-width: 1000px;
  width: 100%;
  margin: 20px auto;
  border-radius: 5px;
}
</style>
