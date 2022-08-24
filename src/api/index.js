import axios from "axios";
import useRequest from "src/hooks/useRequest";
import { getNotify } from "src/utils/notification";


const methodToMessage = {
  "PUT": "Редактирование данных",
  "DELETE": "Удаление данных",
  "POST": "Добавление данных",
};
export const apiRoutes = {
  data: "/api/token/data",
  auth: "/api/token/auth",
  logout: "/api/token/remove",
  feedback: "/api/feedback",
  events: "/api/events",
  alerts: "/api/alerts",
  news: "/api/news",
  promo: "/api/additional/promo",
  guides: "/api/additional/guides",
  knowledge: "/api/additional/knowledge",
  additionalReports: "/api/additional/reports",
  dutymanager: "/api/dutymanager",
  invoice: "/api/finance/invoices",
  goals: "/api/corners/[id]/goal", // must replace [id] with corner's id when set request options
  report: "/api/finance/report",
  corners: "/api/corners",
  admins: "/api/admins",
  groups: "/api/admingroups",
  roles: "/api/adminroles",
  adminRoles: "/api/admingrouprole",
};

export const requestJson = async ({ url, method = "GET", body, params, message }) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    url: url,
  };
  if (body) {
    options.data = body;
  } else {
    options.params = params;
  }
  const notif = ![apiRoutes.data].includes(url) && getNotify(method);
  return useRequest({
    promise: axios(options),
    message: message || methodToMessage[method],
    notif,
  });
};


export const requestForm = async ({ url, method = "POST", formData }) => {
  const options = {
    url: url,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method,
    data: formData,
    decompress: false,
  };
  const notif = getNotify(method);
  return useRequest({
    promise: axios(options),
    message: methodToMessage[method],
    notif,
  });
};
