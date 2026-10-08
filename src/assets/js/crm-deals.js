(function () {
  "use strict";

  const dealStageLists = Array.from(
    document.querySelectorAll(".crm-deal-stage-cards")
  );
  const dealBoard = dragula(dealStageLists, {
    moves: (_card, _container, handle) =>
      !handle.closest("button, a, input, select, textarea, .dropdown-menu"),
  });

  dealBoard.on("cloned", (mirror, original, cloneType) => {
    if (cloneType !== "mirror" || !original.matches(".crm-deal-card")) return;

    const originalNodes = [original, ...original.querySelectorAll("*")];
    const mirrorNodes = [mirror, ...mirror.querySelectorAll("*")];
    const positioningStyles = new Set([
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "inset",
      "transform",
      "z-index",
      "opacity",
    ]);

    originalNodes.forEach((source, index) => {
      const target = mirrorNodes[index];
      if (!target) return;

      const computedStyles = window.getComputedStyle(source);
      Array.from(computedStyles).forEach((property) => {
        if (positioningStyles.has(property)) return;
        target.style.setProperty(
          property,
          computedStyles.getPropertyValue(property),
          computedStyles.getPropertyPriority(property)
        );
      });
    });

    mirror.style.setProperty("cursor", "grabbing");
  });

  flatpickr("#datetime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    disableMobile: true,
  });
})();
