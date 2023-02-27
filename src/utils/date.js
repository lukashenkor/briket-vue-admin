import dayjs from 'dayjs';


export function parseQDateNavigationMinMaxMonthDate({ month, year }) {
  const date = dayjs().month(month - 1).year(year);
  return {
    minDate: date.startOf('month'),
    maxDate: date.endOf('month'),
  }
}
