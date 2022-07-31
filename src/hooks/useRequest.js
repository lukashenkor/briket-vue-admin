import { notifyError, notifySuccess } from "src/utils/notification";


export default async function useRequest({ promise, message }) {
  const result = {
    success: true,
  };
  try {
    const response = await promise;
    console.log('response', response);
    if (response.status >= 200 && response.status < 300) {
      const data = response.data;
      if (data?.status?.toLowerCase() == 'error') {
        notifyError(`${message} выполнено с ошибкой. ${data.message}`);
        console.error("Request failed. Error: ", data.message);
        result.success = false;
        result.error = data.message;
      }
      result.data = data;
      if (message) {
        notifySuccess(`${message} выполнено успешно`);
      }
    }
  } catch (error) {
    console.error("Request failed. Error: ", error);
    notifyError(`${message} выполнено с ошибкой. ${JSON.stringify(error)}`);
    result.success = false;
    result.error = error;
  }
  return result;
}
