import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import routes from './routes'
import '../api/index';
import { useUserStore } from "stores/user";
import { computed } from "vue";
import { hasRole } from "src/utils/validators";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function(/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const userRoles = computed(() => userStore.data.roles);
    const accessToken = computed(() => userStore.accessToken);
    const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

    if (to.name !== 'Login' && !accessToken.value) {
      next(loginQuery);
      /* const response = await requestJson({
        url: apiRoutes.data,
      });
      console.log('response', response);
      if (!response.success) {
        next(loginQuery)
      } else {
        const userStore = useUserStore();
        userStore.updateRoles(response.data.roles || []);
        next()
      } */
    } else if ((to.name === 'Login' && accessToken.value) || (to.meta.role && !hasRole(to.meta.role, userRoles.value) )) {
      next('/')
    } else {
      // axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
      next()
    }
  })

  return Router
})
