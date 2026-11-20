// Form wiring for the shared Tiebreak WordPress endpoints, through formsub
// (window.formsub, loaded with `defer` by Layout.astro). Same setup as smartconnect-careers.

// Endpoint comes from .env. It runs in the browser, so it needs the PUBLIC_ prefix.
const CAREER_ENDPOINT = import.meta.env.PUBLIC_CAREER_FORM_URL;

// Bundled module scripts and the deferred formsub script both run before
// DOMContentLoaded, in no guaranteed order, so wait for formsub if needed.
function whenFormsub(init) {
  if (window.formsub) init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
}

function isSuccess(response) {
  return response?.status === "success" || response?.status === 200 || response?.code === 200;
}

// Career application (with the CV upload). Field errors stay inline (formsub's
// default). While sending, formsub disables the submit button (CSS turns it into a
// spinner) and shows the "#<id>-loading" text. On success the form is reset and a
// SweetAlert2 popup with the animated success tick confirms (loaded on the home page);
// without SweetAlert2 the message goes in [data-form-note]. Errors stay in the note.
// When the server sends no message, data-success-message / data-error-message is used.
export function initCareerForms() {
  whenFormsub(() => {
    document.querySelectorAll("form[data-career-form]").forEach((form) => {
      const note = form.querySelector("[data-form-note]");
      const setNote = (message, type) => {
        if (!note) return;
        note.textContent = message || "";
        note.classList.toggle("is-ok", type === "success");
        note.classList.toggle("is-bad", type === "error");
      };

      form.addEventListener("submit", () => setNote(""));

      window.formsub.newForm({
        formId: form.id,
        submitButton: `#${form.id}-submit`,
        ajaxUrl: CAREER_ENDPOINT,
        method: "POST",
        indicator: `#${form.id}-loading`,
        callback: (response) => {
          if (!isSuccess(response)) {
            setNote(response?.message || form.dataset.errorMessage, "error");
            return;
          }
          const message = response.message || form.dataset.successMessage;
          form.reset();
          if (window.Swal) {
            window.Swal.fire({
              icon: "success",
              text: message,
              confirmButtonText: form.dataset.successButton || "OK",
              confirmButtonColor: "#2F63E0",
            });
          } else {
            setNote(message, "success");
          }
        },
      });
    });
  });
}
