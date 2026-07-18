loadDashboard();

async function loadDashboard(){

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/admin";
    }

    const response = await fetch(
        "/api/admin/stats",
        {
            headers:{
                "Authorization":"Bearer " + token
            }
        }
    );

    if(!response.ok){

        window.location.replace("/admin");
        alert("Failed to load dashboard");

        return;

    }

    document.getElementById("app").style.display = "block";

    const data = await response.json();

    loadStats(data.stats);

    loadUpcoming(data.upcoming);

    loadActivity(data.activity);

    document.getElementById("lastUpdated").textContent =
    new Date().toLocaleString();// hmmm

}

function loadStats(stats){

    document.getElementById("todayAppointments").textContent =
    stats.todayAppointments;

    document.getElementById("checkedInPets").textContent =
    stats.checkedInPets;

    document.getElementById("groomingPets").textContent =
    stats.groomingPets;

    document.getElementById("readyForPickup").textContent =
    stats.readyForPickup;

    document.getElementById("completedAppointments").textContent =
    stats.completedAppointments;

    document.getElementById("cancelledAppointments").textContent =
    stats.cancelledAppointments;

    document.getElementById("todayRevenue").textContent =
    "₱" + stats.todayRevenue;

}

function loadUpcoming(appointments){

    const table =
    document.getElementById("upcomingTable");

    let html = "";

    appointments.forEach(app=>{

        html += `

        <tr>

            <td>

                ${new Date(app.start_datetime)
                    .toLocaleTimeString([],{
                        hour:"2-digit",
                        minute:"2-digit"
                    })}

            </td>

            <td>

                ${app.pet_name}

            </td>

            <td>

                ${app.first_name}
                ${app.last_name}

            </td>

            <td>

                ${
                app.staff_first_name
                ?
                app.staff_first_name + " " + app.staff_last_name
                :
                "Unassigned"
                }

            </td>

        </tr>

        `;

    });

    table.innerHTML = html;

}

function loadActivity(activity){

    const container =
    document.getElementById("activityList");

    let html = "";

    activity.forEach(item=>{

        html += `

        <div class="activity-item">

            <strong>

                ${item.pet_name}

            </strong>

            was

            <strong>

                ${item.status}

            </strong>

            <br>

            <small>

                ${new Date(item.updated_at)
                    .toLocaleString()}

            </small>

        </div>

        `;

    });

    container.innerHTML = html;

}