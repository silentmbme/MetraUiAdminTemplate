(() => {
  "use strict";

  const inputs = [...document.querySelectorAll(".two-step-code input")];
  if (!inputs.length) return;

  const distributeDigits = (value, startIndex = 0) => {
    const digits = value.replace(/\D/g, "").slice(0, inputs.length - startIndex);
    [...digits].forEach((digit, offset) => {
      const input = inputs[startIndex + offset];
      if (input) input.value = digit;
    });

    const nextEmpty = inputs.findIndex((input, index) => index >= startIndex && !input.value);
    const focusIndex = nextEmpty === -1
      ? Math.min(startIndex + digits.length, inputs.length - 1)
      : nextEmpty;
    inputs[focusIndex]?.focus();
  };

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "");
      if (digits.length > 1) {
        input.value = "";
        distributeDigits(digits, index);
        return;
      }

      input.value = digits;
      if (digits && index < inputs.length - 1) inputs[index + 1].focus();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        inputs[index - 1].focus();
      } else if (event.key === "ArrowRight" && index < inputs.length - 1) {
        event.preventDefault();
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("paste", (event) => {
      const pasted = event.clipboardData?.getData("text") || "";
      if (!/\d/.test(pasted)) return;
      event.preventDefault();
      distributeDigits(pasted, index);
    });
  });
})();
