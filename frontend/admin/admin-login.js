document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const res = await fetch(
            "/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data = await res.json();


        if (!res.ok) {
            alert(data.message);
            return;
        }


        // Check if account is admin
        if (data.user.role !== "Admin") {
            alert("This account is not an admin.");
            return;
        }


        localStorage.setItem(
            "token",
            data.token
        );


        window.location.href =
            "admin-dashboard.html";

    });