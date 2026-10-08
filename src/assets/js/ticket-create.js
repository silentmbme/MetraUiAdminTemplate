(() => {
  const form = document.querySelector("#create-ticket-form");
  const fileInput = document.querySelector("#request-attachment");
  const attachmentList = document.querySelector("#attachment-list");
  const feedback = document.querySelector("#create-ticket-feedback");
  const maxFileSize = 10 * 1024 * 1024;

  if (!form || !fileInput || !attachmentList || !feedback) return;

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  fileInput.addEventListener("change", () => {
    const selectedFiles = Array.from(fileInput.files || []);
    const tooLarge = selectedFiles.find((file) => file.size > maxFileSize);

    if (tooLarge) {
      attachmentList.textContent = `${tooLarge.name} is larger than the 10 MB limit. Remove it and choose a smaller file.`;
      attachmentList.classList.add("text-danger");
      fileInput.value = "";
      return;
    }

    attachmentList.classList.remove("text-danger");
    attachmentList.textContent = selectedFiles.length
      ? selectedFiles.map((file) => `${file.name} (${formatFileSize(file.size)})`).join(" · ")
      : "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("was-validated");
    feedback.classList.add("d-none");

    if (!form.checkValidity()) {
      form.querySelector(":invalid")?.focus();
      return;
    }

    feedback.textContent = "Form preview is valid. No ticket was saved because this demo page is not connected to a ticketing service.";
    feedback.classList.remove("d-none");
    feedback.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
