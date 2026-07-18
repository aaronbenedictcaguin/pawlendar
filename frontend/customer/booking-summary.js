const priceMap = {
    'Bath & Brush Essential': 450,
    'Haircut': 650,
    'Full Grooming': 950,
    'Nail Trim': 250
};

const params = new URLSearchParams(window.location.search);
const summaryName = document.getElementById('summaryName');
const summaryEmail = document.getElementById('summaryEmail');
const summaryPet = document.getElementById('summaryPet');
const summaryService = document.getElementById('summaryService');
const summaryNotes = document.getElementById('summaryNotes');
const summaryDate = document.getElementById('summaryDate');
const summaryTime = document.getElementById('summaryTime');
const summaryPrice = document.getElementById('summaryPrice');

const booking = {
    date: params.get('date') || 'Not set',
    name: params.get('name') || 'N/A',
    email: params.get('email') || 'N/A',
    pet: params.get('pet') || 'N/A',
    service: params.get('service') || 'N/A',
    time: params.get('time') || 'N/A',
    notes: params.get('notes') || 'None'
};

summaryName.textContent = booking.name;
summaryEmail.textContent = booking.email;
summaryPet.textContent = booking.pet;
summaryService.textContent = booking.service;
summaryNotes.textContent = booking.notes;
summaryDate.textContent = `Date: ${new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
summaryTime.textContent = `Time: ${booking.time}`;
summaryPrice.textContent = `₱${priceMap[booking.service] || 0}`;

document.getElementById('confirmBookingBtn').addEventListener('click', () => {
    alert('Appointment confirmed! Thank you for booking with Pawlendar.');
    window.location.href = 'appointment-list.html';
});