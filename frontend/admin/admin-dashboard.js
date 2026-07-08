loadDashboard();

async function loadDashboard() {

    const token = localStorage.getItem("token");

    const response = await fetch(
        "http://localhost:3000/api/dashboard/stats",
        {
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    if (!response.ok) {

        alert("Failed to load dashboard");

        return;

    }

    const data = await response.json();

    document.getElementById("todayAppointments").textContent =
        data.todayAppointments ?? 0;

    document.getElementById("checkedInPets").textContent =
        data.checkedInPets ?? 0;

    document.getElementById("groomingPets").textContent =
        data.groomingPets ?? 0;

    document.getElementById("readyForPickup").textContent =
        data.readyForPickup ?? 0;

    document.getElementById("completedAppointments").textContent =
        data.completedAppointments ?? 0;

    document.getElementById("lastUpdated").textContent =
        new Date().toLocaleString();

}