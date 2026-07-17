const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

fetch("/api/auth/profile", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
.then(async response => {
    if (!response.ok) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    // Token is valid.
})
.catch(() => {
    window.location.href = "login.html";
});

const params = new URLSearchParams(window.location.search);
const petId = params.get("pet_id");

async function loadOwner() {

    const res = await fetch("/api/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) return;

    const owner = await res.json();

    document.getElementById("ownerName").textContent =
        owner.first_name + " " + owner.last_name;

    document.getElementById("ownerEmail").textContent =
        owner.email;

    document.getElementById("ownerPhone").textContent =
        owner.phone_number;
}

async function loadPet() {

    const res = await fetch(
        `/api/pets/${petId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) return;

    const pet = await res.json();

    document.getElementById("petName").textContent =
        pet.pet_name;

    document.getElementById("petSpecies").textContent =
        pet.species;

    document.getElementById("petBreed").textContent =
        pet.breed;

    document.getElementById("petSize").textContent =
        pet.size;
}

let services = [];

async function loadServices() {
    
    const res = await fetch(
        "/api/services"
    );

    if (!res.ok) return;
    
    services = await res.json();
    
    const list = document.getElementById("serviceList");

    list.innerHTML = "";

    services.forEach(service => {

        list.innerHTML += `

        <label>

            <span>
                ${service.service_name}
            </span>

            <span>
                ₱${service.price}
            </span>

            <input
                type="checkbox"
                value="${service.service_id}"
                data-price="${service.price}"
                data-duration="${service.duration_minutes}"
            >

        </label>

        `;
    });

    addServiceListeners();
}

function addServiceListeners() {

    const checkboxes =
        document.querySelectorAll("#serviceList input");

    checkboxes.forEach(box => {

        box.addEventListener("change", calculateSummary);

    });

}

function calculateSummary() {

    let total = 0;

    let duration = 0;

    document
        .querySelectorAll("#serviceList input:checked")
        .forEach(box => {

            total += Number(box.dataset.price);

            duration += Number(box.dataset.duration);

        });

    document.getElementById("totalPrice").textContent =
        total;

    document.getElementById("duration").textContent =
        duration + " mins";
}

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedServices = [...document.querySelectorAll("#serviceList input:checked")]
        .map(cb => Number(cb.value));

    if (selectedServices.length === 0) {
        alert("Please select at least one service.");
        return;
    }

    const appointment = {
        pet_id: Number(petId),
        start_datetime:
            `${document.getElementById("appointment_date").value}T${document.getElementById("appointment_time").value}:00`,
        notes: document.getElementById("notes").value,
        service_ids: [...document.querySelectorAll("#serviceList input:checked")]
            .map(cb => Number(cb.value)),
        staff_id: null
    };

    const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(appointment)
    });
   
    if (!res.ok) {
        const error = await res.json();
        console.log(error);
        alert(error.message || "Failed to book appointment.");
        return;
    }

    alert("Appointment booked successfully!");

    // Redirect back to dashboard
    window.location.href = "dashboard.html";
});

loadOwner();
loadPet();
loadServices();