import { notifyError } from "src/utils/notification";


export default async function useRequest({ promise, message, notif }) {
  const result = {
    success: true
  };
  try {
    const response = await promise;
    if (response.status >= 200 && response.status < 300) {
      const data = response.data;
      if (data?.status?.toLowerCase() == "error") {
        // notifyError(`${message} выполнено с ошибкой. ${data.message}`);
        console.error("Request failed. Error: ", data.message);
        result.success = false;
        result.error = data.message;
      }
      result.data = data;
      /* if (message) {
       notifySuccess(`${message} выполнено успешно`);
       } */
    }
  } catch (error) {
    console.error("Request failed. Error: ", error);
    notifyError(`${ message } выполнено с ошибкой. ${ JSON.stringify(error) }`);
    result.success = false;
    result.error = error;
  } finally {
    if (notif && (message || !result.success)) {
      notif({
        type: result.success ? "positive" : "negative",
        message: result.success
          ? `${ message } выполнено успешно`
          : `${ message } выполнено с ошибкой. ${ result.error.message }`
      });
    }
    if (!notif && !result.success) {
      notifyError(`${ message } выполнено с ошибкой. ${ result.error.message }`);
    }
  }
  return result;
}
