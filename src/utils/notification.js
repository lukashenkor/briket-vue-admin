import { Notify } from "quasar";


export function getNotify(method) {
  return method.toUpperCase() !== "GET" ?
    notify({
      type: "ongoing",
      message: "Ожидается ответ от сервера",
    })
    : null;
}


export function notify(options) {
  return Notify.create({ ...options, actions: [ { icon: "close", color: "white" } ] });
}


export function notifyError(message = "Ошибка") {
  Notify.create({
    message: message,
    position: "bottom",
    color: "negative",
    icon: "error",
    actions: [ { icon: "close", color: "white" } ],
  });
}


export function notifySuccess(message = "Успешно") {
  Notify.create({
    message: message,
    position: "bottom",
    color: "positive",
    icon: "check_circle",
    actions: [ { icon: "close", color: "white" } ],
  });
}
