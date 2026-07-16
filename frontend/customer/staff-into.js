const fullDates = [
    '2026-06-10',
    '2026-06-14',
    '2026-06-25'
];

const calendarDays = document.querySelectorAll('.calendar-day');

calendarDays.forEach(day => {

    if (day.classList.contains('inactive')) return;

    const numberEl = day.querySelector('.day-number');
    if (!numberEl) return;

    const dayNumber = Number(numberEl.textContent.trim());
    if (!dayNumber) return;

    const dateValue = `2026-06-${String(dayNumber).padStart(2, '0')}`;

    day.classList.add('clickable');

    if (fullDates.includes(dateValue)) {

        day.classList.remove('clickable');
        day.classList.add('full-day');

        const badge = document.createElement('div');
        badge.className = 'day-status';
        badge.textContent = 'FULL';

        day.appendChild(badge);
    }

    day.addEventListener('click', () => {

        if (day.classList.contains('full-day')) {
            alert('This date is fully booked. Please choose another available date.');
            return;
        }

        window.location.href = `date-booking.html?date=${encodeURIComponent(dateValue)}`;

    });

});