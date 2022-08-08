import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import routes from './routes'
import axios from "axios";
import '../api/index';
import { apiRoutes, requestJson } from "src/api";

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
    const accessToken = JSON.parse(localStorage.getItem('access_token'));
    const loginQuery = { path: "/login", query: { redirect: to.fullPath } };
    if (
      to.name !== 'Login' &&
      (!accessToken)
    ) {
      const response = await requestJson({
        url: apiRoutes.data,
      });
      console.log('response', response);
      if (!response.success) {
        next(loginQuery)
      } else {
        next()
      }
    } else if (to.name === 'Login' && accessToken) {
      next('/')
    } else {
      // axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
      next()
    }
  })

  return Router
})
