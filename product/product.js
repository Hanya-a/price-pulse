// ============================================================
// product.js  —  Product Detail Page (now backed by the API)
// ============================================================
// UPDATED: Products are fetched from the backend API instead
// of localStorage.  Store comparison & distance features
// are preserved.
// ============================================================

const API_URL = 'http://localhost:3000/products';

const mockStoreCoordinates = {
    "carrefour": [
        { name: "Maadi (City Centre)", lat: 29.9880, lng: 31.2980 },
        { name: "CFC (Tagamoa)",      lat: 30.0810, lng: 31.4020 },
        { name: "Mall of Egypt",      lat: 29.9715, lng: 31.0185 },
        { name: "Almaza",             lat: 30.0910, lng: 31.3520 },
        { name: "Dandy Mall",         lat: 30.0610, lng: 30.9820 },
        { name: "Sheikh Zayed",       lat: 30.0120, lng: 30.9780 },
        { name: "Obour City",         lat: 30.2210, lng: 31.4620 },
        { name: "Heliopolis",         lat: 30.1080, lng: 31.3280 }
    ],
    "carrefour egypt": [
        { name: "Maadi (City Centre)", lat: 29.9880, lng: 31.2980 },
        { name: "CFC (Tagamoa)",      lat: 30.0810, lng: 31.4020 },
        { name: "Mall of Egypt",      lat: 29.9715, lng: 31.0185 },
        { name: "Almaza",             lat: 30.0910, lng: 31.3520 },
        { name: "Dandy Mall",         lat: 30.0610, lng: 30.9820 },
        { name: "Sheikh Zayed",       lat: 30.0120, lng: 30.9780 },
        { name: "Obour City",         lat: 30.2210, lng: 31.4620 },
        { name: "Heliopolis",         lat: 30.1080, lng: 31.3280 }
    ],
    "spinneys": [
        { name: "Citystars",          lat: 30.0715, lng: 31.3435 },
        { name: "Mall of Arabia",     lat: 30.0076, lng: 30.9734 },
        { name: "Mokattam",           lat: 30.0210, lng: 31.3020 },
        { name: "New Cairo (Concord)",lat: 30.0280, lng: 31.4580 },
        { name: "Mohandessin",        lat: 30.0545, lng: 31.2010 },
        { name: "Sheikh Zayed",       lat: 30.0220, lng: 31.0020 }
    ],
    "spinneys egypt": [
        { name: "Citystars",          lat: 30.0715, lng: 31.3435 },
        { name: "Mall of Arabia",     lat: 30.0076, lng: 30.9734 },
        { name: "Mokattam",           lat: 30.0210, lng: 31.3020 },
        { name: "New Cairo (Concord)",lat: 30.0280, lng: 31.4580 },
        { name: "Mohandessin",        lat: 30.0545, lng: 31.2010 },
        { name: "Sheikh Zayed",       lat: 30.0220, lng: 31.0020 }
    ],
    "metro markets": [
        { name: "Dokki",              lat: 30.0385, lng: 31.2120 },
        { name: "Zamalek",            lat: 30.0620, lng: 31.2185 },
        { name: "Heliopolis (Korba)", lat: 30.0915, lng: 31.3245 },
        { name: "Maadi (Degla)",      lat: 29.9620, lng: 31.2650 },
        { name: "Nasr City (Abbas)",  lat: 30.0615, lng: 31.3325 },
        { name: "Nasr City (Makram)", lat: 30.0540, lng: 31.3480 },
        { name: "Rehab City",         lat: 30.0620, lng: 31.4880 },
        { name: "Madinaty",           lat: 30.0820, lng: 31.6420 },
        { name: "Sherouk City",       lat: 30.1380, lng: 31.6210 },
        { name: "Mokattam",           lat: 30.0145, lng: 31.3015 },
        { name: "Sheikh Zayed",       lat: 30.0285, lng: 31.0015 },
        { name: "Manyal",             lat: 30.0180, lng: 31.2260 },
        { name: "Mohandessin",        lat: 30.0515, lng: 31.1985 }
    ],
    "seif pharmacies": [
        { name: "Heliopolis",         lat: 30.0955, lng: 31.3340 },
        { name: "Mohandessin",        lat: 30.0485, lng: 31.2045 },
        { name: "Maadi",              lat: 29.9680, lng: 31.2590 },
        { name: "New Cairo",          lat: 30.0180, lng: 31.4480 },
        { name: "Nasr City",          lat: 30.0585, lng: 31.3410 },
        { name: "Dokki",              lat: 30.0365, lng: 31.2085 }
    ],
    "b.tech": [
        { name: "Nasr City",          lat: 30.0620, lng: 31.3420 },
        { name: "Giza",               lat: 30.0080, lng: 31.2050 },
        { name: "Sheikh Zayed",       lat: 30.0250, lng: 31.0050 },
        { name: "Heliopolis",         lat: 30.0980, lng: 31.3280 }
    ],
    "raya shop": [
        { name: "Mohandessin",        lat: 30.0555, lng: 31.2065 },
        { name: "New Cairo",          lat: 30.0285, lng: 31.4825 },
        { name: "Nasr City",          lat: 30.0645, lng: 31.3365 },
        { name: "Maadi",              lat: 29.9625, lng: 31.2585 }
    ],
    "awlad ragab": [
        { name: "Maadi",              lat: 29.9580, lng: 31.2505 },
        { name: "Nasr City",          lat: 30.0550, lng: 31.3250 },
        { name: "Heliopolis",         lat: 30.0920, lng: 31.3220 },
        { name: "Sheikh Zayed",       lat: 30.0250, lng: 30.9850 },
        { name: "Faisal",             lat: 30.0050, lng: 31.1850 }
    ],
    "hyperone": [
        { name: "Sheikh Zayed",       lat: 30.0385, lng: 30.9885 },
        { name: "Km 55 Desert Road",  lat: 30.1550, lng: 30.8550 },
        { name: "10th of Ramadan",    lat: 30.3020, lng: 31.7520 }
    ],
    "chefaa": [{ name: "Online", lat: 0, lng: 0 }],
    "jumia egypt": [{ name: "Online", lat: 0, lng: 0 }]
};

