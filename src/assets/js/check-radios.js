(() => {
    const parent = document.querySelector("#advanced-select-all");
    const children = [...document.querySelectorAll("[data-channel-check]")];
    if (!parent) return;
    const update = () => {
        const count = children.filter((input) => input.checked).length;
        parent.checked = count === children.length;
        parent.indeterminate = count > 0 && count < children.length;
        document.querySelector("#advanced-channel-status").textContent =
            count + " of " + children.length + " channels selected";
    };
    parent.addEventListener("change", () => {
        children.forEach((input) => (input.checked = parent.checked));
        update();
    });
    children.forEach((input) => input.addEventListener("change", update));
    update();
    const form = document.querySelector("#advanced-selection-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (form.reportValidity())
            document.querySelector("#advanced-validation-status").textContent =
                "Selection is valid. This example does not submit data.";
    });
    form.addEventListener(
        "input",
        () =>
            (document.querySelector("#advanced-validation-status").textContent =
                "")
    );
})();
