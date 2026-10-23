/* =========================================================
   CAMPUSSWAP — PREMIUM DASHBOARD JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. GLOBAL STATE
   ========================================================= */

let allItems = [];
let currentCategory = "All";
let currentSearch = "";


/* =========================================================
   2. DOM ELEMENTS
   ========================================================= */

const itemsGrid = document.getElementById("items-grid");
const noResults = document.getElementById("no-results");

const searchInput = document.getElementById("search-input");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const viewAllButton =
    document.getElementById("view-all");

const listItemButton =
    document.getElementById("list-item-btn");

const welcomeName =
    document.getElementById("welcome-name");

const profileName =
    document.getElementById("profile-name");

const profileAvatar =
    document.getElementById("profile-avatar");

const profileArea =
    document.getElementById("profile-area");

const notificationButton =
    document.getElementById("notification-btn");

const requestsSection =
    document.getElementById("requests-section");

const requestsGrid =
    document.getElementById("requests-grid");

const noRequests =
    document.getElementById("no-requests");

const myRequestsSection =
    document.getElementById("my-requests-section");

const myRequestsGrid =
    document.getElementById("my-requests-grid");

const noMyRequests =
    document.getElementById("no-my-requests");


/* =========================================================
   3. ACTIVE USER
   ========================================================= */

function getActiveUser() {

    const storedUser =
        localStorage.getItem("cs_active_user");

    if (!storedUser) {

        window.location.href = "index.html";

        return null;
    }

    try {

        return JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Unable to read active user:",
            error
        );

        localStorage.removeItem("cs_active_user");

        window.location.href = "index.html";

        return null;
    }
}


const currentUser = getActiveUser();


/* =========================================================
   4. INITIALIZE USER UI
   ========================================================= */

function initializeUser() {

    if (!currentUser) return;

    const name =
        currentUser.name || "Student";

    if (welcomeName) {

        welcomeName.textContent =
            getFirstName(name);
    }

    if (profileName) {

        profileName.textContent = name;
    }

    if (profileAvatar) {

        profileAvatar.textContent =
            getInitials(name);
    }
}


function getFirstName(name) {

    return String(name)
        .trim()
        .split(/\s+/)[0];
}


function getInitials(name) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) return "U";

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   5. SAFE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   6. API DATA HELPERS
   ========================================================= */

let requestsCache = [];
let notificationsCache = [];

function getItems() {
    return Array.isArray(allItems) ? allItems : [];
}

function getRequests() {
    return Array.isArray(requestsCache) ? requestsCache : [];
}

function getNotifications() {
    return Array.isArray(notificationsCache) ? notificationsCache : [];
}

