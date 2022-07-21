
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home', path: '', component: () => import('pages/HomePage.vue') },
      { name: 'Login', path: '/login', component: () => import('pages/LoginPage.vue') }
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
