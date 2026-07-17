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

    const form = document.getElementById("petForm");

    // ---------- OWNER ----------

    async function loadOwner() {

        try {

            const res = await fetch("/api/users/me", {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (handleAuthError(res)) return;

            if (!res.ok) return;

            const owner = await res.json();

            document.querySelector(".owner-name").textContent =
                `${owner.first_name} ${owner.last_name}`;

            document.querySelector(".owner-email").textContent =
                owner.email;

            document.querySelector(".owner-phone").textContent =
                owner.phone_number;

        }

        catch (err) {

            console.error(err);

        }

    }

    loadOwner();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pet = {
            pet_name: document.getElementById("pet_name").value,
            species: document.getElementById("species").value,
            breed: document.getElementById("breed").value,
            gender: document.getElementById("gender").value,
            birth_date: document.getElementById("birth_date").value || null,
            weight: document.getElementById("weight").value || null,
            size: document.getElementById("size").value || null
        };

        const res = await fetch("/api/pets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(pet)
        });

        if (res.ok) {
            alert("Pet added!");
            window.location.href = "dashboard-dev.html";
        } else {
            alert("Failed to add pet");
        }
    });

});