async function refreshDashboardData() {
    try {
        const [items, incoming, outgoing, notifications] = await Promise.all([
            CampusSwapAPI.getItems("All", ""),
            CampusSwapAPI.getIncomingRequests(),
            CampusSwapAPI.getMyRequests(),
            CampusSwapAPI.getNotifications()
        ]);

        allItems = Array.isArray(items) ? items : [];
        const combined = [...(Array.isArray(incoming) ? incoming : []), ...(Array.isArray(outgoing) ? outgoing : [])];
        const seen = new Set();
        requestsCache = combined.filter(r => {
            const key = String(r.id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        notificationsCache = Array.isArray(notifications) ? notifications : [];

        renderItems();
        renderIncomingRequests();
        renderMyRequests();
        updateNotificationBadge();
    } catch (error) {
        console.error("Unable to refresh CampusSwap data:", error);
        showDashboardToast(error.message || "Unable to load data from the server.", "error");
    }
}


/* =========================================================
   7. LOAD ITEMS
   ========================================================= */

function loadItems() {
    showSkeletonCards();
    refreshDashboardData();
}


/* =========================================================
   8. SKELETON LOADING
   ========================================================= */

function showSkeletonCards() {

    if (!itemsGrid) return;

    itemsGrid.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        const skeleton =
            document.createElement("div");

        skeleton.className =
            "skeleton-card";

        itemsGrid.appendChild(skeleton);
    }

    if (noResults) {

        noResults.style.display = "none";
    }
}


/* =========================================================
   9. FILTER ITEMS
   ========================================================= */

function getFilteredItems() {

    let filteredItems = [...allItems];

    /* CATEGORY */

    if (currentCategory !== "All") {

        filteredItems =
            filteredItems.filter(item =>

                String(item.category || "")
                    .toLowerCase() ===
                currentCategory.toLowerCase()

            );
    }


    /* SEARCH */

    if (currentSearch.trim() !== "") {

        const search =
            currentSearch
                .trim()
                .toLowerCase();

        filteredItems =
            filteredItems.filter(item => {

                const searchableText = [

                    item.name,

                    item.category,

                    item.description,

                    item.condition,

                    item.listingType,

                    item.location,

                    item.ownerName

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(search);
            });
    }


    return filteredItems;
}


/* =========================================================
   10. RENDER ITEMS
   ========================================================= */

function renderItems() {

    if (!itemsGrid) return;

    const filteredItems =
        getFilteredItems();

    itemsGrid.innerHTML = "";


    if (!filteredItems.length) {

        if (noResults) {

            noResults.style.display =
                "block";
        }

        return;
    }


    if (noResults) {

        noResults.style.display =
            "none";
    }


    filteredItems.forEach(
        (item, index) => {

            const card =
                createItemCard(item);

            card.style.animationDelay =
                `${index * 50}ms`;

            itemsGrid.appendChild(card);
        }
    );
}


/* =========================================================
   11. CREATE ITEM CARD
   ========================================================= */

function createItemCard(item) {

    const card =
        document.createElement("article");

    card.className = "item-card";


    const itemId =
        String(item.id);


    const isOwner =
        currentUser &&
        item.ownerEmail &&
        currentUser.email &&
        item.ownerEmail.toLowerCase() ===
        currentUser.email.toLowerCase();


    const alreadyRequested =
        hasUserRequested(itemId);


    const category =
        escapeHTML(
            item.category || "Other"
        );


    const name =
        escapeHTML(
            item.name || "Unnamed Item"
        );


    const description =
        escapeHTML(
            item.description ||
            "No description provided."
        );


    const condition =
        escapeHTML(
            item.condition || "Not specified"
        );


    const location =
        escapeHTML(
            item.location || "Campus"
        );


    const owner =
        escapeHTML(
            item.ownerName || "Student"
        );


    const listingType =
        escapeHTML(
            item.listingType || "Exchange"
        );


    const categoryIcon =
        getCategoryIcon(item.category);


    let actionHTML = "";


    if (isOwner) {

        actionHTML = `
            <button
                class="request-item-btn owner-btn"
                disabled
            >
                <i class="fa-solid fa-user"></i>
                Your Listing
            </button>
        `;

    } else if (item.available === false) {

        actionHTML = `
            <button
                class="request-item-btn requested-btn"
                disabled
            >
                <i class="fa-solid fa-ban"></i>
                Unavailable
            </button>
        `;

    } else if (alreadyRequested) {

        actionHTML = `
            <button
                class="request-item-btn requested-btn"
                disabled
            >
                <i class="fa-solid fa-check"></i>
                Requested
            </button>
        `;

    } else {

        actionHTML = `
            <button
                class="request-item-btn"
                data-request-item="${itemId}"
            >
                <i class="fa-solid fa-paper-plane"></i>
                Request Item
            </button>
        `;
    }


    card.innerHTML = `

        <div class="item-card-top">

            <span class="item-type">

                <i class="${categoryIcon}"></i>

                ${category}

            </span>

            <span class="request-status ${item.available === false ? "rejected" : "accepted"}">

                ${item.available === false ? "Unavailable" : "Available"}

            </span>

        </div>


        <h3>
            ${name}
        </h3>


        <p class="item-description">

            ${description}

        </p>


        <div class="item-details">

            <div>

                <i class="fa-solid fa-user"></i>

                ${owner}

            </div>


            <div>

                <i class="fa-solid fa-location-dot"></i>

                ${location}

            </div>


            <div>

                <i class="fa-solid fa-handshake"></i>

                ${listingType}

            </div>


            <div>

                <i class="fa-solid fa-star"></i>

                ${condition}

            </div>

        </div>


        ${actionHTML}

    `;


    /* REQUEST BUTTON */

    const requestButton =
        card.querySelector(
            "[data-request-item]"
        );


    if (requestButton) {

        requestButton.addEventListener(
            "click",
            () => {

                createRequest(item);
            }
        );
    }


    return card;
}


/* =========================================================
   12. CATEGORY ICONS
   ========================================================= */

function getCategoryIcon(category) {

    const icons = {

        "Books":
            "fa-solid fa-book",

        "Calculators":
            "fa-solid fa-calculator",

        "Lab Equipment":
            "fa-solid fa-flask",

        "Stationery":
            "fa-solid fa-pen",

        "Electronics":
            "fa-solid fa-laptop",

        "Other":
            "fa-solid fa-box"

    };


    return (
        icons[category] ||
        "fa-solid fa-box"
    );
}


/* =========================================================
   13. CHECK EXISTING REQUEST
   ========================================================= */

function hasUserRequested(itemId) {

    if (!currentUser) return false;

    const requests =
        getRequests();


    return requests.some(request =>

        String(request.itemId) ===
        String(itemId)

        &&

        request.requesterEmail &&
        currentUser.email &&

        request.requesterEmail
            .toLowerCase() ===
        currentUser.email.toLowerCase()

        &&

        request.status !== "Rejected"
    );
}


/* =========================================================
   14. CREATE REQUEST
   ========================================================= */

async function createRequest(item) {

    if (!currentUser || !item) return;

    const alreadyRequested = hasUserRequested(item.id);

    if (alreadyRequested) {
        showDashboardToast("You have already requested this item.", "error");
        return;
    }

    if (item.ownerEmail && currentUser.email &&
        item.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        showDashboardToast("You cannot request your own item.", "error");
        return;
    }

    try {
        await CampusSwapAPI.createRequest(item.id);
        await refreshDashboardData();
        showDashboardToast("Request sent successfully!", "success");
        animateSuccess();
    } catch (error) {
        showDashboardToast(error.message || "Unable to send request.", "error");
    }
}


/* =========================================================
   15. SERVER-SIDE NOTIFICATIONS
   ========================================================= */

function createNotification() {
    // Notifications are now created by the Spring Boot backend.
}


/* =========================================================
   16. INCOMING REQUESTS
   ========================================================= */

function renderIncomingRequests() {

    if (!requestsGrid) return;


    const requests =
        getRequests();


    const incoming =
        requests.filter(request =>

            currentUser &&
            request.ownerEmail &&
            currentUser.email &&

            request.ownerEmail.toLowerCase() ===
            currentUser.email.toLowerCase()
        );


    requestsGrid.innerHTML = "";


    if (!incoming.length) {

        if (noRequests) {

            noRequests.style.display =
                "block";
        }

        return;
    }


    if (noRequests) {

        noRequests.style.display =
            "none";
    }


    incoming.forEach(
        request => {

            const card =
                createIncomingRequestCard(
                    request
                );

            requestsGrid.appendChild(card);
        }
    );
}


/* =========================================================
   17. INCOMING REQUEST CARD
   ========================================================= */

function createIncomingRequestCard(
    request
) {

    const card =
        document.createElement("div");

    card.className =
        "request-card";


    const statusClass =
        String(request.status || "Pending")
            .toLowerCase();


    const requestDate =
        formatDate(request.createdAt);


    let actionsHTML = "";


    if (request.status === "Pending") {

        actionsHTML = `

            <div class="request-actions">

                <button
                    class="accept-request-btn"
                    data-accept-request="${request.id}"
                >

                    <i class="fa-solid fa-check"></i>

                    Accept

                </button>


                <button
                    class="reject-request-btn"
                    data-reject-request="${request.id}"
                >

                    <i class="fa-solid fa-xmark"></i>

                    Reject

                </button>

            </div>

        `;
    }


    card.innerHTML = `

        <div class="request-card-top">

            <span class="item-type">

                ${escapeHTML(
                    request.itemCategory ||
                    "Item"
                )}

            </span>


            <span
                class="request-status ${statusClass}"
            >

                ${escapeHTML(
                    request.status ||
                    "Pending"
                )}

            </span>

        </div>


        <h3>

            ${escapeHTML(
                request.itemName ||
                "Requested Item"
            )}

        </h3>


        <div class="request-info">

            <div>

                <i class="fa-solid fa-user"></i>

                ${escapeHTML(
                    request.requesterName ||
                    "Student"
                )}

            </div>


            <div>

                <i class="fa-solid fa-envelope"></i>

                ${escapeHTML(
                    request.requesterEmail ||
                    ""
                )}

            </div>


            <div>

                <i class="fa-regular fa-clock"></i>

                ${requestDate}

            </div>

        </div>


        ${actionsHTML}

    `;


    const acceptButton =
        card.querySelector(
            "[data-accept-request]"
        );


    const rejectButton =
        card.querySelector(
            "[data-reject-request]"
        );


    if (acceptButton) {

        acceptButton.addEventListener(
            "click",
            () => {

                updateRequestStatus(
                    request.id,
                    "Accepted"
                );
            }
        );
    }


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            () => {

                updateRequestStatus(
                    request.id,
                    "Rejected"
                );
            }
        );
    }


    return card;
}


/* =========================================================
   18. UPDATE REQUEST STATUS
   ========================================================= */

async function updateRequestStatus(requestId, newStatus) {

    try {
        await CampusSwapAPI.updateRequestStatus(requestId, newStatus);
        await refreshDashboardData();

        if (newStatus === "Accepted") {
            showDashboardToast("Request accepted successfully!", "success");
            animateSuccess();
        } else {
            showDashboardToast("Request rejected.", "success");
        }
    } catch (error) {
        showDashboardToast(error.message || "Unable to update request.", "error");
    }
}


/* =========================================================
   19. MY REQUESTS
   ========================================================= */

function renderMyRequests() {

    if (!myRequestsGrid) return;


    const requests =
        getRequests();


    const mine =
        requests.filter(request =>

            currentUser &&
            request.requesterEmail &&
            currentUser.email &&

            request.requesterEmail
                .toLowerCase() ===
            currentUser.email.toLowerCase()
        );


    myRequestsGrid.innerHTML = "";


    if (!mine.length) {

        if (noMyRequests) {

            noMyRequests.style.display =
                "block";
        }

        return;
    }


    if (noMyRequests) {

        noMyRequests.style.display =
            "none";
    }


    mine.forEach(
        request => {

            const card =
                createMyRequestCard(
                    request
                );

            myRequestsGrid.appendChild(card);
        }
    );
}


/* =========================================================
   20. MY REQUEST CARD
   ========================================================= */

function createMyRequestCard(
    request
) {

    const card =
        document.createElement("div");

    card.className =
        "request-card";


    const statusClass =
        String(request.status || "Pending")
            .toLowerCase();


    const statusIcon = {

        Pending:
            "fa-regular fa-clock",

        Accepted:
            "fa-solid fa-circle-check",

        Rejected:
            "fa-solid fa-circle-xmark"

    }[
        request.status
    ] || "fa-regular fa-clock";


    card.innerHTML = `

        <div class="request-card-top">

            <span class="item-type">

                ${escapeHTML(
                    request.itemCategory ||
                    "Item"
                )}

            </span>


            <span
                class="request-status ${statusClass}"
            >

                <i
                    class="${statusIcon}"
                    style="margin-right:5px;"
                ></i>

                ${escapeHTML(
                    request.status ||
                    "Pending"
                )}

            </span>

        </div>


        <h3>

            ${escapeHTML(
                request.itemName ||
                "Requested Item"
            )}

        </h3>


        <div class="request-info">

            <div>

                <i class="fa-solid fa-user"></i>

                Owner:
                ${escapeHTML(
                    request.ownerName ||
                    "Student"
                )}

            </div>


            <div>

                <i class="fa-solid fa-handshake"></i>

                ${escapeHTML(
                    request.listingType ||
                    "Exchange"
                )}

            </div>


            <div>

                <i class="fa-regular fa-calendar"></i>

                Requested:
                ${formatDate(
                    request.createdAt
                )}

            </div>

        </div>

    `;


    return card;
}


/* =========================================================
   21. SEARCH
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;

            renderItems();
        }
    );
}


/* =========================================================
   22. CATEGORY FILTER
   ========================================================= */

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category ||
                    "All";


                renderItems();
            }
        );
    }
);