// Helper to find nearest branch distance
function getNearestDistance(userLat, userLng, storeName) {
    if (!storeName) return Infinity;
    const normalized = storeName.toLowerCase().trim();
    
    // 1. Direct match
    let branches = mockStoreCoordinates[normalized];
    
    // 2. Fuzzy match fallback (e.g. "Carrefour Health" -> "carrefour")
    if (!branches) {
        const fuzzyKey = Object.keys(mockStoreCoordinates).find(k => 
            normalized.includes(k) || k.includes(normalized)
        );
        if (fuzzyKey) branches = mockStoreCoordinates[fuzzyKey];
    }
    
    // 3. Online stores check
    if (normalized.includes('jumia') || normalized.includes('chefaa') || normalized.includes('online')) {
        return Infinity;
    }
    
    if (!branches) {
        console.warn(`[PricePulse] No branch data for: "${storeName}" - using default location.`);
        return haversine(userLat, userLng, defaultLocation.lat, defaultLocation.lng);
    }
    
    let minDistance = Infinity;
    branches.forEach(branch => {
        const d = haversine(userLat, userLng, branch.lat, branch.lng);
        if (d < minDistance) minDistance = d;
    });
    return minDistance;
}
const defaultLocation = { lat: 30.0444, lng: 31.2357 };

let matchingProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get("name");

    if (!productName) {
        window.location.href = "../productlist/productlist.html";
        return;
    }

    // --- Fetch all products from the backend API ---
    let allProducts = [];
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Server returned ' + response.status);
        allProducts = await response.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        document.getElementById("productTitle").textContent = "⚠️ Could not load product data";
        return;
    }

    matchingProducts = allProducts.filter(p =>
        p.name.toLowerCase() === productName.toLowerCase()
    );

    if (matchingProducts.length === 0) {
        document.getElementById("productTitle").textContent = "Product Not Found";
        document.getElementById("productCategory").style.display = "none";
        return;
    }

    // Sort cheapest first
    matchingProducts.sort((a, b) => a.price - b.price);

    // Update page title
    document.title = "Price Pulse – " + matchingProducts[0].name;

    // Hero: title & category
    document.getElementById("productTitle").textContent = matchingProducts[0].name;
    document.getElementById("productCategory").textContent =
        (matchingProducts[0].category || "general").replace(/-/g, ' ').toUpperCase();

    // Description
    const withDesc = matchingProducts.find(p => p.description && p.description.trim());
    if (withDesc) {
        document.getElementById("productDescription").textContent = withDesc.description;
    }

    // Stats strip
    const prices = matchingProducts.map(p => p.price);
    document.getElementById("statLowest").textContent  = Math.min(...prices) + " EGP";
    document.getElementById("statHighest").textContent = Math.max(...prices) + " EGP";
    document.getElementById("statStores").textContent  = matchingProducts.length;

    // Hero image
    const imgWrap = document.getElementById("productImageContainer");
    const withImg = matchingProducts.find(p => p.image && p.image.trim());
    if (withImg) {
        imgWrap.innerHTML = `<img src="${withImg.image}" alt="${withImg.name}"
            onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-icon\\'>📦</div>';">`;
    } else {
        imgWrap.innerHTML = `<div class="placeholder-icon">📦</div>`;
    }

    renderStoreCards();
    checkAuthState();
});

// Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderStoreCards(distanceMap = {}) {
    const container = document.getElementById("storeListContainer");
    container.innerHTML = "";

    const cheapestPrice = Math.min(...matchingProducts.map(p => p.price));

    matchingProducts.forEach(product => {
        const storeName = product.store || "Unknown Store";
        const branches = mockStoreCoordinates[storeName.toLowerCase().trim()] || 
                         mockStoreCoordinates[Object.keys(mockStoreCoordinates).find(k => storeName.toLowerCase().includes(k))];
        const coords   = (branches && branches.length > 0) ? branches[0] : defaultLocation;

        const isCheapest = product.price === cheapestPrice;
        let distKm = distanceMap[product.id] !== undefined
            ? `<strong>${distanceMap[product.id].toFixed(1)} km</strong> away`
            : "📍 Click 'Sort by Distance' to update";

        if (storeName.toLowerCase().includes('jumia')) {
            distKm = "🌐 Online Store";
        }

        const card = document.createElement("div");
        card.className = "store-card" + (isCheapest ? " cheapest" : "");
        card.dataset.lat   = coords.lat;
        card.dataset.lng   = coords.lng;
        card.dataset.price = product.price;
        card.dataset.id    = product.id;

        const safeStoreName = storeName.replace(/'/g, "\\'");
        const safeLocationLink = product.locationLink ? product.locationLink.replace(/'/g, "\\'") : '';

        card.innerHTML = `
            <div class="store-left">
                <div class="store-name-row">
                    <h3>🏪 ${storeName}</h3>
                    ${isCheapest ? '<span class="cheapest-tag">Best Price</span>' : ''}
                </div>
                <span class="store-distance" id="dist-${product.id}">${distKm}</span>
            </div>
            <div class="store-right">
                <span class="price-tag">${product.price != null ? product.price : '—'}<span class="currency">${product.price != null ? 'EGP' : ''}</span></span>
                <div class="store-btns">
                    ${product.link && product.link.trim() !== '' ? `
                    <a href="${product.link}" target="_blank" rel="noopener" class="store-link-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Store's Link
                    </a>` : ''}
                    ${storeName.toLowerCase().includes('jumia') || storeName.toLowerCase().includes('chefaa') ? '' : `
                    <a href="#" onclick="openDirections(event, '${safeStoreName}', '${safeLocationLink}')" class="directions-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Get Directions
                    </a>`}
                </div>
            </div>
        `;
        container.appendChild(card);

        // Track clicks on the store link for trending products
        const storeLink = card.querySelector('.store-link-btn');
        if (storeLink) {
            storeLink.addEventListener('click', () => {
                fetch('http://localhost:3000/track-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.productId, storeId: product.storeId })
                }).catch(() => {}); // fire-and-forget
            });
        }
    });
}

