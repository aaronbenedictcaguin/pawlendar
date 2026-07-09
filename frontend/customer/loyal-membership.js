document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const levelEl = document.getElementById("level");
  const discountEl = document.getElementById("discount");
  const appointmentsEl = document.getElementById("appointments");
  const nextLevelEl = document.getElementById("next-level");
  const progressTextEl = document.getElementById("progress-text");
  const progressBarEl = document.getElementById("progress-bar");

  try {
    const res = await fetch("http://localhost:3000/api/loyalty/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Unable to load loyalty data");
    }

    const data = await res.json();
    const completed = Number(data.completed_appointments || 0);
    const target = data.loyalty_level === "Gold" ? 6 : data.loyalty_level === "Silver" ? 6 : 3;
    const progress = Math.min(100, Math.round((completed / target) * 100));

    levelEl.textContent = data.loyalty_level || "Bronze";
    discountEl.textContent = `${data.discount_percent || 5}% off`;
    appointmentsEl.textContent = completed;
    nextLevelEl.textContent = data.next_level ? `Next tier: ${data.next_level}` : "You have reached the top tier";
    progressTextEl.textContent = `${progress}%`;
    progressBarEl.style.width = `${progress}%`;
  } catch (error) {
    console.error(error);
    levelEl.textContent = "Bronze";
    discountEl.textContent = "5% off";
    appointmentsEl.textContent = "0";
    nextLevelEl.textContent = "Next tier: Silver";
    progressTextEl.textContent = "0%";
    progressBarEl.style.width = "0%";
  }
});
