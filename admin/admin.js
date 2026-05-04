// ============================================================
// admin.js  —  Admin Dashboard (backed by Express + SQLite API)
// ============================================================
// This file controls the Admin Panel. It talks to the backend
// database to Add, Edit, or Delete products from the entire 
// website's catalog.
// ============================================================

const API_URL = 'http://localhost:3000/products';

// Global variables to track what we're currently doing
let editingProductName = null; // Stores the name of the product if we are editing instead of adding
let cachedProducts = [];       // Holds all the products temporarily so we don't fetch them constantly

// ------ 1. Initialize: Runs automatically when the page loads ------
document.addEventListener("DOMContentLoaded", async () => {
    // Security check: If someone isn't logged in, redirect them to the login page immediately.
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../auth/login.html";
        return;
    }

    // After confirming login, fetch all products from the database
    await refreshProducts();
});

// ------ 2. Fetch products from backend and show them on screen ------
async function refreshProducts() {
    try {
        // Asks the backend server for the list of products
        const response = await fetch(API_URL);
        if (response.ok) {
            // Converts the response into a usable Javascript array
            cachedProducts = await response.json();
        }
    } catch (err) {
        // If the server is down or broken, just default to an empty list
        console.warn('Could not reach backend:', err.message);
        cachedProducts = [];
    }
    // Visually update the product list on the webpage
    renderInventory();
}

// ------ 3. Add dynamic Store Rows to the form ------
// This lets the admin type in multiple stores (Carrefour, Spinneys) setting a unique price for each
window.addStoreRow = function() {
    const container = document.getElementById("storesContainer");
    const index = container.querySelectorAll(".store-entry").length;
    
    // Create the physical HTML element for the new store row
    const row = document.createElement("div");
    row.className = "store-entry";
    row.dataset.index = index;
    row.innerHTML = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:4px;">
            <button type="button" onclick="this.closest('.store-entry').remove()" style="background:transparent; border:none; cursor:pointer; font-size:0.85rem; color:#e11d48; font-weight:600;">✕ Remove</button>
        </div>
        <div class="form-row" style="grid-template-columns: 1fr 1fr; margin-bottom: 8px;">
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="store-name-input" placeholder="e.g. Spinneys" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="number" class="store-price-input" placeholder="Price (EGP)" min="0" step="0.01" required>
            </div>
        </div>
        <div class="form-group" style="margin-bottom: 0; margin-top: 8px;">
            <input type="url" class="store-link-input" placeholder="Store Product Link URL (e.g. https://...)">
        </div>
    `;
    // Add the new row to the container on the screen
    container.appendChild(row);
};

// ------ 4. Extracting Data from the form ------
// Scans through all the store rows we created above, pulling out names, prices, and links
function collectStoreData() {
    const entries = document.querySelectorAll("#storesContainer .store-entry");
    const stores = [];
    entries.forEach(entry => {
        const name = entry.querySelector(".store-name-input").value.trim();
        const price = parseFloat(entry.querySelector(".store-price-input").value);
        const linkElem = entry.querySelector(".store-link-input");
        const link = linkElem ? linkElem.value.trim() : "";
        
        // Only accept the store if they provided both a valid name and a number for price
        if (name && !isNaN(price)) {
            stores.push({ name, price, link });
        }
    });
    return stores;
}

// ------ 5. Rendering the side Inventory List ------
// Builds the vertical list on the right side showing every product in the database
function renderInventory() {
    const list = document.getElementById("adminInventoryList");
    
    // Clear the current list first
    list.innerHTML = "";
    
    // Handle empty database case
    if (cachedProducts.length === 0) {
        list.innerHTML = "<li style='justify-content:center; color:#94a3b8;'>No products in inventory.</li>";
        return;
    }

    // Because each store counts as a separate row in SQL, products are duplicated for each store they are in.
    // We 'group' them by name so we only see 'Nutella' ONCE in the list, instead of 3 times.
    const grouped = {};
    cachedProducts.forEach(p => {
        if (!grouped[p.name]) grouped[p.name] = p;
    });

    // Take the grouped unique products, reverse them so newest is on top, and draw them
    Object.values(grouped).reverse().forEach(product => {
        // Protect against strings with quotes that might break our code (like "Johnson's")
        const safeName = product.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        list.innerHTML += `
            <li>
                <span style="flex:1;">📦 ${product.name}</span>
                <div style="display:flex; gap:10px;">
                    <!-- Links to our Edit and Delete functions -->
                    <button type="button" onclick="editProduct('${safeName}')" style="background:transparent; border:none; cursor:pointer; font-size:1.1rem;" title="Edit">✏️</button>
                    <button type="button" onclick="deleteProduct('${safeName}')" style="background:transparent; border:none; cursor:pointer; font-size:1.1rem; color:red;" title="Delete">🗑️</button>
                </div>
            </li>
        `;
    });
}

// ------ 6. Handling the Add/Edit Form submission ------
document.getElementById("addProductForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Stop the page from refreshing when you click submit
    
    // Grab all basic info from the input boxes
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const description = document.getElementById("productDescription").value;
    const image = document.getElementById("productImage").value;
    
    // Grab complex store list from the custom rows
    const storeData = collectStoreData();
    
    // Validation: make sure they put at least one store offering the item
    if (storeData.length === 0) {
        alert("Please add at least one store with a name and price.");
        return;
    }

    // Package the data into a clean JSON object for the backend API
    const body = {
        name,
        category,
        description,
        image,
        stores: storeData
    };

    try {
        let response;

        // If the admin clicked "edit" earlier, editingProductName won't be empty
        if (editingProductName) {
            // Edit Mode — send a PUT request to update the record in SQL
            response = await fetch(`${API_URL}/${encodeURIComponent(editingProductName)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            // Reset state back to Add mode
            editingProductName = null;
            document.querySelector(".submit-btn").innerText = "Add Product";
        } else {
            // Add Mode — send a POST request to create a completely new record
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        // Catch backend rejections without crashing
        if (!response.ok) {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Something went wrong'));
            return;
        }

        // Blank out the form fields now that everything is successfully saved
        this.reset();
        resetStoreRows();
        
        // Re-download the inventory so the side-list instantly shows the newest changes
        await refreshProducts();

    } catch (err) {
        console.error('Network error:', err);
        alert('Could not reach the backend server. Make sure it is running.');
    }
});

