const API_URL = 'http://localhost:3000';

document.getElementById("loginform").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  // Admin hardcoded login
  if (email === "adminpricepulse@gmail.com" && password === "adminuh22uh") {
    localStorage.setItem("loggedInUser", JSON.stringify({ email, name: "Admin" }));
    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "../admin/admin.html";
    }, 1000);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.style.color = "red";
      message.textContent = data.error || "Invalid email or password. Please try again.";
      return;
    }

    // Store user info in localStorage for frontend session
    localStorage.setItem("loggedInUser", JSON.stringify(data.user));

    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "../homepage/homepage.html";
    }, 1000);

  } catch (err) {
    message.style.color = "red";
    message.textContent = "Could not connect to the server. Please try again.";
  }
});
