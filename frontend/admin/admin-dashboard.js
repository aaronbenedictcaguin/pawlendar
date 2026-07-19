document.addEventListener("DOMContentLoaded", loadDashboard)


async function loadDashboard(){

    const token = localStorage.getItem("token");


    if(!token){

        window.location.href = "http://localhost:3000/admin";
        return;

    }


    try{


        const response = await fetch(
            "http://localhost:3000/api/admin/stats",
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );


        if(!response.ok){

            console.error(await response.text());

            alert("Session expired. Please login again.");

            localStorage.removeItem("token");

            window.location.replace(
                "http://localhost:3000/admin"
            );

            return;

        }



        const data = await response.json();



        document.getElementById("app").style.display = "block";



        loadStats(data.stats || {});


        loadUpcoming(
            data.upcoming || []
        );


        loadActivity(
            data.activity || []
        );



        document.getElementById("lastUpdated").textContent =
            new Date().toLocaleString();



    }
    catch(error){

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}





function loadStats(stats){


    const setText = (id,value)=>{

        const element =
            document.getElementById(id);


        if(element){

            element.textContent =
                value ?? 0;

        }

    };



    setText(
        "todayAppointments",
        stats.todayAppointments
    );


    setText(
        "checkedInPets",
        stats.checkedInPets
    );


    setText(
        "groomingPets",
        stats.groomingPets
    );


    setText(
        "readyForPickup",
        stats.readyForPickup
    );


    setText(
        "completedAppointments",
        stats.completedAppointments
    );


    setText(
        "cancelledAppointments",
        stats.cancelledAppointments
    );



    setMoney(
        "todayRevenue",
        stats.todayRevenue
    );


    setMoney(
        "monthlyRevenue",
        stats.monthlyRevenue
    );


    setMoney(
        "averageSale",
        stats.averageSale
    );



    setText(
        "totalCustomers",
        stats.totalCustomers
    );


    setText(
        "totalPets",
        stats.totalPets
    );


    setText(
        "activeGroomers",
        stats.activeGroomers
    );


    setText(
        "bronzeMembers",
        stats.bronzeMembers
    );


    setText(
        "silverMembers",
        stats.silverMembers
    );


    setText(
        "goldMembers",
        stats.goldMembers
    );


}





function setMoney(id,value){


    const element =
        document.getElementById(id);


    if(element){

        element.textContent =
            "₱" +
            Number(value || 0)
            .toLocaleString(
                "en-PH",
                {
                    minimumFractionDigits:2
                }
            );

    }

}







function loadUpcoming(appointments){


    const table =
        document.getElementById(
            "upcomingTable"
        );


    if(!table)
        return;



    if(appointments.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="4">
                    No upcoming appointments
                </td>

            </tr>

        `;

        return;

    }



    table.innerHTML =
        appointments.map(app=>{


            const time =
                new Date(
                    app.start_datetime
                )
                .toLocaleTimeString(
                    [],
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                );



            const groomer =
                app.staff_first_name
                ?
                `${app.staff_first_name}
                 ${app.staff_last_name}`
                :
                "Unassigned";



            return `

                <tr>

                    <td>
                        ${time}
                    </td>


                    <td>
                        ${app.pet_name}
                    </td>


                    <td>
                        ${app.first_name}
                        ${app.last_name}
                    </td>


                    <td>
                        ${groomer}
                    </td>


                </tr>


            `;


        }).join("");

}








function loadActivity(activity){


    const container =
        document.getElementById(
            "activityList"
        );


    if(!container)
        return;




    if(activity.length === 0){


        container.innerHTML = `

            <p>
                No recent activity
            </p>

        `;

        return;

    }




    container.innerHTML =

        activity.map(item=>{


            return `

            <div class="activity-item">


                <strong>
                    ${item.pet_name}
                </strong>


                <span>

                    Status:
                    <b>
                        ${item.status}
                    </b>

                </span>



                <small>

                    ${
                        new Date(
                            item.updated_at
                        )
                        .toLocaleString()
                    }

                </small>



            </div>


            `;


        }).join("");

}

// Highlight current navbar page
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});