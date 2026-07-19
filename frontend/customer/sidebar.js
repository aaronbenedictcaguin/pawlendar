document.addEventListener("DOMContentLoaded", async () => {

    const placeholder = document.getElementById("sidebar");
    if (!placeholder) return;

    try {
        const res = await fetch("sidebar.html");
        placeholder.innerHTML = await res.text();
    } catch (err) {
        console.error("Failed to load sidebar:", err);
        return;
    }
    const activeKey = document.body.dataset.activeNav;

    if (activeKey) {
        const activeItem = placeholder.querySelector(`.nav-item[data-nav="${activeKey}"]`);
        if (activeItem) activeItem.classList.add("active");
    }
    const logoutBtn = placeholder.querySelector("#logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch("/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!res.ok) return;

        const owner = await res.json();

        placeholder.querySelector(".owner-name").textContent =
            `${owner.first_name} ${owner.last_name}`;

        placeholder.querySelector(".owner-email").lastChild.textContent =
            ` ${owner.email}`;

        placeholder.querySelector(".owner-phone").lastChild.textContent =
            ` ${owner.phone_number}`;

    } catch (err) {
        console.error(err);
    }

});