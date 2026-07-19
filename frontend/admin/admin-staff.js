const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("../public/login.html");
}

let groomers = [];

loadGroomers();

async function loadGroomers() {

    const response = await fetch(
        "/api/admin/groomers",
        {
            headers: {
                Authorization: "Bearer " + token
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {

        alert(data.message);

        return;
    }

    groomers = data;

    document.getElementById("app").style.display = "block";

    displayGroomers(groomers);

}

function displayGroomers(list){

    const table =
    document.getElementById("staffTableBody");

    let html = "";

    list.forEach(staff=>{

        html +=`

        <tr>

        <td>${staff.staff_id}</td>

        <td>

        ${staff.first_name}
        ${staff.last_name}

        </td>

        <td>${staff.specialization}</td>

        <td>${staff.phone_number}</td>

        <td>${staff.email ?? "-"}</td>

        <td>

        <button
        onclick="viewStaff(${staff.staff_id})">

        View

        </button>

        </td>

        </tr>

        `;

    });

    table.innerHTML = html;

}

async function viewStaff(id){

    const response =
    await fetch(
        `/api/admin/groomers/${id}`,
        {
            headers:{
                Authorization:"Bearer "+token
            }
        }
    );

    const staff =
    await response.json();

    if(!response.ok){

        alert(staff.message);

        return;

    }

    const availabilityResponse =
    await fetch(
        `/api/admin/groomers/${id}/availability`,
        {
            headers:{
                Authorization:"Bearer "+token
            }
        }
    );

    const availability =
    await availabilityResponse.json();

    let availabilityHTML="";

    availability.forEach(slot=>{

        availabilityHTML+=`

        <tr>

        <td>${slot.day_of_week}</td>

        <td>${slot.start_time}</td>

        <td>${slot.end_time}</td>

        </tr>

        `;

    });

    document
    .getElementById("staffDetails")
    .style.display="block";

    document
    .getElementById("detailsContainer")
    .innerHTML=`

    <h3>

    ${staff.first_name}
    ${staff.last_name}

    </h3>

    <p>

    <strong>Email:</strong>

    ${staff.email}

    </p>

    <p>

    <strong>Phone:</strong>

    ${staff.phone_number}

    </p>

    <p>

    <strong>Specialization:</strong>

    ${staff.specialization}

    </p>

    <p>

    <strong>Hire Date:</strong>

    ${new Date(staff.hire_date).toLocaleDateString()}

    </p>

    <hr>

    <h3>

    Weekly Availability

    </h3>

    <table class="appointment-table">

    <thead>

    <tr>

    <th>Day</th>
    <th>Start</th>
    <th>End</th>

    </tr>

    </thead>

    <tbody>

    ${availabilityHTML}

    </tbody>

    </table>

    <br>

    <button onclick="editStaff(${staff.staff_id})">

    Edit Groomer

    </button>

    <button onclick="deleteStaff(${staff.staff_id})">

    Delete Groomer

    </button>

    `;

}

document
.getElementById("searchInput")
.addEventListener("input",function(){

    const value =
    this.value.toLowerCase();

    const filtered =
    groomers.filter(g=>

        (`${g.first_name} ${g.last_name}`)
        .toLowerCase()
        .includes(value)

    );

    displayGroomers(filtered);

});

const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link=>{

    if(link.getAttribute("href")==currentPage){

        link.classList.add("active");

    }

});

document.getElementById("logoutBtn")
.addEventListener("click",e=>{

    e.preventDefault();

    localStorage.removeItem("token");

    window.location.href="../public/login.html";

});