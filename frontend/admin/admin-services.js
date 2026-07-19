const token = localStorage.getItem("token");

let showArchivedServices = false;
let showArchivedPackages = false;

document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        window.location.replace("../public/login.html");
        return;
    }

    loadServices();
    loadPackages();

    document.getElementById("serviceArchiveToggle")
        .addEventListener("change", (e) => {

            showArchivedServices = e.target.checked;

            document.getElementById("serviceToggleText").textContent =
                showArchivedServices
                    ? "Showing All Services"
                    : "Showing Active Services";

            loadServices();
        });

    document.getElementById("packageArchiveToggle")
        .addEventListener("change", (e) => {

            showArchivedPackages = e.target.checked;

            document.getElementById("packageToggleText").textContent =
                showArchivedPackages
                    ? "Showing All Packages"
                    : "Showing Active Packages";

            loadPackages();
        });

    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const confirmed = confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        localStorage.removeItem("token");

        // remove anything else you may store later
        localStorage.removeItem("owner");
        localStorage.removeItem("admin");

        window.location.href = "../public/login.html";

    });

});

async function loadServices(){

    const url = showArchivedServices

        ? "/api/services/admin/all"

        : "/api/services";

    const response = await fetch(
        url,
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

    const serviceCount =
        document.getElementById("serviceCount");

    serviceCount.textContent =
        `${services.length} Service${services.length !== 1 ? "s" : ""}`;

    let html = "";

    services.forEach(service => {

        let actions = "";

        // Showing only ACTIVE services
        if (!showArchivedServices) {

            actions = `

                <button
                    class="edit-btn"
                    onclick="editService(${service.service_id})">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteService(${service.service_id})">

                    Delete

                </button>

            `;

        }

        // Showing ALL services (active + archived)
        else {

            if (Number(service.active_flag) === 1) {

                actions = `

                    <button
                        class="edit-btn"
                        onclick="editService(${service.service_id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteService(${service.service_id})">

                        Delete

                    </button>

                `;

            } else {

                actions = `

                    <button
                        class="restore-btn"
                        onclick="restoreService(${service.service_id})">

                        Restore

                    </button>

                `;

            }

        }

        html += `

        <tr>

            <td>${service.service_id}</td>

            <td>${service.service_name}</td>

            <td>${service.category}</td>

            <td>${service.description}</td>

            <td>₱${service.price}</td>

            <td>${service.duration_minutes} mins</td>

            <td>

                ${actions}

            </td>

        </tr>

        `;

    });

    table.innerHTML = html;

}




function editService(id){

    window.location.href =
    `service-form-edit.html?id=${id}`;

}




async function deleteService(id){


    if(!confirm("Delete this service?"))
        return;



    const response = await fetch(

        `/api/services/${id}`,

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

async function restoreService(id){

    if(!confirm("Restore this service?"))
        return;

    const response = await fetch(

        `/api/services/${id}/restore`,

        {

            method:"PUT",

            headers:{

                Authorization:`Bearer ${token}`

            }

        }

    );

    const data = await response.json();

    alert(data.message);

    loadServices();

}

async function loadPackages() {

    const url = showArchivedPackages

        ? "/api/packages/admin/all"

        : "/api/packages";


    const response = await fetch(
        url,
        {
            headers:{
                "Authorization":
                "Bearer " + token
            }
        }
    );

    const packages = await response.json();

    if (!response.ok) {

        alert("Failed loading packages");
        return;

    }

    displayPackages(packages);

}

function displayPackages(packages) {

    const table =
        document.getElementById("packageTable");

    const count =
        document.getElementById("packageCount");

    count.textContent =
        `${packages.length} Package${packages.length !== 1 ? "s" : ""}`;

    let html = "";

    packages.forEach(pkg => {

        let actions = "";

        if (!showArchivedPackages) {

            actions = `

                <button
                class="edit-btn"
                onclick="editPackage(${pkg.package_id})">

                Edit

                </button>

                <button
                class="delete-btn"
                onclick="deletePackage(${pkg.package_id})">

                Delete

                </button>

            `;

        } else {

            actions = Number(pkg.active_flag) === 1

            ? `

                <button
                class="edit-btn"
                onclick="editPackage(${pkg.package_id})">

                Edit

                </button>

                <button
                class="delete-btn"
                onclick="deletePackage(${pkg.package_id})">

                Delete

                </button>

            `

            : `

                <button
                class="restore-btn"
                onclick="restorePackage(${pkg.package_id})">

                Restore

                </button>

            `;
        }

        html += `

        <tr>

            <td>${pkg.package_id}</td>

            <td>${pkg.package_name}</td>

            <td>${pkg.description}</td>

            <td>₱${pkg.package_price}</td>

            <td>${pkg.package_duration_minutes} mins</td>

            <td>

                ${actions}

            </td>

        </tr>

        `;

    });

    table.innerHTML = html;

}

function editPackage(id) {

    window.location.href =
        `package-form-edit.html?id=${id}`;

}

async function deletePackage(id){

    if (!confirm("Archive this package?")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/packages/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert(data.message);
            loadPackages();

        } else {

            alert(data.message || "Failed to archive package.");

        }

    } catch (err) {

        alert("Server connection failed.");

    }

}

async function restorePackage(id){

    if(!confirm("Restore this package?"))
        return;

    const response = await fetch(

        `/api/packages/${id}/restore`,

        {

            method:"PUT",

            headers:{

                Authorization:`Bearer ${token}`

            }

        }

    );

    const data = await response.json();

    alert(data.message);

    loadPackages();

}

// Highlight current navbar page
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-list a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});
