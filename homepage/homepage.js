// ============================================================
// homepage.js  —  Price-Pulse Homepage
// ============================================================
// UPDATED: Removed the hardcoded product array (initDB).
// Products are now served by the backend. The homepage itself
// doesn't display products directly — it just handles search,
// categories, geolocation, and auth state.
// ============================================================

// ------ 1. Category navigation ------
// When a user clicks a category card, save the selection and redirect.
function openCategory(category) {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.href = "../auth/login.html";
    return;
  }
  localStorage.setItem("selectedCategory", category); // save selected category
  window.location.href = "../category/category.html"; // go to category page
}

// ------ 2. Search function ------
// Redirects to the product list page with a ?search= query string.
function searchProducts() {
  const searchValue = document.getElementById("searchInput").value.trim();
  if (searchValue === '') {
      window.location.href = "../productlist/productlist.html";
      return;
  }
  window.location.href = `../productlist/productlist.html?search=${encodeURIComponent(searchValue)}`;
}

// ------ 3. Simple button actions ------
function goHome() {
  window.location.href = "index.html";
}

function showAbout() {
  alert("This is a sample product store created for the project!");
}

function login() {
  alert("Login form will appear here!");
}

function register() {
  alert("Registration form will appear here!");
}

// ------ 4. Geolocation — "Use My Location" ------
function findNearestShop() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        alert(`Your location is:\nLatitude: ${lat}\nLongitude: ${lon}`);
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("You denied the request for location.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get your location timed out.");
            break;
          default:
            alert("An unknown error occurred while retrieving your location.");
            break;
        }
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// ------ 5. Auth State UI check (runs on page load) ------
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUserStr = localStorage.getItem("loggedInUser");
    if (loggedInUserStr) {
        const loggedInUser = JSON.parse(loggedInUserStr);
        if (loggedInUser.email === "adminpricepulse@gmail.com") {
            window.location.href = "../admin/admin.html";
            return;
        }

        // Replace login/register buttons with profile icon
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
});