/* =========================================================
   23. VIEW ALL
   ========================================================= */

if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        () => {

            currentCategory = "All";

            currentSearch = "";


            if (searchInput) {

                searchInput.value = "";
            }


            categoryButtons.forEach(
                button =>
                    button.classList.remove(
                        "active"
                    )
            );


            renderItems();


            document
                .querySelector(
                    ".items-section"
                )
                ?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"
                });
        }
    );
}


/* =========================================================
   24. LIST ITEM BUTTON
   ========================================================= */

if (listItemButton) {

    listItemButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "list-item.html";
        }
    );
}


/* =========================================================
   25. PROFILE MENU
   ========================================================= */

if (profileArea) {

    profileArea.addEventListener(
        "click",
        toggleProfileMenu
    );
}


function toggleProfileMenu() {

    let menu =
        document.getElementById(
            "profile-dropdown"
        );


    if (menu) {

        menu.remove();

        return;
    }


    menu =
        document.createElement("div");

    menu.id =
        "profile-dropdown";


    menu.style.position =
        "fixed";

    menu.style.top =
        "68px";

    menu.style.right =
        "5%";

    menu.style.zIndex =
        "999";

    menu.style.background =
        "rgba(255,255,255,0.97)";

    menu.style.backdropFilter =
        "blur(20px)";

    menu.style.border =
        "1px solid #e2e8f0";

    menu.style.borderRadius =
        "16px";

    menu.style.padding =
        "8px";

    menu.style.minWidth =
        "190px";

    menu.style.boxShadow =
        "0 20px 50px rgba(15,23,42,.14)";


    menu.innerHTML = `

        <div
            style="
                padding:12px;
                border-bottom:1px solid #f1f5f9;
                margin-bottom:5px;
            "
        >

            <div
                style="
                    font-weight:700;
                    color:#0f172a;
                    font-size:14px;
                "
            >

                ${escapeHTML(
                    currentUser?.name ||
                    "Student"
                )}

            </div>


            <div
                style="
                    color:#64748b;
                    font-size:11px;
                    margin-top:3px;
                    word-break:break-all;
                "
            >

                ${escapeHTML(
                    currentUser?.email ||
                    ""
                )}

            </div>

        </div>


        <button
            id="logout-btn"
            style="
                width:100%;
                border:0;
                background:transparent;
                padding:11px 12px;
                border-radius:10px;
                text-align:left;
                font-family:inherit;
                font-size:13px;
                font-weight:600;
                color:#dc2626;
                cursor:pointer;
            "
        >

            <i
                class="fa-solid fa-right-from-bracket"
                style="margin-right:8px;"
            ></i>

            Logout

        </button>

    `;


    document.body.appendChild(menu);


    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    logoutButton.addEventListener(
        "click",
        logoutUser
    );


    setTimeout(() => {

        document.addEventListener(
            "click",
            closeProfileOnOutsideClick,
            {
                once: true
            }
        );

    }, 0);
}


