const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById(
            "confirm_password"
        ).value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const response = await fetch(
            "/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    first_name:
                        document.getElementById("first_name").value,

                    last_name:
                        document.getElementById("last_name").value,

                    email:
                        document.getElementById("email").value,

                    phone_number:
                        document.getElementById("phone_number").value,

                    password
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Registration successful");

        window.location.href =
            "login.html";
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
});