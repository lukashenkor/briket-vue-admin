
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home', path: '', component: () => import('pages/HomePage.vue'), title: "Домашняя страница", },
      { path: '/login', component: () => import('pages/LoginPage.vue'), title: "Логин", name: 'Login', },
      { name: 'Admin Manage', path: '/admin-manage', component: () => import('pages/AdminManagePage.vue'), title: "Управление администраторами", },
    ]
  },
  /* {
    path: '/login',
    name: 'login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'login', path: '/login', component: () => import('pages/LoginPage.vue') }
    ]
  }, */

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