// Resets dynamic rows back to a single empty 'Carrefour' box
function resetStoreRows() {
    const container = document.getElementById("storesContainer");
    container.innerHTML = `
        <div class="store-entry" data-index="0">
            <div class="form-row" style="grid-template-columns: 1fr 1fr; margin-bottom: 8px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="text" class="store-name-input" placeholder="e.g. Carrefour" required>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="number" class="store-price-input" placeholder="Price (EGP)" min="0" step="0.01" required>
                </div>
            </div>
        </div>
    `;
}

// ------ 7. Entering Edit Mode ------
// Triggers when you click the ✏️ pencil icon next to an inventory item
window.editProduct = function(productName) {
    // Find all SQL rows related to this product (e.g. all 3 stores selling Nutella)
    const matchingProducts = cachedProducts.filter(p => p.name === productName);
    if (matchingProducts.length === 0) return;
    
    // Pick the first entry just to get standard data like Name, Image, and Category
    const product = matchingProducts[0];
    
    // Squirt the data into the main form boxes
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productImage").value = product.image || "";
    
    // Clear whatever dynamic store boxes were there...
    const container = document.getElementById("storesContainer");
    container.innerHTML = "";
    
    // ...and generate new dynamic store boxes perfectly matching the database entries
    matchingProducts.forEach((mp, index) => {
        const row = document.createElement("div");
        row.className = "store-entry";
        row.dataset.index = index;
        row.innerHTML = `
            <div style="display:flex; justify-content:flex-end; margin-bottom:4px;">
                <button type="button" onclick="this.closest('.store-entry').remove()" style="background:transparent; border:none; cursor:pointer; font-size:0.85rem; color:#e11d48; font-weight:600;">✕ Remove</button>
            </div>
            <div class="form-row" style="grid-template-columns: 1fr 1fr; margin-bottom: 8px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="text" class="store-name-input" placeholder="e.g. Carrefour" required value="${mp.store ? mp.store.replace(/"/g, '&quot;') : ''}">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="number" class="store-price-input" placeholder="Price (EGP)" min="0" step="0.01" required value="${mp.price || ''}">
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 0; margin-top: 8px;">
                <input type="url" class="store-link-input" placeholder="Store Product Link URL (e.g. https://...)" value="${mp.link ? mp.link.replace(/"/g, '&quot;') : ''}">
            </div>
        `;
        container.appendChild(row);
    });
    
    // Activate edit mode so the Submit function knows to PUT (update) instead of POST (create new)
    editingProductName = productName;
    document.querySelector(".submit-btn").innerText = "Save Changes";
    
    // Scroll the browser nicely up to the top of the form
    document.querySelector(".admin-content").scrollIntoView({ behavior: "smooth" });
};

// ------ 8. Triggering a Delete ------
// Triggers when you click the 🗑️ trash can off the inventory list
window.deleteProduct = async function(productName) {
    // Add a double-check warning so nothing happens accidentally
    if (!confirm("Are you sure you want to permanently delete this product and all its stores?")) return;
    
    try {
        // Send a DELETE request to the backend API matching the item name
        const response = await fetch(`${API_URL}/${encodeURIComponent(productName)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Could not delete product'));
            return;
        }

        // Edge case: if they tried to delete something they were currently editing, reset the form.
        if (editingProductName === productName) {
            editingProductName = null;
            document.getElementById("addProductForm").reset();
            resetStoreRows();
            document.querySelector(".submit-btn").innerText = "Add Product";
        }

        // Visual update to confirm deletion on screen
        await refreshProducts();

    } catch (err) {
        console.error('Network error:', err);
        alert('Could not reach the backend server.');
    }
};
