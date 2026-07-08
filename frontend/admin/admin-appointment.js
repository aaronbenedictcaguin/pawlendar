loadAppointments();


async function loadAppointments(){

    const token = localStorage.getItem("token");


    const response = await fetch(
        "http://localhost:3000/api/appointments/admin/appointments",
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
        }
    );


    if(!response.ok){

        alert("Failed to load appointments");

        return;

    }


    const result = await response.json();


    displayAppointments(result);

}




function displayAppointments(appointments){

    const container =
    document.getElementById("appointmentContainer");


    let html = "";


    appointments.forEach(appointment=>{


        const completed =
        appointment.status === "Completed"
        ? "disabled"
        : "";



        html += `

        <div class="appointment-card">


            <h3>
            Appointment #${appointment.appointment_id}
            </h3>


            <p>
            Status:
            <span class="status-badge">
            ${appointment.status}
            </span>
            </p>



            <button
            ${completed}
            onclick="
            changeStatus(
            ${appointment.appointment_id},
            '${appointment.status}'
            )">

            ${getButtonText(appointment.status)}

            </button>


        </div>

        `;


    });


    container.innerHTML = html;


}





function getButtonText(status){


    switch(status){


        case "Scheduled":
            return "Check In";


        case "Checked In":
            return "Start Grooming";


        case "In Progress":
            return "Ready for Pickup";


        case "Ready for Pickup":
            return "Complete";


        case "Completed":
            return "Completed";


        default:
            return "Update";


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


    const token = localStorage.getItem("token");


    const nextStatus =
    getNextStatus(currentStatus);



    const response = await fetch(

        `http://localhost:3000/api/appointments/${id}/status`,

        {

            method:"PUT",


            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },


            body:JSON.stringify({

                status:nextStatus

            })

        }

    );



    if(!response.ok){

        alert("Failed to update status");

        return;

    }


    loadAppointments();


}