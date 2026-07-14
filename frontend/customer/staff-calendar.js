const StaffCalendar = (() => {
    const apiBase = '/api';
    const state = {
        currentDate: new Date(),
        currentView: 'month',
        currentGroomer: '',
        appointments: [],
        groomers: []
    };

    const selectors = {
        viewSelect: document.getElementById('calendar-view'),
        dateInput: document.getElementById('calendar-date'),
        groomerSelect: document.getElementById('calendar-groomer'),
        prevBtn: document.getElementById('calendar-prev'),
        nextBtn: document.getElementById('calendar-next'),
        calendarContainer: document.getElementById('calendar-container'),
        loadingIndicator: document.getElementById('calendar-loading'),
        message: document.getElementById('calendar-message')
    };

    const init = () => {
        if (!selectors.calendarContainer) {
            console.warn('Staff calendar container not found.');
            return;
        }

        bindEvents();
        setDefaultDate();
        loadGroomers();
        refreshCalendar();
    };

    const bindEvents = () => {
        selectors.viewSelect?.addEventListener('change', e => {
            state.currentView = e.target.value;
            refreshCalendar();
        });

        selectors.dateInput?.addEventListener('change', e => {
            state.currentDate = new Date(e.target.value);
            refreshCalendar();
        });

        selectors.groomerSelect?.addEventListener('change', e => {
            state.currentGroomer = e.target.value;
            refreshCalendar();
        });

        selectors.prevBtn?.addEventListener('click', () => {
            changeDate(-1);
        });

        selectors.nextBtn?.addEventListener('click', () => {
            changeDate(1);
        });
    };

    const setDefaultDate = () => {
        const today = new Date();
        state.currentDate = today;
        if (selectors.dateInput) {
            selectors.dateInput.value = today.toISOString().slice(0, 10);
        }
    };

    const loadGroomers = async () => {
        try {
            const response = await fetch(`${apiBase}/groomers`);
            if (!response.ok) throw new Error('Failed to load groomers');
            state.groomers = await response.json();
            renderGroomerFilter();
        } catch (error) {
            console.error(error);
        }
    };

    const renderGroomerFilter = () => {
        if (!selectors.groomerSelect) return;
        selectors.groomerSelect.innerHTML = '<option value="">All groomers</option>' +
            state.groomers.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    };

    const changeDate = offset => {
        const date = new Date(state.currentDate);
        if (state.currentView === 'day') {
            date.setDate(date.getDate() + offset);
        } else if (state.currentView === 'week') {
            date.setDate(date.getDate() + offset * 7);
        } else {
            date.setMonth(date.getMonth() + offset);
        }
        state.currentDate = date;
        if (selectors.dateInput) {
            selectors.dateInput.value = date.toISOString().slice(0, 10);
        }
        refreshCalendar();
    };

    const refreshCalendar = async () => {
        showLoading(true);
        const range = getViewRange(state.currentView, state.currentDate);
        try {
            const query = new URLSearchParams({
                start: range.start.toISOString(),
                end: range.end.toISOString(),
                groomer: state.currentGroomer || ''
            });
            const response = await fetch(`${apiBase}/appointments?${query.toString()}`);
            if (!response.ok) throw new Error('Unable to load appointments');
            state.appointments = await response.json();
            renderCalendar();
        } catch (error) {
            console.error(error);
            renderMessage('Unable to load appointments. Please try again.');
        } finally {
            showLoading(false);
        }
    };

    const getViewRange = (view, date) => {
        const start = new Date(date);
        const end = new Date(date);

        if (view === 'day') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (view === 'week') {
            const dayOfWeek = start.getDay();
            const monday = new Date(start);
            monday.setDate(start.getDate() - ((dayOfWeek + 6) % 7));
            monday.setHours(0, 0, 0, 0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            return { start: monday, end: sunday };
        } else {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(start.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
        }

        return { start, end };
    };

    const renderCalendar = () => {
        if (!selectors.calendarContainer) return;
        const view = state.currentView;
        let html = '';

        if (view === 'day') {
            html = renderDayView();
        } else if (view === 'week') {
            html = renderWeekView();
        } else {
            html = renderMonthView();
        }

        selectors.calendarContainer.innerHTML = html;
        renderMessage(state.appointments.length === 0 ? 'No appointments found.' : '');
    };

    const renderDayView = () => {
        const day = state.currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        const appointments = filterAppointmentsForDay(state.currentDate);
        return `<div class="calendar-header">${day}</div>` + renderAppointmentList(appointments);
    };

    const renderWeekView = () => {
        const range = getViewRange('week', state.currentDate);
        const title = `${formatDate(range.start)} – ${formatDate(range.end)}`;
        const days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(range.start);
            date.setDate(range.start.getDate() + i);
            const appointments = filterAppointmentsForDay(date);
            days.push(`
                <div class="calendar-week-day">
                    <div class="day-title">${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    ${renderAppointmentList(appointments)}
                </div>
            `);
        }

        return `<div class="calendar-header">${title}</div><div class="calendar-week-grid">${days.join('')}</div>`;
    };

    const renderMonthView = () => {
        const monthTitle = state.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        const firstDay = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1);
        const daysInMonth = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 0).getDate();
        const startDayIndex = firstDay.getDay();
        const cells = [];

        for (let i = 0; i < startDayIndex; i++) {
            cells.push('<div class="calendar-month-cell empty"></div>');
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const current = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), day);
            const appointments = filterAppointmentsForDay(current);
            cells.push(`
                <div class="calendar-month-cell">
                    <div class="cell-date">${day}</div>
                    ${renderAppointmentPills(appointments)}
                </div>
            `);
        }

        return `<div class="calendar-header">${monthTitle}</div><div class="calendar-month-grid">${cells.join('')}</div>`;
    };

    const filterAppointmentsForDay = date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return state.appointments.filter(appt => {
            const apptDate = new Date(appt.start_time || appt.start);
            return apptDate >= dayStart && apptDate <= dayEnd;
        });
    };

    const renderAppointmentList = appointments => {
        if (appointments.length === 0) {
            return '<div class="appointment-empty">No appointments</div>';
        }

        return `<div class="appointment-list">${appointments.map(renderAppointmentItem).join('')}</div>`;
    };

    const renderAppointmentPills = appointments => {
        if (appointments.length === 0) return '<div class="appointment-pill empty">No appointments</div>';
        return appointments.map(appt => {
            const time = formatTime(appt.start_time || appt.start);
            const groomer = appt.groomer_name || appt.groomer || 'Staff';
            return `<div class="appointment-pill"><strong>${time}</strong> ${appt.pet_name || appt.client_name || 'Appointment'}<span>${groomer}</span></div>`;
        }).join('');
    };

    const renderAppointmentItem = appt => {
        const time = formatTime(appt.start_time || appt.start);
        const groomer = appt.groomer_name || appt.groomer || 'Staff';
        return `
            <div class="appointment-item">
                <div class="appointment-time">${time}</div>
                <div class="appointment-details">
                    <div class="appointment-title">${appt.pet_name || appt.client_name || 'Appointment'}</div>
                    <div class="appointment-meta">${groomer} • ${appt.service || 'Service'}</div>
                </div>
            </div>
        `;
    };

    const formatDate = date => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const formatTime = value => {
        const date = new Date(value);
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const showLoading = visible => {
        if (!selectors.loadingIndicator) return;
        selectors.loadingIndicator.style.display = visible ? 'block' : 'none';
    };

    const renderMessage = message => {
        if (!selectors.message) return;
        selectors.message.textContent = message;
    };

    return { init };
})();

window.addEventListener('DOMContentLoaded', () => {
    StaffCalendar.init();
});