// Distance sort
function calculateDistances() {
    const btn = document.getElementById("locateMeBtn");
    btn.textContent = "📍 Locating…";
    btn.disabled = true;

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        btn.textContent = "📍 Sort by Distance";
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude: userLat, longitude: userLng } = position.coords;
            console.log(`[PricePulse] User Location: ${userLat}, ${userLng}`);
            const distanceMap = {};
            
            matchingProducts.forEach(product => {
                const storeName = product.store || "";
                const d = getNearestDistance(userLat, userLng, storeName);
                distanceMap[product.id] = d;
                
                if (d === Infinity) {
                    console.log(`[PricePulse] ${storeName}: Online Store`);
                } else {
                    console.log(`[PricePulse] ${storeName}: ${d.toFixed(2)} km`);
                }
            });

            // Sort by distance
            matchingProducts.sort((a, b) => distanceMap[a.id] - distanceMap[b.id]);

            document.getElementById("sortLabel").textContent = "Sorted by distance from you";
            renderStoreCards(distanceMap);

            btn.textContent = "✅ Sorted by Distance";
        },
        () => {
            alert("Location access denied. Showing price order instead.");
            btn.textContent = "📍 Sort by Distance";
            btn.disabled = false;
        },
        { enableHighAccuracy: true, maximumAge: 0 }
    );
}

function updateAllDistancesUI(userLat, userLng) {
    if (!matchingProducts || matchingProducts.length === 0) return;
    
    matchingProducts.forEach(product => {
        const storeName = product.store || "";
        const d = getNearestDistance(userLat, userLng, storeName);
        
        const distSpan = document.getElementById(`dist-${product.id}`);
        if (distSpan) {
            if (storeName.toLowerCase().includes('jumia') || storeName.toLowerCase().includes('chefaa')) {
                distSpan.innerHTML = "🌐 Online Store";
            } else if (d === Infinity) {
                distSpan.innerHTML = "📍 N/A";
            } else {
                distSpan.innerHTML = `<strong>${d.toFixed(1)} km</strong> away`;
            }
        }
    });
}

window.openDirections = function(event, storeName, customLink) {
    event.preventDefault();
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Locating...';
    btn.style.pointerEvents = 'none';

    const fallbackUrl = customLink && customLink.trim() !== '' 
        ? customLink 
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeName)}`;

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser. Attempting generic directions.");
        window.open(fallbackUrl, '_blank');
        resetBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            updateAllDistancesUI(latitude, longitude); // Update on-page stats!
            
            let url = fallbackUrl;
            if (!customLink || customLink.trim() === '') {
                url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(storeName)}`;
            } else if (customLink.includes('google.com/maps/dir/') && !customLink.includes('origin=')) {
                url = customLink + (customLink.includes('?') ? '&' : '?') + `origin=${latitude},${longitude}`;
            }
            window.open(url, '_blank', 'noopener');
            resetBtn();
        },
        () => {
            alert("Location access denied or failed. Opening default directions.");
            window.open(fallbackUrl, '_blank', 'noopener');
            resetBtn();
        },
        { enableHighAccuracy: true, maximumAge: 0 }
    );

    function resetBtn() {
        btn.innerHTML = originalText;
        btn.style.pointerEvents = 'auto';
    }
}

function sortByCheapest() {
    matchingProducts.sort((a, b) => a.price - b.price);
    document.getElementById("sortLabel").textContent = "Sorted by lowest price";
    const btn = document.getElementById("locateMeBtn");
    btn.textContent = "📍 Sort by Distance";
    btn.disabled = false;
    renderStoreCards();
}

function executeSearch() {
    const val = document.getElementById("productSearchInput").value.trim();
    if (val) window.location.href = `../productlist/productlist.html?search=${encodeURIComponent(val)}`;
}

function checkAuthState() {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return;
    const user = JSON.parse(raw);
    if (user.email === "adminpricepulse@gmail.com") {
        const dropdown = document.getElementById("productDropdown");
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
