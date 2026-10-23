// ==========================================
// CAMPUSSWAP - API CLIENT
// Include BEFORE script.js / dashboard.js / list-item.js:
//   <script src="api.js"></script>
// Replaces every localStorage read/write for users, items, requests and notifications.
// ==========================================

const API_BASE = "http://localhost:8080/api";

const CampusSwapAPI = (() => {

    const TOKEN_KEY = "cs_token";
    const USER_KEY = "cs_active_user";   // kept (profile only, no password) so existing UI code still works

    const getToken = () => localStorage.getItem(TOKEN_KEY);

    function saveSession(auth) {
        localStorage.setItem(TOKEN_KEY, auth.token);
        localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    async function request(path, { method = "GET", body, auth = true } = {}) {
        const headers = { "Content-Type": "application/json" };
        if (auth && getToken()) headers["Authorization"] = "Bearer " + getToken();

        let response;
        try {
            response = await fetch(API_BASE + path, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined
            });
        } catch (networkError) {
            throw new Error("Cannot reach the server. Is the backend running on port 8080?");
        }

        if (response.status === 401 && auth) {
            clearSession();
            window.location.href = "index.html";
            throw new Error("Please log in again.");
        }

        if (response.status === 204) return null;

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ")");
        return data;
    }

    return {
        getToken, clearSession,

        // ---- auth ----
        async login(email, password) {
            const data = await request("/auth/login", { method: "POST", auth: false, body: { email, password } });
            saveSession(data);
            return data.user;
        },
        signup(user) {   // {name, email, collegeId, phone, branch, year, password}
            return request("/auth/signup", { method: "POST", auth: false, body: user });
        },
        me: () => request("/auth/me"),

        // ---- items ----
        getItems: (category = "All", search = "") =>
            request("/items?category=" + encodeURIComponent(category) + "&search=" + encodeURIComponent(search)),
        getMyItems: () => request("/items/mine"),
        createItem: (item) => request("/items", { method: "POST", body: item }),
        deleteItem: (id) => request("/items/" + id, { method: "DELETE" }),

        // ---- requests ----
        createRequest: (itemId) => request("/requests", { method: "POST", body: { itemId } }),
        getIncomingRequests: () => request("/requests/incoming"),
        getMyRequests: () => request("/requests/outgoing"),
        updateRequestStatus: (id, status) =>   // status: "Accepted" | "Rejected"
            request("/requests/" + id + "/status", { method: "PATCH", body: { status } }),

        // ---- notifications ----
        getNotifications: () => request("/notifications"),
        getUnreadCount: () => request("/notifications/unread-count"),
        markNotificationRead: (id) => request("/notifications/" + id + "/read", { method: "PATCH" }),
        markAllNotificationsRead: () => request("/notifications/read-all", { method: "PATCH" })
    };
})();
