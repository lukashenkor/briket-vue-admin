
const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "/login", component: () => import("pages/LoginPage.vue"), title: "Логин", name: "Login", hidden: true },
      { name: "Admin Manage", path: "/admin-manage", component: () => import("pages/AdminManagePage.vue"), title: "Управление администраторами", meta: {role: "admins"} },
      { path: "/groups", component: () => import("pages/GroupsPage.vue"), title: "Управление группами администраторов", name: "Groups", meta: {role: "admin-roles"} },
      { path: "/clients", component: () => import("pages/ClientsPage.vue"), title: "Клиенты", name: "Clients", meta: {role: "corners-read"}, props: true },
      { path: "/ratings", component: () => import("pages/RatingsPage.vue"), title: "Рейтинг", name: "Ratings", meta: {role: "corners-read"} },
      { path: "/events", component: () => import("pages/EventsPage.vue"), title: "События", name: "Events", meta: {role: ["news", "events", "alerts"]} },
      { path: "/useful", component: () => import("pages/UsefulPage.vue"), title: "Полезное", name: "Useful", meta: {role: ["additional_guides", "additional_knowledge", "additional_promo"]} },
      { path: "/duty-manager", component: () => import("pages/DutyManagerPage.vue"), title: "Дежурный менеджер", name: "Duty manager", meta: {role: "dutymanagers"} },
      { path: "/feedback", component: () => import("pages/FeedbackPage.vue"), title: "Обратная связь", name: "Feedback", meta: {role: "feedback"} },
      { path: "/profile", component: () => import("pages/ProfilePage.vue"), title: "Профиль", name: "Profile", hidden: true },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
