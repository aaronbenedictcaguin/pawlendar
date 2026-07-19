const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../public/login.html";
}

fetch("/api/auth/profile", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
.then(async response => {
    if (!response.ok) {
        localStorage.removeItem("token");
        window.location.href = "../public/login.html";
        return;
    }

    // Token is valid.
})
.catch(() => {
    window.location.href = "../public/login.html";
});

const params = new URLSearchParams(window.location.search);
const petId = params.get("pet_id");
let selectedSlot = null;

function showOtherPet() {
    const petType = document.getElementById("petType").value;
    const otherPetGroup = document.getElementById("otherPetGroup");

    if (petType === "Other") {
        otherPetGroup.style.display = "block";
    } else {
        otherPetGroup.style.display = "none";
        document.getElementById("otherPet").value = "";
    }
}

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

        box.addEventListener("change", ()=>{

        calculateSummary();

        loadAvailableSlots();

});

    });

}

let packages = [];


async function loadPackages(){

    const res = await fetch(
        "/api/packages"
    );


    if(!res.ok) return;


    packages = await res.json();


    const list =
        document.getElementById("packageList");


    list.innerHTML="";


    packages.forEach(pkg=>{


        list.innerHTML += `

        <label>

            <span>
                ${pkg.package_name}
            </span>


            <span>
                ₱${pkg.package_price}
            </span>


            <input 
            type="checkbox"
            value="${pkg.package_id}"
            data-price="${pkg.package_price}"
            data-duration="${pkg.package_duration_minutes}"
            >

        </label>


        `;


    });


    addPackageListeners();

}

function addPackageListeners(){

    const packageInputs =
        document.querySelectorAll("#packageList input");


    packageInputs.forEach(pkg=>{

        pkg.addEventListener(
            "change",
            ()=>{

                calculateSummary();

                loadAvailableSlots();

            }
        );

    });

}

function calculateSummary(){

    let total = 0;

    let duration = 0;

    selectedSlot = null;

    document.getElementById("slotContainer").innerHTML =
    "<p>Select a date to see available slots.</p>";


    // selected package
    document
    .querySelectorAll("#packageList input:checked")
    .forEach(pkg=>{

        total += Number(pkg.dataset.price);

        duration += Number(pkg.dataset.duration);

    });


    // selected services
    document
    .querySelectorAll("#serviceList input:checked")
    .forEach(box=>{

        total += Number(box.dataset.price);

        duration += Number(box.dataset.duration);

    });



    document.getElementById("totalPrice")
        .textContent = total;


    const durationElement = document.getElementById("duration");

    durationElement.textContent = duration + " mins";

    durationElement.dataset.duration = duration;

    const dateInput = document.getElementById("appointment_date");

    if(duration > 0){
        dateInput.disabled = false;
    }
    else{
        dateInput.disabled = true;
        document.getElementById("slotContainer").innerHTML =
        "<p>Select a package or service first.</p>";
    }

}


async function loadAvailableSlots(){

    const date =
    document.getElementById(
        "appointment_date"
    ).value;


    const duration =
    document.getElementById(
        "duration"
    ).dataset.duration;



    if(!date || !duration){
        return;
    }



    const res = await fetch(

        `/api/appointments/available-slots?date=${date}&duration=${duration}`,

        {
            headers:{
                Authorization:
                `Bearer ${token}`
            }
        }

    );


    const slots =
    await res.json();



    const container =
    document.getElementById(
        "slotContainer"
    );


    container.innerHTML="";



    if(slots.length===0){

        container.innerHTML =
        "<p>No available slots.</p>";

        return;

    }



    slots.forEach(slot=>{


        const btn =
        document.createElement("button");


        btn.type="button";

        btn.className="slot-btn";


        btn.textContent =
        slot.time;



        btn.onclick=()=>{


            document
            .querySelectorAll(".slot-btn")
            .forEach(b=>
                b.classList.remove("selected")
            );


            btn.classList.add("selected");


            selectedSlot =
            slot.start_datetime;


        };



        container.appendChild(btn);


    });

}

document
.getElementById("appointment_date")
.addEventListener(
"change",
loadAvailableSlots
);

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedServices = [
        ...document.querySelectorAll("#serviceList input:checked")
    ]
    .map(cb => Number(cb.value));


    const selectedPackages = [
        ...document.querySelectorAll("#packageList input:checked")
    ].map(pkg => Number(pkg.value));


    if (
        selectedServices.length === 0 &&
        selectedPackages.length === 0
    ) {
        alert("Please select at least one package or service.");
        return;
    }


    if(!selectedSlot){

        alert("Please select an available time slot.");
        return;

    }


    const appointment = {

        pet_id:Number(petId),

        start_datetime:selectedSlot,

        notes:
        document.getElementById("notes").value,


        service_ids:selectedServices,


        package_ids: selectedPackages,


        staff_id:null
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
    window.location.href = "dashboard-dev.html";
});



loadOwner();
loadPet();
loadServices();
loadPackages();