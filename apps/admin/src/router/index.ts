import { createRouter, createWebHistory } from "vue-router";
import AiAssistantView from "../views/AiAssistantView.vue";
import BookingsView from "../views/BookingsView.vue";
import CustomerDetailView from "../views/CustomerDetailView.vue";
import CustomersView from "../views/CustomersView.vue";
import DashboardView from "../views/DashboardView.vue";
import FollowUpsView from "../views/FollowUpsView.vue";
import KnowledgeBaseView from "../views/KnowledgeBaseView.vue";
import MembershipsView from "../views/MembershipsView.vue";
import OrdersView from "../views/OrdersView.vue";
import PetsView from "../views/PetsView.vue";
import ServicesView from "../views/ServicesView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardView },
    { path: "/bookings", name: "bookings", component: BookingsView },
    { path: "/services", name: "services", component: ServicesView },
    { path: "/customers", name: "customers", component: CustomersView },
    { path: "/customers/:id", name: "customer-detail", component: CustomerDetailView },
    { path: "/pets", name: "pets", component: PetsView },
    { path: "/orders", name: "orders", component: OrdersView },
    { path: "/memberships", name: "memberships", component: MembershipsView },
    { path: "/knowledge-base", name: "knowledge-base", component: KnowledgeBaseView },
    { path: "/ai-assistant", name: "ai-assistant", component: AiAssistantView },
    { path: "/follow-ups", name: "follow-ups", component: FollowUpsView },
    { path: "/stats", redirect: "/" }
  ]
});
