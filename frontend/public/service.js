const packagesGrid = document.getElementById("packagesGrid");

const servicesContainer = document.getElementById("servicesContainer");


function renderPackages(packages){

    let html = "";

    packages.forEach(pkg => {

        html += `
        <div class="ticket">

            <div class="ticket-icon">
                <i class="fa-solid fa-paw"></i>
            </div>

            <h3>${pkg.package_name}</h3>

            <p>${pkg.description}</p>

            <div class="ticket-foot">
                <span class="ticket-price">
                    ₱${Number(pkg.package_price).toFixed(2)}
                </span>
            </div>

        </div>
        `;
    });

    packagesGrid.innerHTML = html;

}

function renderServices(services){

    let html = "";

    services.forEach(service => {

        html += `
        <div class="addon-row">

            <div>
                <p class="addon-name">${service.service_name}</p>
                <p class="addon-desc">${service.description}</p>
            </div>

            <span class="addon-price">
                ₱${Number(service.price).toFixed(2)}
            </span>

        </div>
        `;
    });

    servicesContainer.innerHTML = html;

}

async function loadPackages(){

    const response =
    await fetch("http://localhost:3000/api/packages");

    const packages =
    await response.json();

    renderPackages(packages);

}

async function loadServices(){

    const response =
    await fetch("http://localhost:3000/api/services");

    const services =
    await response.json();

    renderServices(services);

}

loadPackages();
loadServices();
