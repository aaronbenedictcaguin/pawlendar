document.addEventListener("DOMContentLoaded",()=>{


    const token = localStorage.getItem("token");


    if(!token){

        window.location.href="http://localhost:3000/admin";
        return;

    }


    document.getElementById("app").style.display="block";


    const form = document.getElementById("serviceForm");

    form.addEventListener("submit", async(e)=>{

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


        if(!token){

            alert("Please login again.");

            window.location.href="http://localhost:3000/admin";

        }



        try{


            const response = await fetch(
                "http://localhost:3000/api/services",
                {

                    method:"POST",

                    headers:{

                        "Content-Type":"application/json",

                        Authorization:`Bearer ${token}`

                    },

                    body:JSON.stringify(service)

                }
            );



            const data = await response.json();



            if(response.ok){

                alert("Service added successfully!");

                form.reset();

            }
            else{

                alert(
                    data.message ||
                    "Failed to create service"
                );

            }



        }
        catch(err){

            console.error(err);

            alert("Server connection failed.");

        }


    });


});
