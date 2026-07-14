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

    const petList = document.querySelector(".pet-list");

    // ---------- OWNER ----------

    async function loadOwner() {

        try {

            const res = await fetch("http://localhost:3000/api/owners/me", {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (handleAuthError(res)) return;

            if (!res.ok) return;

            const owner = await res.json();

            document.querySelector(".owner-name").textContent =
                `${owner.first_name} ${owner.last_name}`;

            document.querySelector(".owner-email").textContent =
                owner.email;

            document.querySelector(".owner-phone").textContent =
                owner.phone_number;

        }

        catch (err) {

            console.error(err);

        }

    }

    // ---------- PETS ----------

    async function loadPets() {

        try {

            const res = await fetch("http://localhost:3000/api/pets", {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (handleAuthError(res)) return;

            if (!res.ok) return;

            const pets = await res.json();

            petList.innerHTML = "";

            pets.forEach(pet => {

                const card = document.createElement("div");

                card.className = "pet-card";

                card.innerHTML = `
                        <img src="${pet.photo_url || "../images/default-profile.svg"}">
                `;

                petList.appendChild(card);

            });

        }

        catch (err) {

            console.error(err);

        }

    }

    loadOwner();
    loadPets();

});