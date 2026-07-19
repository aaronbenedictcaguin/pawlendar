const packageId =
    new URLSearchParams(window.location.search)
        .get("id");

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "http://localhost:3000/admin";
        return;
    }

    document.getElementById("app").style.display = "block";

    await loadServices();
    await loadPackage();

    document
        .getElementById("package_price")
        .addEventListener(
            "input",
            updateDuration
        );

    document
        .getElementById("packageForm")
        .addEventListener("submit", submitPackage);

});


async function loadServices() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/services"
        );

        const services = await response.json();

        const container =
            document.getElementById("serviceList");

        let html = "";

        services.forEach(service => {

            html += `

            <label class="service-item">

                <input
                    type="checkbox"
                    value="${service.service_id}"
                    data-duration="${service.duration_minutes}"
                    data-price="${service.price}">

                <div class="service-info">

                    <span class="service-name">
                        ${service.service_name}
                    </span>

                    <span class="service-details">
                        ${service.category}
                        • ₱${service.price}
                        • ${service.duration_minutes} mins
                    </span>

                </div>

            </label>
            `;

        });

        container.innerHTML = html;
        const search = document.getElementById("serviceSearch");

        search.addEventListener("input", () => {

            const keyword = search.value.toLowerCase();

            document
                .querySelectorAll(".service-item")
                .forEach(item => {

                    item.style.display =
                        item.innerText
                            .toLowerCase()
                            .includes(keyword)
                        ? "flex"
                        : "none";

                });

        });
        document
        .querySelectorAll("#serviceList input")
        .forEach(box => {

            box.addEventListener("change", updateDuration);

        });

    }
    catch (err) {

        alert("Unable to load services.");

    }

}

function updateDuration() {

    let totalDuration = 0;
    let totalPrice = 0;
    let selected = 0;

    document
        .querySelectorAll("#serviceList input:checked")
        .forEach(box => {

            selected++;

            totalDuration += Number(box.dataset.duration);

            totalPrice += Number(box.dataset.price);

        });

    document.getElementById("packageDuration").textContent =
        `${totalDuration} minutes`;

    document.getElementById("summaryDuration").textContent =
        `${totalDuration} mins`;

    document.getElementById("selectedCount").textContent =
        selected;

    document.getElementById("serviceTotal").textContent =
        `₱${totalPrice.toFixed(2)}`;

    const packagePrice =
        Number(document.getElementById("package_price").value) || 0;

    const savings =
        Math.max(0, totalPrice - packagePrice);

    document.getElementById("packageSavings").textContent =
        `₱${savings.toFixed(2)}`;

    const saveButton =
        document.getElementById("savePackageBtn");

    saveButton.disabled =
        selected === 0;

}


async function submitPackage(e) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "http://localhost:3000/admin";
        return;

    }

    const selectedServices = [];

    document
        .querySelectorAll("#serviceList input:checked")
        .forEach(box => {

            selectedServices.push(Number(box.value));

        });

    const packageData = {

        package_name:
            document.getElementById("package_name").value.trim(),

        description:
            document.getElementById("description").value.trim(),

        package_price:
            Number(document.getElementById("package_price").value),

        service_ids:
            selectedServices

    };

    try {

        const response = await fetch(
            `http://localhost:3000/api/packages/${packageId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify(packageData)

            }
        );

        const data = await response.json();

        if (response.ok) {

            alert(data.message);

            window.location.href = "admin-services.html";

        }
        else {

            alert(data.message || data.error);

        }

    }
    catch (err) {

        alert("Server connection failed.");

    }

}

async function loadPackage(){

    const token = localStorage.getItem("token");

    const response = await fetch(

        `http://localhost:3000/api/packages/${packageId}`,

        {

            headers:{
                Authorization:`Bearer ${token}`
            }

        }

    );

    const pkg = await response.json();

    document.getElementById("package_name").value =
        pkg.package_name;

    document.getElementById("description").value =
        pkg.description;

    document.getElementById("package_price").value =
        pkg.package_price;
    
    pkg.services.forEach(service=>{

        const checkbox = document.querySelector(

            `input[value="${service.service_id}"]`

        );

        if(checkbox){

            checkbox.checked = true;

        }

    });

    updateDuration();

}