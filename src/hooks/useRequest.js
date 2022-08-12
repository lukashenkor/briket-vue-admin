import { notify, notifyError } from "src/utils/notification";
import { useUtilsStore } from "stores/utils";
import route from "src/router";
import { useUserStore } from "stores/user";
import { routerInstance } from "boot/axios";


export default async function useRequest({ promise, message, notif }) {
  const utilsStore = useUtilsStore();
  const userStore = useUserStore();
  const result = {
    success: true
  };
  try {
    utilsStore.updateWaitingResponse(true);
    const response = await promise;
    console.log('response', response);

    if (response.status >= 200 && response.status < 300) {
      const data = response.data;
      if (data?.status?.toLowerCase() == "error") {
        console.error("Request failed. Error: ", data.message);
        result.success = false;
        result.error = data.message;
      }
      result.data = data;
    }
  } catch (error) {
    console.log('error', error.response.status);
    const status = error.response.status;
    if (status === 401) {
      const router = routerInstance;
      userStore.$reset();
      await router.push('/login');
      notify({
        message: "Вы не авторизованы. Пожалуйста, авторизуйтесь",
        color: "warning",
        position: "bottom",
        icon: "error",
      });
    }
    result.success = false;
    result.error = error;
  } finally {
    utilsStore.updateWaitingResponse(false);
    if (notif && (message || !result.success)) {
      notif({
        type: result.success ? "positive" : "negative",
        message: result.success
          ? `${ message } выполнено успешно`
          : `${ message } выполнено с ошибкой. ${ JSON.stringify(result.error) }`
      });
    }
    /* if (!notif && !result.success) {
      notifyError(`${ message } выполнено с ошибкой. ${ JSON.stringify(result.error) }`);
    } */
  }
  return result;
}
