export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
async function request(path, init) {
    const response = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            ...init?.headers
        },
        ...init
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.message ?? `Request failed with ${response.status}`;
        throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
    }
    return (await response.json());
}
export const api = {
    dashboard: () => request("/api/stats/dashboard"),
    services: () => request("/api/services"),
    createService: (payload) => request("/api/services", {
        method: "POST",
        body: JSON.stringify(payload)
    }),
    updateService: (id, payload) => request(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
    }),
    setServiceEnabled: (id, enabled) => request(`/api/services/${id}/enabled`, {
        method: "PATCH",
        body: JSON.stringify({ enabled })
    }),
    bookings: () => request("/api/bookings"),
    updateBookingStatus: (id, status) => request(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    }),
    cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, {
        method: "PATCH"
    }),
    users: () => request("/api/users"),
    pets: () => request("/api/pets"),
    orders: () => request("/api/orders"),
    memberships: () => request("/api/memberships")
};
