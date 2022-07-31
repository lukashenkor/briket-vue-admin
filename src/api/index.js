import axios from "axios";
import useRequest from "src/hooks/useRequest";


const methodToMessage = {
  "PUT": "Редактирование данных",
  "DELETE": "Удаление данных"
};
// old_token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTY4NDI5ODksIm5iZiI6MTY1Njg0Mjk4OSwianRpIjoiMjI5NTRhMjYtOWZjMi00NTM1LTljNGUtMzk2MjM2ODRmZjJiIiwiZXhwIjoxNjg4Mzc4OTg5LCJpZGVudGl0eSI6InRlc3QiLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2NsYWltcyI6eyJyb2xlcyI6WyJjb3JuZXJzLXJlYWQiLCJjb3JuZXJzLWNyZWF0ZSIsImNvcm5lcnMtdXBkYXRlIiwiY29ybmVycy1kZWxldGUiLCJhZGRpdGlvbmFsX2d1aWRlcyIsImFkZGl0aW9uYWxfa25vd2xlZGdlIiwiYWRkaXRpb25hbF9wcm9tbyIsImFkZGl0aW9uYWxfcmVwb3J0cyIsImFkbWlucyIsImFkbWluLXJvbGVzIiwiYWxlcnRzIiwiY29ybmVycy1nb2FsIiwiY29ybmVycy1zdW1tIiwiZHV0eW1hbmFnZXJzIiwiZXZlbnRzIiwiZmVlZGJhY2siLCJmaW5hbmNlX2ludm9pY2VzIiwiZmluYW5jZV9yZXBvcnQiLCJsb2dzIiwiYWN0aW9uLWxvZ3MiLCJhZG1pbi1hY3Rpb24tbG9ncyIsIm5ld3MiLCJyZXF1ZXN0cy1yZWFkIiwicmVxdWVzdHMtdXBkYXRlIiwicmVxdWVzdHMtZGVsZXRlIiwidXNlcnMiLCJ1c2VyLXJvbGVzIiwiZmluYW5jZV9zdGF0Il19fQ.5xJdMXfLJwdFQXpkpPniwt8_PBrWfTIaJ-s0EqLlueA
export const apiRoutes = {
  auth: "/token/auth",
  events: "/api/events",
  feedback: "/api/feedback",
  news: "/api/news",
  promo: "/api/additional/promo",
  guides: "/api/additional/guides",
  knowledge: "/api/additional/knowledge",
  dutymanager: "/api/dutymanager",
  invoice: "/api/finance/invoices",
  goals: "/api/corners/[id]/goal",
  corners: "/api/corners",
};

axios.defaults.baseURL = 'https://admin.omegapartners.ru';

export const requestJson = async ({ url, method = "GET", body, params }) => {
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
  return useRequest({
    promise: axios(options),
    message: methodToMessage[method]
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
  return useRequest({
    promise: axios(options),
    message: methodToMessage[method]
  });
}
