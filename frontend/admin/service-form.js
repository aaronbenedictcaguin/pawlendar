const form = document.getElementById("serviceForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const service = {

        service_name:
            document.getElementById("service_name").value.trim(),

        category:
            document.getElementById("category").value,

        description:
            document.getElementById("description").value.trim(),

        price:
            Number(document.getElementById("price").value),

        duration_minutes:
            Number(document.getElementById("duration_minutes").value)

    };

    const token = localStorage.getItem("token"); 
    if (!token) {
        window.location.href = "/admin";
    }

    try {

        const response = await fetch(
            "/api/services",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(service)
            }
        );

        const data = await response.json();

        if(response.ok){

            alert(data.message);

            form.reset();

        }
        else{

            alert(data.message || data.error);

        }
    } catch (error) {

        alert("Cannot connect to server.");

    }
});



