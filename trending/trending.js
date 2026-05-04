// ============================================================
// trending.js  —  Price-Pulse Trending Page
// ============================================================
// This controls the "Trending Products" page, which sorts and 
// displays the items getting the most clicks from users across
// the platform!
// ============================================================

// ------ 1. Header/Navigation Behavior Setup ------
// As soon as the page finishes visually appearing:
document.addEventListener("DOMContentLoaded", () => {
    // Check if the user is already logged into the website
    const loggedInUserStr = localStorage.getItem("loggedInUser");
    if (loggedInUserStr) {
        const loggedInUser = JSON.parse(loggedInUserStr);
        
        // Security logic: The system owner shouldn't browse casually, 
        // redirect them to the Admin side of the site.
        if (loggedInUser.email === "adminpricepulse@gmail.com") {
            window.location.href = "../admin/admin.html";
            return;
        }

        // If they are a normal user, overwrite the "Login/Register" words in the top right
        // corner with a stylish circular profile icon SVG linking to their account instead!
        const authContainers = document.querySelectorAll("header > div:last-child");
        authContainers.forEach(container => {
            if (container.innerHTML.includes("login.html") || container.innerHTML.includes("Login")) {
                container.innerHTML = `
                  <div class="profile-icon" style="cursor:pointer; background: var(--accent); color: var(--white); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);" onclick="window.location.href='../profile/profile.html'">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                  </div>
                `;
            }
        });
    }

    // ------ 2. Actually load the Trending SQL Data ------
    loadTrendingProducts();
});

// Asynchronous function indicating we are going to wait around for network data
async function loadTrendingProducts() {
    // Look for the area on the HTML canvas where products should get pasted into
    const container = document.getElementById("trending-list");
    if (!container) return; // Exit if the html container got deleted

    try {
        // Communicate with the backend endpoint handling our analytics calculations
        const response = await fetch("http://localhost:3000/trending");
        if (!response.ok) throw new Error("Failed to fetch trending");
        
        // De-serialize the raw network response into a clean javascript Array
        const trending = await response.json();

        // Edge Case: If the database is completely empty or no one's clicking yet, show a nice message
        if (trending.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#999; padding: 2rem 0;">No trending products yet. Start browsing to see what's popular!</p>`;
            return;
        }

        // Wipe any placeholder loading spinners
        container.innerHTML = "";
        
        // Loop through the array of top 5 trending products...
        trending.forEach(product => {
            // Default Graphic Setup (If they don't have an image, give them a boxed package emoji design)
            let imageDiv = `<div style="width:100%; height:160px; background:linear-gradient(135deg,#e0e7ff,#c7d2fe); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:2.5rem;">📦</div>`;
            
            // If the database actually provided an image URL, inject the real product picture
            if (product.image && product.image.trim() !== '') {
                imageDiv = `<img src="${product.image}" alt="${product.name}" style="width:100%; height:160px; object-fit:contain; border-radius:12px; background:#f8fafc;" onerror="this.onerror=null; this.outerHTML='<div style=\\'width:100%;height:160px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;\\'>📦</div>';">`;
            }

            // Create instructions for where exactly clicking this product will navigate to
            const destination = `../product/product.html?name=${encodeURIComponent(product.name)}`;

            // Create the physical card rectangle for the specific item
            const card = document.createElement("article");
            card.className = "trending-card";
            card.dataset.href = destination;
            card.style.cursor = "pointer";
            
            // "Draw" the inside contents (Images + Name + Click count tracking variable + Minimum Price)
            card.innerHTML = `
                ${imageDiv}
                <h4>${product.name}</h4>
                <p style="font-size:0.85rem; color:#6366f1; font-weight:600;">🔥 ${product.clicks} click${product.clicks !== 1 ? 's' : ''}</p>
                <p style="font-size:1rem; font-weight:700; color:#1e1b4b;">💵 ${product.price} EGP</p>
            `;
            
            // Put a clickable listener heavily guarded against non-logged in users.
            card.addEventListener('click', function () {
                if (!localStorage.getItem("loggedInUser")) {
                    // Redirect unverified users
                    window.location.href = "../auth/login.html";
                    return;
                }
                // Allow verified users through directly to the product detail screen
                window.location.href = this.dataset.href;
            });
            
            // Attach our newly generated product card right onto the visible webpage! 
            container.appendChild(card);
        });
    } catch (err) {
        // If the backend refuses connection completely, securely fail without breaking the user experience.
        container.innerHTML = `<p style="text-align:center; color:#999; padding: 2rem 0;">No trending products yet. Start browsing to see what's popular!</p>`;
    }
}
