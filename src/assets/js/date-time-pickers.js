(() => {
  "use strict";

  if (typeof window.flatpickr !== "function") return;

  const dateTime = document.getElementById("datetime");
  if (dateTime) {
    window.flatpickr(dateTime, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
    });
  }

  const limitedDateTime = document.getElementById("limitdatetime");
  if (limitedDateTime) {
    window.flatpickr(limitedDateTime, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      minTime: "16:00",
      maxTime: "22:00",
    });
  }
})();
