// ==========================================
// CAMPUSSWAP - LIST ITEM JAVASCRIPT
// ==========================================


// ==========================================
// CHECK LOGIN
// ==========================================

const activeToken = CampusSwapAPI.getToken();

if (!activeToken) {
    window.location.href = "index.html";
}

let currentUser = null;

try {
    const storedUser = localStorage.getItem("cs_active_user");
    currentUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
    console.error("Error reading active user:", error);
}


// ==========================================
// GET FORM
// ==========================================

const listItemForm =
    document.getElementById("list-item-form");


// ==========================================
// BACK BUTTON
// ==========================================

const backButton =
    document.getElementById("back-btn");


if (backButton) {

    backButton.addEventListener("click", () => {

        window.location.href =
            "dashboard.html";

    });

}


// ==========================================
// CANCEL BUTTON
// ==========================================

const cancelButton =
    document.getElementById("cancel-btn");


if (cancelButton) {

    cancelButton.addEventListener("click", () => {

        window.location.href =
            "dashboard.html";

    });

}


// ==========================================
// FORM SUBMISSION
// ==========================================

if (listItemForm) {

    listItemForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const itemName = document.getElementById("item-name").value.trim();
        const category = document.getElementById("item-category").value;
        const description = document.getElementById("item-description").value.trim();
        const condition = document.getElementById("item-condition").value;
        const location = document.getElementById("item-location").value.trim();
        const listingTypeElement = document.querySelector('input[name="listing-type"]:checked');

        if (!listingTypeElement) {
            showFormToast("Please select what you want to do with the item.", "error");
            return;
        }

        const newItem = {
            name: itemName,
            category,
            description,
            condition,
            listingType: listingTypeElement.value,
            location
        };

        try {
            await CampusSwapAPI.createItem(newItem);
            showFormToast("Item listed successfully!", "success");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
        } catch (error) {
            showFormToast(error.message || "Unable to publish listing.", "error");
        }
    });

}


// ==========================================
// TOAST FUNCTION
// ==========================================

function showFormToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("form-toast");

    const icon =
        document.getElementById("toast-icon");

    const messageBox =
        document.getElementById("toast-message");


    if (!toast || !icon || !messageBox) {

        return;

    }


    // Message

    messageBox.textContent =
        message;


    // Toast class

    toast.className =
        `form-toast show ${type}`;


    // Icon

    if (type === "success") {

        icon.className =
            "fa-solid fa-circle-check";

    } else {

        icon.className =
            "fa-solid fa-circle-xmark";

    }


    // Hide after 3 seconds

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}