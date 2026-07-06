const servicesGrid = document.getElementById("servicesGrid");
const addonsTableBody = document.getElementById("addonsTableBody");

async function loadServices() {

    try{
        const response = await fetch(
            "http://localhost:3000/api/services"
        );

        const services = await response.json();

        servicesGrid.innerHTML = "";
        addonsTableBody.innerHTML = "";

        services.forEach(service => {

            if (service.category === "Add-on Service") {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><strong>${service.service_name}</strong></td>
                    <td>${service.description}</td>
                    <td>₱${service.price}</td>
                `;

                addonsTableBody.appendChild(row);

            } else {

                const card = document.createElement("div");

                card.className = "service-menu-card";

                let icon = "🐾";

                if (service.category === "Bath & Grooming") {
                    icon = "🧼";
                }
                else if (service.category === "Hair Styling") {
                    icon = "✂️";
                }
                else if (service.category === "Treatment") {
                    icon = "🩺";
                }
                else if (service.category === "Spa Package") {
                    icon = "✨";
                }

                card.innerHTML = `
                    <span class="service-icon">${icon}</span>

                    <h3>${service.service_name}</h3>

                    <p><strong>${service.category}</strong></p>

                    <p class="service-price">
                        Starts at ₱${service.price}
                    </p>

                    <p>${service.description}</p>
                `;

                servicesGrid.appendChild(card);

            }

        });
    } catch (error) {
        console.error(error);
        alert("Unable to load services.");
    }

}

loadServices();