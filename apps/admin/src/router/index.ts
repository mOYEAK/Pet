import { createRouter, createWebHistory } from "vue-router";
import AiAssistantView from "../views/AiAssistantView.vue";
import BookingsView from "../views/BookingsView.vue";
import CouponsView from "../views/CouponsView.vue";
import CustomerDetailView from "../views/CustomerDetailView.vue";
import CustomersView from "../views/CustomersView.vue";
import DashboardView from "../views/DashboardView.vue";
import FollowUpsView from "../views/FollowUpsView.vue";
import KnowledgeBaseView from "../views/KnowledgeBaseView.vue";
import LoginView from "../views/LoginView.vue";
import MarketingAssistantView from "../views/MarketingAssistantView.vue";
import MembershipsView from "../views/MembershipsView.vue";
import NotificationsView from "../views/NotificationsView.vue";
import OrdersView from "../views/OrdersView.vue";
import PetsView from "../views/PetsView.vue";
import ServicesView from "../views/ServicesView.vue";
import SettingsView from "../views/SettingsView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "login", component: LoginView },
    { path: "/", name: "dashboard", component: DashboardView },
    { path: "/stats", name: "stats", component: () => import("../views/StatsView.vue") },
    { path: "/bookings", name: "bookings", component: BookingsView },
    { path: "/services", name: "services", component: ServicesView },
    { path: "/customers", name: "customers", component: CustomersView },
    { path: "/customers/:id", name: "customer-detail", component: CustomerDetailView },
    { path: "/pets", name: "pets", component: PetsView },
    { path: "/orders", name: "orders", component: OrdersView },
    { path: "/memberships", name: "memberships", component: MembershipsView },
    { path: "/coupons", name: "coupons", component: CouponsView },
    { path: "/notifications", name: "notifications", component: NotificationsView },
    { path: "/knowledge-base", name: "knowledge-base", component: KnowledgeBaseView },
    { path: "/ai-assistant", name: "ai-assistant", component: AiAssistantView },
    { path: "/marketing-assistant", name: "marketing-assistant", component: MarketingAssistantView },
    { path: "/follow-ups", name: "follow-ups", component: FollowUpsView },
    { path: "/settings", name: "settings", component: SettingsView }
  ]
});

router.beforeEach((to) => {
  const token = localStorage.getItem("petcare_admin_token");

  if (to.path !== "/login" && !token) {
    return "/login";
  }

  if (to.path === "/login" && token) {
    return "/";
  }

  return true;
});