function closeProfileOnOutsideClick(
    event
) {

    const menu =
        document.getElementById(
            "profile-dropdown"
        );


    if (
        menu &&
        !menu.contains(event.target) &&
        !profileArea.contains(event.target)
    ) {

        menu.remove();
    }
}


/* =========================================================
   26. LOGOUT
   ========================================================= */

function logoutUser() {

    CampusSwapAPI.clearSession();


    showDashboardToast(
        "Logged out successfully.",
        "success"
    );


    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 500);
}


/* =========================================================
   27. NOTIFICATIONS
   ========================================================= */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        toggleNotificationPanel
    );
}


function getUserNotifications() {
    return getNotifications();
}


/* =========================================================
   28. NOTIFICATION BADGE
   ========================================================= */

function updateNotificationBadge() {

    if (!notificationButton) return;


    const unread =
        getUserNotifications()
            .filter(
                notification =>
                    !notification.read
            ).length;


    let badge =
        notificationButton.querySelector(
            ".notification-badge"
        );


    if (!unread) {

        if (badge) {
            badge.remove();
        }

        return;
    }


    if (!badge) {

        badge =
            document.createElement("span");

        badge.className =
            "notification-badge";


        badge.style.position =
            "absolute";

        badge.style.top =
            "-3px";

        badge.style.right =
            "-3px";

        badge.style.minWidth =
            "17px";

        badge.style.height =
            "17px";

        badge.style.padding =
            "0 4px";

        badge.style.display =
            "grid";

        badge.style.placeItems =
            "center";

        badge.style.borderRadius =
            "999px";

        badge.style.background =
            "#ef4444";

        badge.style.color =
            "white";

        badge.style.fontSize =
            "9px";

        badge.style.fontWeight =
            "700";


        notificationButton.style.position =
            "relative";


        notificationButton.appendChild(
            badge
        );
    }


    badge.textContent =
        unread > 99
            ? "99+"
            : unread;
}


