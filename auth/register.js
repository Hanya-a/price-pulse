const API_URL = 'http://localhost:3000';

document.getElementById("registerform").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const preferredcity = document.getElementById("city").value.trim();
    const message = document.getElementById("message");

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, city: preferredcity })
        });

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.error || "Registration failed.";
            return;
        }

        message.style.color = "green";
        message.textContent = "Thank you for registering! Redirecting to login...";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (err) {
        message.style.color = "red";
        message.textContent = "Could not connect to the server. Please try again.";
    }
});
