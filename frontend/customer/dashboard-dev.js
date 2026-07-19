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

    function getStatusClass(status) {

        switch (status) {

            case "Scheduled":
                return "pending";

            case "Confirmed":
                return "confirmed";

            case "In Progress":
                return "progress";

            case "Cancelled":
                return "cancelled";

            case "Late":
                return "late";

            default:
                return "";
        }

    }

    const petList = document.querySelector(".pet-list");

    // ---------------- OWNER ----------------
    async function loadOwner() {
        try {
            const res = await fetch("/api/users/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (handleAuthError(res)) return;

            if (!res.ok) {
                console.error("Failed to load owner");
                return;
            }

            const owner = await res.json();

            document.querySelector(".owner-name").textContent =
                `${owner.first_name} ${owner.last_name}`;

            document.querySelector(".owner-email span").textContent =
                owner.email;

            document.querySelector(".owner-phone span").textContent =
                owner.phone_number;

        } catch (err) {
            console.error("Owner error:", err);
        }
    }

    // ---------------- PETS ----------------
    async function loadPets() {

        try {

            const res = await fetch("/api/pets", {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (handleAuthError(res)) return;

            if (!res.ok) return;

            const pets = await res.json();

            petList.innerHTML = "";

            pets.forEach(pet => {

                const card = document.createElement("div");

                card.className = "pet-card";

                card.innerHTML = `
                    <img src="${pet.photo_url || "images/default-profile.svg"}">
                    <h4>${pet.pet_name}</h4>
                    <p>${pet.species}</p>
                    <small>${pet.breed}</small>
                `;

                card.addEventListener("click", () => {
                    window.location.href = `booking.html?pet_id=${pet.pet_id}`;
                });

                petList.appendChild(card);

            });

        }

        catch (err) {

            console.error(err);

        }

    }

    async function loadAppointments() {

        const res = await fetch("/api/appointments", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (handleAuthError(res)) return;

        if (!res.ok) {
            console.error("Failed to load appointments");
            return;
        }

        const appointments = await res.json();

        const container = document.querySelector(".appointments-grid");

        container.innerHTML = "";

        const upcoming = appointments.filter(appointment => {

            return (
                new Date(appointment.start_datetime) >= new Date() &&
                appointment.status !== "Completed" &&
                appointment.status !== "Cancelled" &&
                appointment.status !== "No Show"
            );

        });

        if (upcoming.length === 0) {

            container.innerHTML = `
                <div class="appointment-card">
                    <p>No upcoming appointments.</p>
                </div>
            `;

            return;
        }

        upcoming.forEach(appointment => {

            const card = document.createElement("div");

            card.className = "appointment-card";

            const date = new Date(appointment.start_datetime);

            card.innerHTML = `
                <strong>
                    ${date.toLocaleDateString()}
                </strong>

                <p>${appointment.pet_name || "Pet"}</p>

                <small>${appointment.service_name || ""}</small>

                <span class="status ${getStatusClass(appointment.status)}">
                    ${appointment.status}
                </span>
            `;

            container.appendChild(card);

        });

    }

    loadOwner();
    loadPets();
    loadAppointments();

});