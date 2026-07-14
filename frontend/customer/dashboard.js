document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    function handleAuthError(res) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return true;
        }
        return false;
    }

    const petGrid = document.querySelector(".pet-grid");

    // ---------------- OWNER ----------------
    async function loadOwner() {
        try {
            const res = await fetch("http://localhost:3000/api/owners/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (handleAuthError(res)) return;

            if (!res.ok) {
                console.error("Failed to load owner");
                return;
            }

            const owner = await res.json();

            document.querySelector(".owner-name").textContent =
                `${owner.first_name} ${owner.last_name}`;

            document.querySelector(".owner-email").textContent =
                owner.email;

            document.querySelector(".owner-phone").textContent =
                owner.phone_number;

        } catch (err) {
            console.error("Owner error:", err);
        }
    }

    // ---------------- PETS ----------------
    async function loadPets() {
        const res = await fetch("http://localhost:3000/api/pets", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (handleAuthError(res)) return;

        if (!res.ok) return;

        const pets = await res.json();

        petGrid.innerHTML = "";

        pets.forEach(pet => {
            const div = document.createElement("div");
            div.className = "pet-card";

            div.innerHTML = `
                <img src="${pet.photo_url || '../images/default-profile.svg'}">
                <h4>${pet.pet_name}</h4>
                <p>${pet.species}</p>
                <small>${pet.breed}</small>
            `;

            petGrid.appendChild(div);
        });
    }

    loadOwner();
    loadPets();

    const form = document.querySelector(".pet-panel form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pet = {
            pet_name: document.getElementById("pet_name").value,
            species: document.getElementById("species").value,
            breed: document.getElementById("breed").value,
            gender: document.getElementById("gender").value,
            birth_date: document.getElementById("birth_date").value || null,
            weight: document.getElementById("weight").value || null,
            size: document.getElementById("size").value || null
        };

        const res = await fetch("http://localhost:3000/api/pets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(pet)
        });

        if (res.ok) {
            alert("Pet added!");
            form.reset();
            loadPets(); // refresh UI
        } else {
            alert("Failed to add pet");
        }
    });
});