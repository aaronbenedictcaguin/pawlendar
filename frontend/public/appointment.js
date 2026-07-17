let selectedPet = null;

function selectPet(card) {
    document.querySelectorAll(".pet-card").forEach(item => {
        item.classList.remove("selected");
    });

    card.classList.add("selected");

    selectedPet = card.querySelector("h3").innerText;

    const button = document.getElementById("continueBtn");

    button.disabled = false;
    button.classList.add("enabled");
}

document.getElementById("continueBtn").addEventListener("click", () => {
    if(selectedPet){
        console.log("Selected pet:", selectedPet);
    }
});