/* =========================================================
   29. NOTIFICATION PANEL
   ========================================================= */

function toggleNotificationPanel() {

    let panel =
        document.getElementById(
            "notification-panel"
        );


    if (panel) {

        panel.remove();

        return;
    }


    panel =
        document.createElement("div");

    panel.id =
        "notification-panel";

    panel.className =
        "notification-panel";


    panel.style.position =
        "fixed";

    panel.style.top =
        "72px";

    panel.style.right =
        "5%";

    panel.style.zIndex =
        "1000";

    panel.style.width =
        "min(390px, calc(100vw - 28px))";

    panel.style.maxHeight =
        "520px";

    panel.style.overflow =
        "auto";


    renderNotificationPanel(
        panel
    );


    document.body.appendChild(
        panel
    );


    setTimeout(() => {

        document.addEventListener(
            "click",
            closeNotificationOnOutside,
            {
                once: true
            }
        );

    }, 0);
}


/* =========================================================
   30. NOTIFICATION PANEL CONTENT
   ========================================================= */

function renderNotificationPanel(
    panel
) {

    const notifications =
        getUserNotifications();


    const unreadCount =
        notifications.filter(
            n => !n.read
        ).length;


    panel.innerHTML = `

        <div
            style="
                padding:16px 18px;
                border-bottom:1px solid #e2e8f0;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
            "
        >

            <div>

                <div
                    style="
                        font-weight:700;
                        font-size:15px;
                        color:#0f172a;
                    "
                >
                    Notifications
                </div>

                <div
                    style="
                        font-size:11px;
                        color:#64748b;
                        margin-top:3px;
                    "
                >
                    ${unreadCount}
                    unread
                </div>

            </div>


            ${
                unreadCount
                    ? `
                        <button
                            id="mark-all-read"
                            style="
                                border:0;
                                background:#eef2ff;
                                color:#4f46e5;
                                padding:7px 10px;
                                border-radius:9px;
                                font-family:inherit;
                                font-size:10px;
                                font-weight:600;
                                cursor:pointer;
                            "
                        >
                            Mark all read
                        </button>
                    `
                    : ""
            }

        </div>


        <div id="notification-list"></div>

    `;


    const list =
        panel.querySelector(
            "#notification-list"
        );


    if (!notifications.length) {

        list.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:45px 20px;
                    color:#64748b;
                "
            >

                <i
                    class="fa-regular fa-bell-slash"
                    style="
                        font-size:28px;
                        color:#94a3b8;
                        margin-bottom:12px;
                    "
                ></i>


                <div
                    style="
                        font-weight:600;
                        color:#334155;
                        font-size:13px;
                    "
                >
                    You're all caught up
                </div>


                <div
                    style="
                        font-size:11px;
                        margin-top:5px;
                    "
                >
                    No notifications right now.
                </div>

            </div>

        `;

    } else {

        notifications
            .slice(0, 20)
            .forEach(
                notification => {

                    list.appendChild(
                        createNotificationElement(
                            notification
                        )
                    );
                }
            );
    }


    const markAll =
        panel.querySelector(
            "#mark-all-read"
        );


    if (markAll) {

        markAll.addEventListener(
            "click",
            () => {

                markAllNotificationsRead();

                renderNotificationPanel(
                    panel
                );
            }
        );
    }
}


/* =========================================================
   31. NOTIFICATION ELEMENT
   ========================================================= */

function createNotificationElement(
    notification
) {

    const element =
        document.createElement("div");


    const iconMap = {

        success:
            "fa-solid fa-circle-check",

        error:
            "fa-solid fa-circle-xmark",

        info:
            "fa-solid fa-circle-info"

    };


    const icon =
        iconMap[
            notification.type
        ] ||
        iconMap.info;


    const iconColors = {

        success: "#059669",

        error: "#dc2626",

        info: "#4f46e5"

    };


    const iconColor =
        iconColors[
            notification.type
        ] ||
        iconColors.info;


    element.style.display =
        "flex";

    element.style.gap =
        "12px";

    element.style.padding =
        "14px 18px";

    element.style.borderBottom =
        "1px solid #f1f5f9";

    element.style.background =
        notification.read
            ? "white"
            : "#f8faff";

    element.style.cursor =
        "pointer";


    element.innerHTML = `

        <div
            style="
                width:34px;
                height:34px;
                flex:0 0 34px;
                display:grid;
                place-items:center;
                border-radius:11px;
                background:#f1f5f9;
                color:${iconColor};
            "
        >

            <i class="${icon}"></i>

        </div>


        <div
            style="
                min-width:0;
                flex:1;
            "
        >

            <div
                style="
                    font-size:12px;
                    font-weight:700;
                    color:#0f172a;
                    margin-bottom:3px;
                "
            >
                ${escapeHTML(
                    notification.title
                )}
            </div>


            <div
                style="
                    font-size:11px;
                    line-height:1.5;
                    color:#64748b;
                "
            >
                ${escapeHTML(
                    notification.message
                )}
            </div>


            <div
                style="
                    font-size:9px;
                    color:#94a3b8;
                    margin-top:5px;
                "
            >
                ${formatRelativeTime(
                    notification.createdAt
                )}
            </div>

        </div>

    `;


    element.addEventListener(
        "click",
        () => {

            markNotificationRead(
                notification.id
            );

            element.style.background =
                "white";
        }
    );


    return element;
}


/* =========================================================
   32. MARK NOTIFICATION READ
   ========================================================= */

async function markNotificationRead(notificationId) {
    try {
        await CampusSwapAPI.markNotificationRead(notificationId);
        notificationsCache = notificationsCache.map(n =>
            String(n.id) === String(notificationId) ? { ...n, read: true } : n
        );
        updateNotificationBadge();
    } catch (error) {
        console.error("Unable to mark notification read:", error);
    }
}


/* =========================================================
   33. MARK ALL READ
   ========================================================= */

async function markAllNotificationsRead() {
    try {
        await CampusSwapAPI.markAllNotificationsRead();
        notificationsCache = notificationsCache.map(n => ({ ...n, read: true }));
        updateNotificationBadge();
        showDashboardToast("All notifications marked as read.", "success");
    } catch (error) {
        showDashboardToast(error.message || "Unable to update notifications.", "error");
    }
}


/* =========================================================
   34. CLOSE NOTIFICATIONS
   ========================================================= */

function closeNotificationOnOutside(
    event
) {

    const panel =
        document.getElementById(
            "notification-panel"
        );


    if (
        panel &&
        !panel.contains(event.target) &&
        !notificationButton.contains(
            event.target
        )
    ) {

        panel.remove();
    }
}


/* =========================================================
   35. TOAST SYSTEM
   ========================================================= */

function showDashboardToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "dashboard-toast"
        );


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "dashboard-toast";


        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "25px";

        toast.style.transform =
            "translate(-50%, 20px)";

        toast.style.zIndex =
            "5000";

        toast.style.display =
            "flex";

        toast.style.alignItems =
            "center";

        toast.style.gap =
            "10px";

        toast.style.padding =
            "13px 17px";

        toast.style.borderRadius =
            "13px";

        toast.style.background =
            "#0f172a";

        toast.style.color =
            "white";

        toast.style.fontSize =
            "12px";

        toast.style.fontWeight =
            "600";

        toast.style.boxShadow =
            "0 15px 40px rgba(15,23,42,.22)";

        toast.style.opacity =
            "0";

        toast.style.transition =
            "all .3s ease";


        document.body.appendChild(
            toast
        );
    }


    const icon =
        type === "success"
            ? "fa-solid fa-circle-check"
            : "fa-solid fa-circle-xmark";


    toast.innerHTML = `

        <i class="${icon}"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    toast.style.background =
        type === "success"
            ? "#0f172a"
            : "#7f1d1d";


    requestAnimationFrame(() => {

        toast.style.opacity =
            "1";

        toast.style.transform =
            "translate(-50%, 0)";
    });


    clearTimeout(
        toast.hideTimer
    );


    toast.hideTimer =
        setTimeout(() => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translate(-50%, 20px)";

        }, 3000);
}


