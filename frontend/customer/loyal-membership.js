document.addEventListener("DOMContentLoaded", async () => {
  // Change this to true when the loyalty API and authentication are ready.
  const backendReady = false;
  const token = localStorage.getItem("token");

  if (!token && backendReady) {
    window.location.href = "login.html";
    return;
  }

  const levelEl = document.getElementById("level");
  const discountEl = document.getElementById("discount");
  const appointmentsEl = document.getElementById("appointments");
  const nextLevelEl = document.getElementById("next-level");
  const progressTextEl = document.getElementById("progress-text");
  const progressBarEl = document.getElementById("progress-bar");

  const showLoyaltyData = (data) => {
    const completed = Number(data.completed_appointments || 0);
    const target = data.loyalty_level === "Gold" ? 6 : data.loyalty_level === "Silver" ? 6 : 3;
    const progress = Math.min(100, Math.round((completed / target) * 100));

    levelEl.textContent = data.loyalty_level || "Bronze";
    discountEl.textContent = `${data.discount_percent || 5}% off`;
    appointmentsEl.textContent = completed;
    nextLevelEl.textContent = data.next_level ? `Next tier: ${data.next_level}` : "You have reached the top tier";
    progressTextEl.textContent = `${progress}%`;
    progressBarEl.style.width = `${progress}%`;

    document.querySelectorAll("[data-tier]").forEach((tierCard) => {
      tierCard.classList.toggle("active-tier", tierCard.dataset.tier === data.loyalty_level);
    });
  };

  if (!backendReady) {
    showLoyaltyData({
      loyalty_level: "Silver",
      discount_percent: 10,
      completed_appointments: 4,
      next_level: "Gold"
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/loyalty/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Unable to load loyalty data");
    }

    const data = await res.json();
    showLoyaltyData(data);
  } catch (error) {
    console.error(error);
    showLoyaltyData({
      loyalty_level: "Bronze",
      discount_percent: 5,
      completed_appointments: 0,
      next_level: "Silver"
    });
  }
});
