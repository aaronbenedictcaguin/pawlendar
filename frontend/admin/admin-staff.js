document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    function handleAuthError(res) {

        if (res.status === 401 || res.status === 403) {

            localStorage.removeItem("token");
            window.location.href = "login.html";

            return true;
        }

        return false;
    }

    const form = document.getElementById("staffForm");
    const saveBtn = document.getElementById("saveStaffBtn");
    const errorEl = document.getElementById("formError");

    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
    }

    function clearError() {
        errorEl.textContent = "";
        errorEl.style.display = "none";
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();
        clearError();

        const staff = {
            first_name: document.getElementById("first_name").value.trim(),
            last_name: document.getElementById("last_name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone_number: document.getElementById("phone_number").value.trim() || null,
            specialization: document.getElementById("specialization").value.trim() || null,
            hire_date: document.getElementById("hire_date").value || null,
            max_daily_appointments: document.getElementById("max_daily_appointments").value || null
        };

        if (!staff.first_name || !staff.last_name || !staff.email) {
            showError("First name, last name, and email are required.");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        try {

            const res = await fetch("/api/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(staff)
            });

            if (handleAuthError(res)) return;

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                alert("Staff added successfully!");
                window.location.href = "dashboard-dev.html";
            } else {
                showError(data.error || data.message || "Failed to add staff.");
            }

        } catch (err) {

            console.error(err);
            showError("Something went wrong. Please try again.");

        } finally {

            saveBtn.disabled = false;
            saveBtn.textContent = "Save Staff";

        }

    });

    const footer = document.getElementById("footer");

    if (footer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => {
                footer.innerHTML = data;
            });
    }

});

// Highlight current navbar page
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});