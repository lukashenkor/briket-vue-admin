
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home', path: '', component: () => import('pages/HomePage.vue'), title: "Домашняя страница", },
      { path: '/login', component: () => import('pages/LoginPage.vue'), title: "Логин", name: 'Login', },
      { name: 'Admin Manage', path: '/admin-manage', component: () => import('pages/AdminManagePage.vue'), title: "Управление администраторами", },
      { path: '/clients', component: () => import('pages/ClientsPage.vue'), title: "Клиенты", name: 'Clients', },
      { path: '/ratings', component: () => import('pages/RatingsPage.vue'), title: "Рейтинг", name: 'Ratings', },
      { path: '/events', component: () => import('pages/EventsPage.vue'), title: "События", name: 'Events', },
      { path: '/useful', component: () => import('pages/UsefulPage.vue'), title: "Полезное", name: 'Useful', },
      { path: '/duty-manager', component: () => import('pages/DutyManagerPage.vue'), title: "Дежурный менеджер", name: 'Duty manager', },
      { path: '/feedback', component: () => import('pages/FeedbackPage.vue'), title: "Обратная связь", name: 'Feedback', },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
