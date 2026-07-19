const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {

    const calendarEl = document.getElementById("calendar");

    try {

        const response = await fetch(
            "http://localhost:3000/api/admin/appointments/calendar",
            {
                headers:{
                    "Authorization": "Bearer " + token
                }
            }
        );


        console.log("STATUS:", response.status);


        const events = await response.json();


        console.log("EVENTS:", events);



        const calendar = new FullCalendar.Calendar(
            calendarEl,
            {

                initialView: "dayGridMonth",

                height: "auto",

                events: events,


                eventClick(info){

                    document.getElementById("modalPet").textContent =
                        info.event.title;

                    document.getElementById("modalOwner").textContent =
                        info.event.extendedProps.owner;

                    document.getElementById("modalGroomer").textContent =
                        info.event.extendedProps.groomer;

                    document.getElementById("modalStatus").textContent =
                        info.event.extendedProps.status;

                    document.getElementById("manageBtn").onclick = () => {

                        window.location.href =
                        `admin-appointment.html?id=${info.event.id}`;

                    };

                    document
                        .getElementById("appointmentModal")
                        .classList.add("show");
                    
                    document.body.style.overflow = "hidden";

                }

            }
        );

        console.log(calendarEl.getBoundingClientRect());
        calendar.render();


    } catch(error){

        console.error(error);

    }

});

document
.getElementById("closeModal")
.onclick = () => {

    document
    .getElementById("appointmentModal")
    .classList.remove("show");

};

window.onclick = (e)=>{

    if(e.target.id==="appointmentModal"){

        document
        .getElementById("appointmentModal")
        .classList.remove("show");

        document.body.style.overflow = "auto";

    }

};

// Highlight current navbar page
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});