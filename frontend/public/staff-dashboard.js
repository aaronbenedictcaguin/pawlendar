const appointments = [
    { id: 'A101', client: 'Mia Santos', service: 'Full Grooming', date: '2026-06-08', time: '09:00 AM', pet: 'Bella', status: 'Pending' },
    { id: 'A102', client: 'Kyle Reyes', service: 'Bath & Brush Essential', date: '2026-06-08', time: '11:00 AM', pet: 'Milo', status: 'Confirmed' },
    { id: 'A103', client: 'Anna Cruz', service: 'Haircut', date: '2026-06-09', time: '02:00 PM', pet: 'Chico', status: 'Pending' },
    { id: 'A104', client: 'Jess Castillo', service: 'Nail Trim', date: '2026-06-10', time: '10:00 AM', pet: 'Coco', status: 'Confirmed' },
    { id: 'A105', client: 'Daniel Ortiz', service: 'Full Grooming', date: '2026-06-10', time: '03:00 PM', pet: 'Luna', status: 'Confirmed' }
];

const todayCount = document.getElementById('todayCount');
const weekCount = document.getElementById('weekCount');
const monthCount = document.getElementById('monthCount');
const overviewList = document.getElementById('overviewList');
const dashboardView = document.getElementById('dashboardView');
const dashboardDate = document.getElementById('dashboardDate');

const loadOverview = () => {
    const selectedDate = dashboardDate.value || new Date().toISOString().slice(0, 10);
    const filtered = appointments.filter(a => a.date === selectedDate);
    overviewList.innerHTML = filtered.length === 0 ? '<p class="empty-text">No appointments for this date.</p>' : filtered.map(a => `
                <div class="overview-card ${a.status === 'Confirmed' ? 'confirmed' : ''}">
                    <div class="overview-left">
                        <strong>${a.client}</strong>
                        <span>${a.pet} • ${a.service}</span>
                    </div>
                    <div class="overview-right">
                        <span>${a.date} • ${a.time}</span>
                        <span>Status: ${a.status}</span>
                        <a href="booking-summary.html?date=${encodeURIComponent(a.date)}&name=${encodeURIComponent(a.client)}&service=${encodeURIComponent(a.service)}&pet=${encodeURIComponent(a.pet)}&email=${encodeURIComponent(a.client.replace(' ', '.').toLowerCase() + '@mail.com')}&time=${encodeURIComponent(a.time)}&notes=${encodeURIComponent('Confirmed via dashboard')}" class="small-btn">View</a>
                    </div>
                </div>
            `).join('');

    todayCount.textContent = appointments.filter(a => a.date === selectedDate).length;
    weekCount.textContent = appointments.length;
    monthCount.textContent = appointments.length;
};

document.getElementById('refreshDashboard').addEventListener('click', loadOverview);
document.getElementById('addAppointmentBtn').addEventListener('click', () => {
    window.location.href = 'booking-summary.html';
});
dashboardDate.value = new Date().toISOString().split('T')[0];
loadOverview();