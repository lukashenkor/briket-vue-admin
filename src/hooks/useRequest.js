import { notifyError } from "src/utils/notification";
import { useUtilsStore } from "stores/utils";


export default async function useRequest({ promise, message, notif }) {
  const utilsStore = useUtilsStore();
  const result = {
    success: true
  };
  try {
    utilsStore.updateWaitingResponse(true);
    const response = await promise;
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
