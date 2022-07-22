import { Notify } from 'quasar'


export default function useNotify({ message, position, color, icon = '' }) {
  Notify.create({
    message,
    position,
    color,
    icon
  })
}
