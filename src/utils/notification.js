import { Notify } from 'quasar'


export function notify(options) {
  Notify.create(options);
}


export function notifyError(message = 'Ошибка') {
  Notify.create({
    message: message,
    position: "top",
    color: "negative",
    icon: "error",
  });
}


export function notifySuccess(message = 'Успешно') {
  Notify.create({
    message: message,
    position: 'top',
    color: 'positive',
    icon: 'check_circle',
  });
}
