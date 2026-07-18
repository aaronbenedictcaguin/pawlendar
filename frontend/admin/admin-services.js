const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/admin";
}

loadServices();



async function loadServices(){


    const response = await fetch(
        "/api/services",
        {
            headers:{
                "Authorization":
                "Bearer " + token
            }
        }
    );


    const data = await response.json();


    console.log(data);


    if(!response.ok){

        window.location.replace("/admin");
        alert(data.message || "Failed loading services");

        return;

    }
    document.getElementById("app").style.display = "block";

    displayServices(data);


}




function displayServices(services){


    const table =
    document.getElementById("serviceTable");
     const serviceCount = document.getElementById("serviceCount");

    // Update the counter
    serviceCount.textContent =
        `${services.length} Service${services.length !== 1 ? "s" : ""}`;

    let html="";


    services.forEach(service=>{


        html += `

        <tr>


            <td>
                ${service.service_id}
            </td>


            <td>
                ${service.service_name}
            </td>


            <td>
                ${service.category}
            </td>


            <td>
                ${service.description}
            </td>


            <td>
                ₱${service.price}
            </td>


            <td>
                ${service.duration_minutes} mins
            </td>


            <td>

                <button
                class="delete-btn"
                onclick="deleteService(${service.service_id})">

                <i class="fa-solid fa-trash">
                Delete
                </i>

                </button>


            </td>


        </tr>


        `;


    });


    table.innerHTML = html;


}




function editService(id){

    window.location.href =
    `edit-service.html?id=${id}`;

}




async function deleteService(id){


    if(!confirm("Delete this service?"))
        return;



    const response = await fetch(

        `http://localhost:3000/api/services/${id}`,

        {

            method:"DELETE",

            headers:{

                "Authorization":
                "Bearer " + token

            }

        }

    );



    const data =
    await response.json();



    if(response.ok){

        alert(data.message);

        loadServices();

    }
    else{

        alert(data.message);

    }


}