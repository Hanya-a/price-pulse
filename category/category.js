// ============================================================
// category.js  —  Fetches products from the backend API
// ============================================================
// UPDATED: No more hardcoded products or localStorage reads.
// Products are fetched from http://localhost:3000/products
// and filtered by the selected category.
// ============================================================

const API_URL = 'http://localhost:3000/products';

document.addEventListener("DOMContentLoaded", () => {
    renderCategoryProducts();
});

async function renderCategoryProducts() {
    const list = document.getElementById("categoryGridContainer");
    const titleNav = document.getElementById("categoryTitleDisplay");
    const selectedCategory = localStorage.getItem("selectedCategory") || "All";

    // Format category nicely
    const niceCategoryName = selectedCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    titleNav.textContent = niceCategoryName;
    document.title = "Price Pulse - " + niceCategoryName;

    list.innerHTML = "";

    // --- Fetch products from the backend ---
    let products = [];
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Server returned ' + response.status);
        products = await response.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        list.style.display = "block";
        list.innerHTML = "<h3 style='color: white; text-align: center;'>⚠️ Could not load products. Make sure the backend server is running.</h3>";
        return;
    }

    // Filter by the selected category (allow partial match for safety)
    let categoryProducts = products.filter(p =>
        p.category &&
        p.category.toLowerCase().replace(/-/g, '_').replace(/ /g, '_') ===
        selectedCategory.toLowerCase().replace(/-/g, '_').replace(/ /g, '_')
    );

    // Group duplicate items natively by name inside category
    const groupedCategory = {};
    categoryProducts.forEach(p => {
        const lowerName = p.name.toLowerCase();
        if (!groupedCategory[lowerName]) {
            groupedCategory[lowerName] = { ...p };
        } else {
            if (p.price < groupedCategory[lowerName].price) {
                groupedCategory[lowerName].price = p.price;
            }
        }
    });

    const uniqueCategoryProducts = Object.values(groupedCategory);

    if (uniqueCategoryProducts.length === 0) {
        list.style.display = "block";
        list.innerHTML = `<h3 style='color: white; text-align: center; margin-top: 40px; font-weight: 500;'>No products found for ${niceCategoryName}!</h3>`;
        return;
    }

    list.style.display = "grid";

    uniqueCategoryProducts.reverse().forEach(product => {
        let imageDiv = `<div class="thumb-placeholder"></div>`;
        if (product.image && product.image.trim() !== '') {
            imageDiv = `<img src="${product.image}" alt="${product.name}" style="max-width: 80%; max-height: 80%; object-fit: contain; z-index: 5; position: relative;" onerror="this.onerror=null; this.outerHTML='<div class=\\'thumb-placeholder\\'></div>';">`;
        }

        const card = `
            <div class="product-item" onclick="window.location.href='../product/product.html?name=${encodeURIComponent(product.name)}'" style="cursor: pointer;">
                <div class="thumb-container">
                    ${imageDiv}
                </div>
                <h3>${product.name}</h3>
                <div class="product-store">📍 View All Stores</div>
                <div class="product-price">💵 Starting from: ${product.price} EGP</div>
            </div>
        `;
        list.innerHTML += card;
    });
}

// Auth State UI check
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
