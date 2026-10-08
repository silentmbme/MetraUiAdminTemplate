(function () {
    "use strict";

    const primaryWizard = document.querySelector(".wizard-tab");
    if (primaryWizard) {
        const wizard = new Wizard1({
            wz_class: ".wizard-tab",
            highlight: true,
            highlight_time: 1000,
        });
        wizard.init();
    }

    const dateField = document.querySelector("#date");
    if (dateField && typeof flatpickr !== "undefined") {
        flatpickr(dateField, {});
    }

    const basicWizard = document.querySelector("#basicwizard");
    if (basicWizard && typeof Wizard !== "undefined") {
        new Wizard("#basicwizard", { validate: true });
    }

    const progressWizard = document.querySelector("#progresswizard");
    if (progressWizard && typeof Wizard !== "undefined") {
        new Wizard("#progresswizard", { validate: true, progress: true });
    }
})();