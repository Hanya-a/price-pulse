// ============================================================
// profile.js - Managing the User's Personal Dashboard
// ============================================================
// This controls the page where users can update their names,
// emails, ages, etc.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Authentication Check
    // If we look in the browser memory and they aren't logged in, redirect them out immediately
    const loggedInUserStr = localStorage.getItem("loggedInUser");
    if (!loggedInUserStr) {
        window.location.href = "../auth/login.html";
        return;
    }
    
    // Safely parse the text locally saved back into a Javascript object
    const loggedInUser = JSON.parse(loggedInUserStr);
    
    // 2. Admin Privileges Setup
    // If the person interacting with their profile happens to be the boss...
    if (loggedInUser.email === "adminpricepulse@gmail.com") {
        const dropdown = document.getElementById("profileDropdown");
        if (dropdown) {
            // Instead of standard user limits, inject "Manage Products" & "Admin Dashboard" right into their menu
            dropdown.innerHTML = `
               <a href="../admin/admin.html" style="display:block; margin-bottom:10px; font-weight:600; color:#1e1b4b;">Admin Dashboard</a>
               <a href="../productlist/productlist.html" style="display:block; font-weight:600; color:#1e1b4b;">Manage Products</a>
               <hr style="border:none; border-top:1px solid #f1f5f9; margin: 10px 0;">
               <a href="../auth/login.html" onclick="if(confirm('Are you sure you want to log out?')){localStorage.removeItem('loggedInUser');return true;}return false;" style="display:block; font-weight:600; color:#e11d48;">Log out</a>
            `;
        }
    }
    else {
        // Standard user html natively fixed
    }
    
    // 3. Populate existing user data instantly on the screen
    // Instead of giving them empty fields, pre-fill the fields with what we currently know about them.
    document.getElementById("fullName").value = loggedInUser.name || "";
    document.getElementById("email").value = loggedInUser.email || "";
    if (loggedInUser.dob) document.getElementById("dob").value = loggedInUser.dob;
    if (loggedInUser.gender) document.getElementById("gender").value = loggedInUser.gender;

    const profileForm = document.getElementById("profileForm");

    // 4. Save Changes Submission
    // Whenever the user clicks "Save" at the bottom of their profile
    profileForm.addEventListener("submit", (e) => {
        // Stop default browser behavior (page refresh)
        e.preventDefault();
        
        // Scoop up the freshest text they just wrote down inside the inputs
        const fullName = document.getElementById("fullName").value.trim();
        const dob = document.getElementById("dob").value;
        const email = document.getElementById("email").value.trim();
        const gender = document.getElementById("gender").value;

        // Ensure no empty mandatory spaces are submitted
        if (!fullName || !dob || !email || !gender) {
            alert("Please fill out all required fields.");
            return;
        }

        // Track their original email in case they just changed it, as emails act like our Primary Keys
        const originalEmail = loggedInUser.email;
        
        // Update the live locally tracking user
        loggedInUser.name = fullName;
        loggedInUser.email = email;
        loggedInUser.dob = dob;
        loggedInUser.gender = gender;
        
        // Overwrite the localized session token with the updated data
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        // Also update the main 'users' database array
        let users = JSON.parse(localStorage.getItem("users")) || [];
        // Scan the giant array of users searching for the one whose email matches the original unmodified one
        const index = users.findIndex(u => u.email === originalEmail);
        if (index !== -1) {
            // Found them! Replace their old database slot with their newly merged details
            users[index] = { ...users[index], ...loggedInUser };
            localStorage.setItem("users", JSON.stringify(users));
        }
        
        // Let the user know it was confirmed
        alert("Profile details successfully confirmed and updated!");
    });
});
