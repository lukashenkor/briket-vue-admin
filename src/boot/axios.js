import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { apiRoutes, requestJson } from "src/api";
import { useUserStore } from "stores/user";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: "https://admin.omegapartners.ru" })
let routerInstance = null;
export default boot( async ({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  if (!routerInstance) routerInstance = router;

  const accessToken = JSON.parse(localStorage.getItem('access_token'));
  axios.defaults.baseURL = "https://admin.omegapartners.ru";
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

  const userStore = useUserStore();
  userStore.updateAccessToken(accessToken);

  const isLoginPage = !!(window.location.pathname.indexOf('/login') + 1);
  if (!isLoginPage || accessToken) {
    const response = await requestJson({
      url: apiRoutes.data,
    });
    if (response.success) {
      userStore.updateUserData(response.data);
    }
  }
})

export { api, routerInstance };
