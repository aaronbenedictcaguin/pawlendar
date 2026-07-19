document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/admin";
        return;
    }

    document.getElementById("app").style.display = "block";

    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("id");

    if (!serviceId) {
        alert("No service selected.");
        window.location.href = "admin-services.html";
        return;
    }

    const form = document.getElementById("serviceForm");

    const serviceNameInput = document.getElementById("service_name");
    const categoryInput = document.getElementById("category");
    const descriptionInput = document.getElementById("description");
    const priceInput = document.getElementById("price");
    const durationInput = document.getElementById("duration_minutes");

    // Load existing service
    async function loadService() {

        try {

            const response = await fetch(
                `/api/services/${serviceId}`
            );

            const service = await response.json();

            if (!response.ok) {
                alert(service.message || "Failed to load service.");
                window.location.href = "admin-services.html";
                return;
            }

            serviceNameInput.value = service.service_name;
            categoryInput.value = service.category;
            descriptionInput.value = service.description;
            priceInput.value = service.price;
            durationInput.value = service.duration_minutes;

        }
        catch (err) {

            console.error(err);
            alert("Failed loading service.");

        }

    }

    await loadService();

    // Update service
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const updatedService = {

            service_name: serviceNameInput.value.trim(),

            category: categoryInput.value,

            description: descriptionInput.value.trim(),

            price: Number(priceInput.value),

            duration_minutes: Number(durationInput.value)

        };

        try {

            const response = await fetch(

                `/api/services/${serviceId}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify(updatedService)

                }

            );

            const data = await response.json();

            if (response.ok) {

                alert("Service updated successfully!");

                window.location.href = "admin-services.html";

            }
            else {

                alert(data.message || data.error);

            }

        }
        catch (err) {

            console.error(err);
            alert("Server connection failed.");

        }

    });

});