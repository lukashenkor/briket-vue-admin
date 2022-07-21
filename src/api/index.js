import Vue from 'vue'
export const BASE_URL = "http://briket-admin.semjef.ru";

export const apiRoutes = {
  auth: "/token/auth/"
}

export const request = async (url, method = 'URL', body) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    }
  };
  body && (options.body = JSON.stringify(body));
  url = BASE_URL + url;
  const response = await fetch(url, options);
  console.log('response', response);
}
