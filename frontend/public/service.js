const servicesGrid = document.getElementById("servicesGrid");
const addonsContainer = document.getElementById("addonsContainer");

// Displayed whenever the API is unavailable or the database has no active services yet.
const fallbackServices = [
    {
        service_name: "Bath & Brush Essential",
        category: "Bath & Grooming",
        description: "A gentle bath, blow-dry, thorough brushing, ear cleaning, and finishing spritz.",
        price: 450,
        duration_minutes: 60,
        image_url: "../images/golden.jpg"
    },
    {
        service_name: "Signature Haircut",
        category: "Hair Styling",
        description: "A breed-appropriate or custom haircut finished by one of our professional groomers.",
        price: 650,
        duration_minutes: 90,
        image_url: "../images/koby.jpg"
    },
    {
        service_name: "Skin & Coat Care",
        category: "Treatment",
        description: "Targeted coat care using gentle products for dry, sensitive, or irritated skin.",
        price: 550,
        duration_minutes: 75,
        image_url: "../images/trixie.jpg"
    },
    {
        service_name: "Full Grooming Spa",
        category: "Spa Package",
        description: "The complete experience: bath, haircut, nail care, ear cleaning, brushing, and spa finish.",
        price: 950,
        duration_minutes: 120,
        image_url: "../images/golden.jpg"
    },
    {
        service_name: "Nail Trim",
        category: "Add-on Service",
        description: "Careful nail trimming and smoothing for comfortable paws.",
        price: 150,
        duration_minutes: 15
    },
    {
        service_name: "Teeth Brushing",
        category: "Add-on Service",
        description: "A gentle brushing treatment to help freshen your pet's breath.",
        price: 120,
        duration_minutes: 10
    },
    {
        service_name: "Paw Balm Treatment",
        category: "Add-on Service",
        description: "Moisturizing balm for dry paw pads and a softer, protected finish.",
        price: 100,
        duration_minutes: 10
    }
];

const serviceIcons = {
    "Bath & Grooming": "🫧",
    "Hair Styling": "✂️",
    "Treatment": "🩹",
    "Spa Package": "✨"
};

const categoryImages = {
    "Bath & Grooming": "../images/golden.jpg",
    "Hair Styling": "../images/koby.jpg",
    "Treatment": "../images/trixie.jpg",
    "Spa Package": "../images/golden.jpg"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function renderServices(services) {
    servicesGrid.innerHTML = "";
    addonsContainer.innerHTML = "";

    services.forEach(service => {
        if (service.category === "Add-on Service" || service.category === "Alacarte/Add-on Service") { 
            const addon = document.createElement("div");
            addon.className = "addon-row";

            addon.innerHTML = `
                <div>
                    <p class="addon-name">${escapeHtml(service.service_name)}</p>
                    <p class="addon-desc">${escapeHtml(service.description)}</p>
                </div>

                <span class="addon-price">
                    ₱${formatPrice(service.price)}
                </span>
            `;

            addonsContainer.appendChild(addon);
            return;
        }

        const card = document.createElement("div");
        card.className = "ticket";

        card.innerHTML = `
            <div class="ticket-icon">
                🐾
            </div>

            <h3>${escapeHtml(service.service_name)}</h3>

            <p>${escapeHtml(service.description)}</p>

            <div class="ticket-foot">
                <span class="ticket-price">
                    <small>Starts at</small>
                    ₱${formatPrice(service.price)}
                </span>

                <span class="ticket-time">
                    ${service.duration_minutes} MIN
                </span>
            </div>
        `;
        servicesGrid.appendChild(card);
    });

    if (!servicesGrid.children.length) {
        servicesGrid.innerHTML = '<p class="services-empty">Main grooming services will be available soon.</p>';
    }

    if (!addonsContainer.children.length) {
        addonsContainer.innerHTML = '<p class="addons-empty">Add-on treatments will be available soon.</p>';
    }
}

async function loadServices() {
    // Render immediately so the page always contains useful service information.
    renderServices(fallbackServices);

    try {
        const response = await fetch("/api/services");
        if (!response.ok) {
            throw new Error(`Services API returned ${response.status}`);
        }

        const services = await response.json();
        if (Array.isArray(services) && services.length > 0) {
            renderServices(services);
        }
    } catch (error) {
        console.warn("Using the built-in service catalog:", error.message);
    }
}

loadServices();
