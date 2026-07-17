document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-list a").forEach(link => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    const footer = document.getElementById("footer");

    if (footer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => {
                footer.innerHTML = data;
            });
    }
});

// for back button

const authPages = ["login.html", "registration.html"];

const currentPage = window.location.pathname.split("/").pop();

if (!authPages.includes(currentPage)) {
    sessionStorage.setItem("lastPage", window.location.href);
}

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const lastPage = sessionStorage.getItem("lastPage");

        if (lastPage) {
            window.location.href = lastPage;
        } else {
            window.location.href = "/customer/index.html";
        }
    });
}