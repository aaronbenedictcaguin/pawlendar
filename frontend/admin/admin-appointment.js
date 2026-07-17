const token = localStorage.getItem("token");


loadAppointments();


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

        alert(data.message || "Failed to load appointments");

        return;

    }


    displayAppointments(data);

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

        <tr>

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
                ${app.payment_status}
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


    loadAppointments();

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

    loadAppointments();

}