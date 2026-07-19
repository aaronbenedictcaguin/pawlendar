const params = new URLSearchParams(window.location.search);
const selectedDateEl = document.getElementById('selectedDate');
const fullNotice = document.getElementById('fullNotice');
const bookingForm = document.getElementById('bookingForm');
const serviceTime = document.getElementById('serviceTime');
const timeSlot = document.getElementById('timeSlot');
const fullDates = ['2026-06-10', '2026-06-14', '2026-06-25'];

const dateParam = params.get('date');
const bookingDate = dateParam || new Date().toISOString().split('T')[0];

selectedDateEl.textContent = new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
serviceTime.value = timeSlot.value;

const isFull = fullDates.includes(bookingDate);
if (isFull) {
    fullNotice.classList.remove('hidden');
    bookingForm.querySelectorAll('input, select, textarea, button').forEach(el => {
        if (el.id !== 'confirmBooking') el.disabled = true;
    });
    document.getElementById('confirmBooking').disabled = true;
}

bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const query = new URLSearchParams({
        date: bookingDate,
        name: data.get('customerName'),
        service: data.get('serviceType'),
        pet: data.get('petName'),
        email: data.get('emailAddress'),
        time: data.get('serviceTime'),
        notes: data.get('serviceNotes') || ''
    });
    window.location.href = `booking-summary.html?${query.toString()}`;
});

timeSlot.addEventListener('change', () => {
    serviceTime.value = timeSlot.value;
});