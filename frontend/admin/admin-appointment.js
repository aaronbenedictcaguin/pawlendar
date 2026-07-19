const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/admin";
}

loadAppointments();

const selectedAppointment =
new URLSearchParams(window.location.search)
.get("id");

let allAppointments = [];

async function loadAppointments(){

    const response = await fetch(
        "/api/admin/appointments",
        {
            headers:{
                "Authorization":"Bearer " + token
            }
        }
    );

    const data = await response.json();


    if(!response.ok){

        window.location.replace("/admin");

        alert(data.message || "Failed to load appointments");

        return;

    }

    document.getElementById("app").style.display = "block";
    allAppointments = data;

    displayAppointments(allAppointments);

    initializeFilters();

}




function displayAppointments(appointments){


    const table =
    document.getElementById("appointmentTableBody");


    let html = "";


    appointments.forEach(app=>{


        const date =
        new Date(app.start_datetime)
        .toLocaleDateString();


        const time =
        new Date(app.start_datetime)
        .toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });



        html += `

        <tr id="appointment-${app.appointment_id}">

            <td>
                ${app.appointment_id}
            </td>


            <td>
                ${app.pet_name}
            </td>


            <td>
                ${app.first_name}
                ${app.last_name}
            </td>


            <td>
                ${date}
            </td>


            <td>
                ${time}
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


            <td>

                <span class="status-badge ${formatStatus(app.status)}">

                    ${app.status}

                </span>

            </td>


            <td>

                <select class="payment-select ${app.payment_status.toLowerCase()}"
                    onchange="changePaymentStatus(${app.appointment_id}, this.value)"
                    ${app.status !== "Completed" ? "disabled" : ""}
                >

                    <option
                        value="Pending"
                        ${app.payment_status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Paid"
                        ${app.payment_status === "Paid" ? "selected" : ""}
                    >
                        Paid
                    </option>

                </select>

            </td>


            <td>
                ₱${app.total_price}
            </td>


            <td>
                <div class="action-buttons">
                    <button
                        class="update-btn"
                        ${app.status === "Completed" || app.status === "Cancelled" ? "disabled" : ""}
                        onclick="
                            changeStatus(
                                ${app.appointment_id},
                                '${app.status}'
                            )">

                        ${getButtonText(app.status)}

                    </button>

                    <button
                        class="cancel-btn"
                        ${app.status === "Completed" || app.status === "Cancelled" ? "disabled" : ""}
                        onclick="cancelAppointment(${app.appointment_id})">

                        Cancel

                    </button>
                </div>
            </td>


        </tr>

        `;

    });


    table.innerHTML = html;

    if(selectedAppointment){

        const row =
        document.getElementById(
            `appointment-${selectedAppointment}`
        );


        if(row){

            row.classList.add("highlight-row");


            row.scrollIntoView({
                behavior:"smooth",
                block:"center"
            });

            setTimeout(()=>{

                row.classList.remove("highlight-row");

            },3000);

        }

    }
    

}

function initializeFilters(){

    const searchInput =
    document.getElementById("searchInput");

    const statusFilter =
    document.getElementById("statusFilter");

    const dateFilter =
    document.getElementById("dateFilter");

    searchInput.oninput = filterAppointments;
    statusFilter.onchange = filterAppointments;
    dateFilter.onchange = filterAppointments;

}

function filterAppointments(){

    const search =
    document.getElementById("searchInput")
    .value
    .toLowerCase();

    const status =
    document.getElementById("statusFilter")
    .value;

    const date =
    document.getElementById("dateFilter")
    .value;

    const today = new Date();

    const filtered = allAppointments.filter(app=>{

        const pet =
        app.pet_name.toLowerCase();

        const owner =
        `${app.first_name} ${app.last_name}`.toLowerCase();

        const matchesSearch =
            pet.includes(search) ||
            owner.includes(search);

        const matchesStatus =
            status === "All" ||
            app.status === status;

        const appDate =
        new Date(app.start_datetime);

        let matchesDate = true;

        if (dateFilter === "today") {

            const today = new Date();

            filtered = filtered.filter(app => {

                const appDate = new Date(app.start_datetime);

                return (
                    appDate.getFullYear() === today.getFullYear() &&
                    appDate.getMonth() === today.getMonth() &&
                    appDate.getDate() === today.getDate()
                );

            });

        }

        else if(date==="week"){

            const diff =
            (appDate - today) /
            (1000*60*60*24);

            matchesDate =
            diff>=0 && diff<=7;

        }

        else if(date==="month"){

            matchesDate =
                appDate.getMonth() === today.getMonth() &&
                appDate.getFullYear() === today.getFullYear();

        }

        return (
            matchesSearch &&
            matchesStatus &&
            matchesDate
        );

    });

    displayAppointments(filtered);

}

function formatStatus(status){

    return status
    .toLowerCase()
    .replaceAll(" ","-");

}



function getButtonText(status){


    switch(status){

        case "Scheduled":
            return "Check In";


        case "Checked In":
            return "Start";


        case "In Progress":
            return "Ready";


        case "Ready for Pickup":
            return "Complete";


        case "Completed":
            return "Completed";


        case "Cancelled":
            return "Cancelled";

    }

}




function getNextStatus(status){


    switch(status){

        case "Scheduled":
            return "Checked In";


        case "Checked In":
            return "In Progress";


        case "In Progress":
            return "Ready for Pickup";


        case "Ready for Pickup":
            return "Completed";


        default:
            return status;

    }

}




async function changeStatus(id,currentStatus){


    const nextStatus =
    getNextStatus(currentStatus);



    const response = await fetch(

        `/api/admin/appointments/${id}/status`,

        {

            method:"PUT",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },


            body:JSON.stringify({

                status:nextStatus

            })

        }

    );


    const data = await response.json();


    if(!response.ok){

        alert(data.message || "Failed to update status");

        return;

    }


    await loadAppointments();

}

async function cancelAppointment(id){

    const confirmCancel = confirm(
        "Are you sure you want to cancel this appointment?"
    );

    if(!confirmCancel){
        return;
    }

    const response = await fetch(

        `/api/admin/appointments/${id}`,

        {
            method: "DELETE",

            headers:{
                "Authorization":"Bearer " + token
            }
        }

    );

    const data = await response.json();

    if(!response.ok){

        alert(data.message || "Failed to cancel appointment");

        return;

    }

    alert(data.message);

    await loadAppointments();

}

async function changePaymentStatus(id, paymentStatus){

    const confirmUpdate = confirm(
        `Change payment status to "${paymentStatus}"?

        This will record the payment date and time.`
    );

    if(!confirmUpdate){

        // Restore the previous value
        loadAppointments();

        return;

    }

    const response = await fetch(

        `/api/admin/appointments/${id}/payment`,

        {

            method:"PUT",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },

            body:JSON.stringify({

                payment_status: paymentStatus

            })

        }

    );

    const data = await response.json();

    if(!response.ok){

        alert(data.message || "Failed to update payment status");

        loadAppointments();

        return;

    }

    alert("Payment status updated successfully.");

    await loadAppointments();
}

// Highlight current navbar page
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});