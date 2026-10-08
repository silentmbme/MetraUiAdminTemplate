(() => {
  const calendarElement = document.querySelector("#calendar");
  if (!calendarElement || !window.FullCalendar) return;

  const eventModalElement = document.querySelector("#eventModal");
  const addEventModalElement = document.querySelector("#addEvent");
  const eventModal = bootstrap.Modal.getOrCreateInstance(eventModalElement);
  const addEventModal = bootstrap.Modal.getOrCreateInstance(addEventModalElement);
  const feedback = document.querySelector("#calendar-feedback");
  let selectedEvent = null;

  const formatDate = (date) => new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const makeExclusiveEnd = (dateValue) => {
    const end = new Date(`${dateValue}T00:00:00`);
    end.setDate(end.getDate() + 1);
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  };

  const calendar = new FullCalendar.Calendar(calendarElement, {
    initialView: "timeGridWeek",
    initialDate: "2026-10-05",
    height: "100%",
    slotMinTime: "08:00:00",
    slotMaxTime: "18:00:00",
    scrollTime: "08:00:00",
    slotDuration: "00:30:00",
    allDaySlot: true,
    slotLabelFormat: {hour:"numeric", minute:"2-digit", meridiem:"short"},
    dayHeaderFormat: {weekday:"short", day:"numeric"},
    dayHeaderContent(arg) {
      const header = document.createElement("div");
      header.className = "appointment-day-heading";
      const date = document.createElement("span");
      date.className = "appointment-day-date";
      date.textContent = `${new Intl.DateTimeFormat("en", { weekday: "short" }).format(arg.date).toUpperCase()} ${arg.date.getDate()}`;
      const count = document.createElement("span");
      count.className = "appointment-day-count";
      const sameDayEvents = calendar.getEvents().filter(event => event.start && event.start.toDateString() === arg.date.toDateString());
      count.textContent = String(sameDayEvents.length);
      count.setAttribute("aria-label", `${sameDayEvents.length} scheduled ${sameDayEvents.length === 1 ? "event" : "events"}`);
      header.append(date, count);
      return { domNodes: [header] };
    },
    eventDisplay: "block",
    displayEventTime: false,
    firstDay: 1,
    droppable: true,
    dayMaxEvents: 3,
    navLinks: true,
    selectable: true,
    editable: true,
    nowIndicator: true,
    headerToolbar: false,
    datesSet(info) { document.querySelector("#calendar-period-title").textContent = info.view.title.toUpperCase();
      document.querySelectorAll("[data-calendar-view]").forEach(button => { const active = button.dataset.calendarView === info.view.type; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); }); },
    buttonText: {
      today: "Today",
      month: "Month",
      week: "Week",
      day: "Day",
      list: "Agenda",
    },
    events: [
  {
    "id": "1",
    "title": "Weekly team sync",
    "start": "2026-10-05T08:00:00",
    "end": "2026-10-05T09:00:00",
    "category": "team",
    "tone": "success",
    "faces": [
      "9.jpg",
      "4.jpg"
    ],
    "description": "Align priorities, review progress, and discuss blockers."
  },
  {
    "id": "2",
    "title": "Design handoff",
    "start": "2026-10-05T11:00:00",
    "end": "2026-10-05T12:30:00",
    "category": "meeting",
    "tone": "primary",
    "faces": [
      "2.jpg",
      "4.jpg"
    ],
    "description": "Walk through approved screens and confirm implementation details."
  },
  {
    "id": "3",
    "title": "Customer feedback review",
    "start": "2026-10-06T09:00:00",
    "end": "2026-10-06T10:30:00",
    "category": "meeting",
    "tone": "info",
    "faces": [
      "9.jpg",
      "4.jpg"
    ],
    "description": "Review customer feedback and agree on follow-up actions."
  },
  {
    "id": "4",
    "title": "Campaign planning",
    "start": "2026-10-06T12:00:00",
    "end": "2026-10-06T13:30:00",
    "category": "team",
    "tone": "secondary",
    "faces": [
      "2.jpg",
      "4.jpg"
    ],
    "description": "Plan content, channels, and owners for the next campaign."
  },
  {
    "id": "5",
    "title": "Sprint planning",
    "start": "2026-10-07T08:00:00",
    "end": "2026-10-07T09:00:00",
    "category": "team",
    "tone": "success",
    "faces": [
      "9.jpg",
      "4.jpg"
    ],
    "description": "Estimate upcoming work and set the sprint goal."
  },
  {
    "id": "6",
    "title": "Product demo",
    "start": "2026-10-07T09:30:00",
    "end": "2026-10-07T10:30:00",
    "category": "meeting",
    "tone": "danger",
    "faces": [
      "2.jpg",
      "4.jpg"
    ],
    "description": "Share the latest product improvements with the team."
  },
  {
    "id": "7",
    "title": "Project milestone review",
    "start": "2026-10-07T11:30:00",
    "end": "2026-10-07T13:00:00",
    "category": "deadline",
    "tone": "warning",
    "faces": [
      "9.jpg",
      "4.jpg"
    ],
    "description": "Check deliverables and confirm the next milestone."
  },
  {
    "id": "8",
    "title": "Budget review",
    "start": "2026-10-08T08:30:00",
    "end": "2026-10-08T10:00:00",
    "category": "meeting",
    "tone": "warning",
    "faces": [
      "2.jpg",
      "4.jpg"
    ],
    "description": "Review project spending and forecast the remaining budget."
  },
  {
    "id": "9",
    "title": "Team retrospective",
    "start": "2026-10-08T11:45:00",
    "end": "2026-10-08T12:45:00",
    "category": "team",
    "tone": "success",
    "faces": [
      "9.jpg",
      "4.jpg"
    ],
    "description": "Discuss what worked well and agree on improvements."
  }
],
    eventContent({event, view}) {
      const content = document.createElement('div'); content.className = 'appointment-event-content';
      const title = document.createElement('strong'); title.textContent = event.title; content.append(title);
      if (!event.allDay && event.start) {
        const time = document.createElement('span'); time.className = 'appointment-event-time';
        const format = date => date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false});
        time.textContent = format(event.start) + (event.end ? ' - ' + format(event.end) : ''); content.append(time);
      }
      if (view.type.startsWith('timeGrid')) {
        const avatars = document.createElement('div'); avatars.className = 'avatar-list-stacked mt-2';
        (event.extendedProps.faces || ['9.jpg','4.jpg']).forEach(face => { const image = document.createElement('img'); image.className = 'avatar avatar-xs avatar-rounded'; image.src = '../assets/images/users/' + face; image.alt = 'Team participant'; avatars.append(image); }); content.append(avatars);
      }
      return {domNodes:[content]};
    },
    eventClassNames({ event }) {
      return [`calendar-event-${event.extendedProps.category || "team"}`, `calendar-tone-${event.extendedProps.tone || ({team:"secondary",meeting:"info",deadline:"danger",personal:"success"}[event.extendedProps.category]) || "primary"}`];
    },
    dateClick(info) {
      const clickedDate = info.dateStr.slice(0, 10);
      calendar.gotoDate(clickedDate);
      document.querySelector("#fromDate").value = clickedDate;
      document.querySelector("#toDate").value = clickedDate;
      document.querySelector("#calendar-form-error").classList.add("d-none");
      addEventModal.show();
    },
    eventClick({ event }) {
      selectedEvent = event;
      document.querySelector("#modalEventName").textContent = event.title;
      document.querySelector("#modalEventDescription").textContent = event.extendedProps.description || "No description added.";
      document.querySelector("#modalEventCategory").textContent = event.extendedProps.category || "Team";
      document.querySelector("#modalEventStart").textContent = formatDate(event.start);
      document.querySelector("#modalEventEnd").textContent = event.end
        ? formatDate(new Date(event.end.getTime() - (event.allDay ? 86400000 : 0)))
        : "No end date";
      eventModal.show();
    },
    eventDidMount({ event, el }) {
      if (event.extendedProps.location) el.title = `${event.title} Â· ${event.extendedProps.location}`;
    },
  });

  const renderAgenda = () => {
    const container = document.querySelector('#appointment-agenda'); container.replaceChildren();
    const events = calendar.getEvents().filter(event => event.start >= calendar.view.activeStart && event.start < calendar.view.activeEnd).sort((a,b)=>a.start-b.start);
    const groups = new Map(); events.forEach(event => {const key=formatDate(event.start); if(!groups.has(key))groups.set(key,[]);groups.get(key).push(event);});
    groups.forEach((appointments, date) => {
      const section = document.createElement('section'); section.className = 'appointment-agenda-day';
      const heading = document.createElement('h3'); heading.className='fs-13 fw-medium bg-light rounded-pill px-3 py-2'; heading.textContent=date; section.append(heading);
      appointments.forEach(event => {
        const button=document.createElement('button'); button.type='button'; button.className='appointment-agenda-item'; button.style.setProperty('--appointment-tone', 'var(--theme-'+(event.extendedProps.tone || 'primary')+'-rgb)');
        const title=document.createElement('strong');title.textContent=event.title;
        const timeRow=document.createElement('span');timeRow.className='appointment-agenda-time';
        const clock=document.createElement('i');clock.className='ri-time-line';clock.setAttribute('aria-hidden','true');
        const time=document.createElement('span');time.textContent=event.allDay?'All day':event.start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + (event.end?' - '+event.end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'');
        timeRow.append(clock,time);button.append(title,timeRow);
        button.addEventListener('click',()=>calendar.getOption('eventClick')({event}));section.append(button);
      });container.append(section);
    });
    if(!events.length)container.textContent='No events scheduled for this period.';
  };
  calendar.on('eventsSet',renderAgenda);calendar.on('datesSet',renderAgenda);
  calendar.render(); renderAgenda();
  if (window.ResizeObserver) {
    let resizeFrame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => calendar.updateSize());
    });
    observer.observe(calendarElement.parentElement);
    window.addEventListener('pagehide', () => { observer.disconnect(); cancelAnimationFrame(resizeFrame); }, {once:true});
  }
  document.querySelector("#calendar-prev").addEventListener("click", () => calendar.prev());
  document.querySelector("#calendar-next").addEventListener("click", () => calendar.next());
  document.querySelectorAll('[data-calendar-view]').forEach(button => button.addEventListener('click', () => {
    calendar.changeView(button.dataset.calendarView);
    document.querySelectorAll('[data-calendar-view]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  }));
  document.querySelector("#calendar-create").addEventListener("click", () => {
    document.querySelector("#calendar-event-form").reset();
    const date = calendar.getDate(); const value = date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
    document.querySelector("#fromDate").value = value; document.querySelector("#toDate").value = value;
    document.querySelector("#calendar-form-error").classList.add("d-none"); addEventModal.show();
  });

  document.querySelector("#calendar-today").addEventListener("click", () => calendar.today());

  document.querySelector("#calendar-event-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const title = document.querySelector("#eventName").value.trim();
    const start = document.querySelector("#fromDate").value;
    const end = document.querySelector("#toDate").value;
    const category = document.querySelector("#eventType").value;
    const errorMessage = document.querySelector("#calendar-form-error");

    if (end < start) {
      errorMessage.textContent = "End date must be the same as or after the start date.";
      errorMessage.classList.remove("d-none");
      return;
    }

    calendar.addEvent({
      title,
      start,
      end: makeExclusiveEnd(end),
      allDay: true,
      category,
      location: "Team calendar",
      description: document.querySelector("#event-description").value.trim(),
    });

    calendar.gotoDate(start);
    addEventModal.hide();
    form.reset();
    errorMessage.classList.add("d-none");
    feedback.textContent = `"${title}" was added to this calendar session.`;
  });

  document.querySelector("#deleteEventButton").addEventListener("click", () => {
    if (!selectedEvent) return;
    const eventTitle = selectedEvent.title;
    selectedEvent.remove();
    selectedEvent = null;
    eventModal.hide();
    feedback.textContent = `"${eventTitle}" was removed from this calendar session.`;
  });
})();
