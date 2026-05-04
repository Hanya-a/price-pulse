// ============================================================
// productlist.js  —  Fetches products from the backend API
// ============================================================
// BEFORE:  products were hardcoded in a JavaScript array and
//          saved to localStorage ("fake" database).
// NOW:     we fetch real data from our Express backend which
//          reads from an Oracle database.
// ============================================================

// ------ Configuration ------
// This is the URL of our Express backend's /products endpoint.
// Make sure the backend server (server.js) is running!
const API_URL = 'http://localhost:3000/products';

// ------ Wait for the page to fully load, then render ------
document.addEventListener("DOMContentLoaded", () => {
    renderProductGrid();  // fetch products from backend and display them
    setupDynamicMenu();   // configure the hamburger menu based on login state
});

// ============================================================
// setupDynamicMenu() — Adjusts navbar links for admin users
// ============================================================
function setupDynamicMenu() {
    const loggedInUserStr = localStorage.getItem("loggedInUser");
    if (loggedInUserStr) {
        const loggedInUser = JSON.parse(loggedInUserStr);
        if (loggedInUser.email === "adminpricepulse@gmail.com") {
            const dropdown = document.getElementById("productlistDropdown");
            if (dropdown) {
                dropdown.innerHTML = `
                   <a href="../admin/admin.html" style="display:block; margin-bottom:10px; font-weight:600; color:#1e1b4b;">Admin Dashboard</a>
                   <a href="../productlist/productlist.html?admin=true" style="display:block; font-weight:600; color:#1e1b4b;">Manage Products</a>
                   <hr style="border:none; border-top:1px solid #f1f5f9; margin: 10px 0;">
                   <a href="../auth/login.html" onclick="if(confirm('Are you sure you want to log out?')){localStorage.removeItem('loggedInUser');return true;}return false;" style="display:block; font-weight:600; color:#e11d48;">Log out</a>
                `;
            }
        }
    }
}

// ============================================================
// executeSearch() — Redirects with ?search= query parameter
// ============================================================
function executeSearch() {
    const searchValue = document.getElementById("productlistSearchInput").value.trim();
    if (searchValue === '') {
        window.location.search = "";
    } else {
        window.location.search = `?search=${encodeURIComponent(searchValue)}`;
    }
}

// ============================================================
// renderProductGrid() — THE MAIN FUNCTION
// Fetches product data from the backend, filters/groups it,
// and renders clickable cards on the page.
// ============================================================
async function renderProductGrid() {
    const list = document.getElementById("productGridContainer");

    // --- Step 1: Fetch products from the backend API ---
    let products = [];
    try {
        const response = await fetch(API_URL);  // call GET http://localhost:3000/products
        if (!response.ok) throw new Error('Server responded with ' + response.status);
        products = await response.json();        // parse the JSON array
    } catch (error) {
        // If the backend is not running or there is a network error, show a message.
        console.error('Failed to fetch products:', error);
        list.style.display = "block";
        list.innerHTML = "<h3 style='color: white; text-align: center;'>⚠️ Could not load products. Make sure the backend server is running.</h3>";
        return;
    }

    // --- Step 2: Apply search filter if the URL has ?search=... ---
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");

    if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(lowerSearch)
        );

        const pageTitle = document.getElementById("page-title");
        if (pageTitle) {
            pageTitle.textContent = `Search Results for "${searchQuery}"`;
        }

        // Auto-fill the search bar so the user knows what they searched
        const searchInput = document.getElementById("productlistSearchInput");
        if (searchInput) {
            searchInput.value = searchQuery;
        }
    } else {
        const pageTitle = document.getElementById("page-title");
        if (pageTitle) {
            pageTitle.textContent = `All Products`;
        }
    }

    // --- Step 3: Group duplicate product names (keep lowest price) ---
    const grouped = {};
    products.forEach(p => {
        const lowerName = p.name.toLowerCase();
        if (!grouped[lowerName]) {
            grouped[lowerName] = { ...p };
        } else {
            if (p.price < grouped[lowerName].price) {
                grouped[lowerName].price = p.price;
            }
        }
    });

    const uniqueProducts = Object.values(grouped);

    // --- Step 4: Handle "no products found" ---
    list.innerHTML = "";

    if (uniqueProducts.length === 0) {
        list.style.display = "block";
        list.innerHTML = "<h3 style='color: white; text-align: center;'>No products found matching that query. Try browsing All Products.</h3>";
        return;
    }

    // --- Step 5: Render each product as a clickable card ---
    list.style.display = "grid";

    uniqueProducts.reverse().forEach(product => {
        // Decide whether to show an image or a placeholder
        let imageDiv = `<div class="thumb-placeholder"></div>`;
        if (product.image && product.image.trim() !== '') {
            imageDiv = `<img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.outerHTML='<div class=\\'thumb-placeholder\\'></div>';">`;
        }

        // Always navigate to the internal product detail page
        const destination = `../product/product.html?name=${encodeURIComponent(product.name)}`;

        const card = `
            <div class="product-item" data-href="${destination}" style="cursor: pointer;">
                <div class="thumb-container">
                    ${imageDiv}
                </div>
                <h3>${product.name}</h3>
                <div class="product-store">🛒 View Product</div>
                <div class="product-price">💵 ${product.price} EGP</div>
            </div>
        `;
        list.innerHTML += card;
    });

    // Attach click handlers via data-href (avoids apostrophe/quote issues in product names)
    list.querySelectorAll('.product-item[data-href]').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = this.dataset.href;
        });
    });
}

// ============================================================
// Auth State UI check — swap login/register buttons for profile icon
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        const authContainers = document.querySelectorAll("header > div:last-child");
        authContainers.forEach(container => {
            if (container.querySelector(".profile-icon")) {
                container.innerHTML = `
                  <a href="../auth/login.html">Login</a>
                  <a href="../auth/register.html">Register</a>
                `;
            }
        });
    }
});
