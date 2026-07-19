const staffGrid = document.getElementById("staffGrid");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderStaff(staffList) {

    staffGrid.innerHTML = "";

    if (!staffList.length) {
        staffGrid.innerHTML = `
            <p class="services-empty">
                Our grooming team information will be available soon.
            </p>
        `;
        return;
    }

    staffList.forEach(staff => {

        staffGrid.innerHTML += `

        <div class="staff-card">

            <div class="staff-avatar">
                <img src="images/default-profile.svg"
                     alt="${escapeHtml(staff.first_name)}">
            </div>

            <h3>
                ${escapeHtml(staff.first_name)}
                ${escapeHtml(staff.last_name)}
            </h3>

            <p>${escapeHtml(staff.specialization)}</p>

            <ul>
                <li>
                    Daily Capacity:
                    ${staff.max_daily_appointments} appointments
                </li>

                <li>
                    Working Hours:
                    10:00 AM – 7:00 PM
                </li>
            </ul>

        </div>

        `;
    });

}

async function loadStaff() {

    try {

        const response = await fetch("/api/groomers");

        if (!response.ok) {
            throw new Error("Failed to fetch staff.");
        }

        const staff = await response.json();

        renderStaff(staff);

    } catch (err) {

        console.error(err);

        staffGrid.innerHTML = `
            <p class="services-empty">
                Unable to load our grooming team at the moment.
            </p>
        `;

    }

}

loadStaff();