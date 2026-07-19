document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    function handleAuthError(res) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../public/login.html";
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

        console.log(appointments);

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

            const groomer =
                appointment.staff_first_name && appointment.staff_last_name
                    ? `${appointment.staff_first_name} ${appointment.staff_last_name}`
                    : "Not assigned";

            card.innerHTML = `
                <h3>${date.toLocaleDateString()}</h3>

                <p>
                    <strong>Time:</strong>
                    ${date.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit"
                    })}
                </p>

                <p>
                    <strong>Pet:</strong>
                    ${appointment.pet_name}
                </p>

                <p>
                    <strong>Groomer:</strong>
                    ${groomer}
                </p>

                <p>
                    <strong>Total:</strong>
                    ₱${Number(appointment.total_price).toFixed(2)}
                </p>

                <p>
                    <strong>Payment:</strong>
                    ${appointment.payment_status}
                </p>

                <span class="status ${getStatusClass(appointment.status)}">
                    ${appointment.status}
                </span>
            `;

            container.appendChild(card);

        });

    }

    loadOwner();
    loadAppointments();

});