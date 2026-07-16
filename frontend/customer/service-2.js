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