/* =========================================================
   36. SUCCESS MICRO-INTERACTION
   ========================================================= */

function animateSuccess() {

    const button =
        document.querySelector(
            ".notification-btn"
        );


    if (!button) return;


    button.animate(

        [
            {
                transform:
                    "scale(1)"
            },

            {
                transform:
                    "scale(1.15)"
            },

            {
                transform:
                    "scale(1)"
            }

        ],

        {
            duration: 400,

            easing:
                "cubic-bezier(.2,.8,.2,1)"
        }
    );
}


/* =========================================================
   37. DATE FORMAT
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "Unknown date";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "Unknown date";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   38. RELATIVE TIME
   ========================================================= */

function formatRelativeTime(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "";
    }


    const difference =
        Date.now() -
        date.getTime();


    const seconds =
        Math.floor(
            difference / 1000
        );


    if (seconds < 60) {

        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes}m ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h ago`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {

        return `${days}d ago`;
    }


    return formatDate(
        dateString
    );
}


/* =========================================================
   39. ACTIVE CATEGORY
   ========================================================= */

function initializeCategoryState() {

    categoryButtons.forEach(
        button =>
            button.classList.remove(
                "active"
            )
    );
}


/* =========================================================
   40. KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* "/" focuses search */

        if (
            event.key === "/" &&
            document.activeElement.tagName !==
            "INPUT"
        ) {

            event.preventDefault();

            searchInput?.focus();
        }


        /* ESC closes panels */

        if (event.key === "Escape") {

            document
                .getElementById(
                    "notification-panel"
                )
                ?.remove();


            document
                .getElementById(
                    "profile-dropdown"
                )
                ?.remove();
        }
    }
);


/* =========================================================
   41. REFRESH WHEN TAB BECOMES ACTIVE
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshDashboardData();
        }
    }
);


/* =========================================================
   42. INITIALIZE DASHBOARD
   ========================================================= */

async function initializeDashboard() {

    initializeUser();
    initializeCategoryState();
    showSkeletonCards();

    try {
        const user = await CampusSwapAPI.me();
        if (user) {
            localStorage.setItem("cs_active_user", JSON.stringify(user));
        }
        initializeUser();
    } catch (error) {
        console.error("Unable to validate session:", error);
        return;
    }

    await refreshDashboardData();
}


/* =========================================================
   43. START
   ========================================================= */

initializeDashboard();