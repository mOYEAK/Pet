import { createRouter, createWebHistory } from "vue-router";
import BookingsView from "../views/BookingsView.vue";
import CustomersView from "../views/CustomersView.vue";
import DashboardView from "../views/DashboardView.vue";
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
        { path: "/pets", name: "pets", component: PetsView },
        { path: "/orders", name: "orders", component: OrdersView },
        { path: "/memberships", name: "memberships", component: MembershipsView },
        { path: "/stats", redirect: "/" }
    ]
});
