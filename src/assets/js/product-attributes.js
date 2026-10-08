(() => {
  "use strict";

  const attributes = [
    {
      id: 1,
      name: "Size",
      type: "Size selector",
      values: ["XS", "S", "M", "L", "XL", "XXL"],
      products: 84,
      icon: "ri-ruler-line",
      iconTone: "tone-blue",
    },
    {
      id: 2,
      name: "Color",
      type: "Color swatches",
      values: ["Black", "Ivory", "Sage", "Navy", "Terracotta"],
      products: 62,
      icon: "ri-palette-line",
      iconTone: "tone-violet",
    },
    {
      id: 3,
      name: "Material",
      type: "Text options",
      values: ["Organic cotton", "Linen", "Wool", "Recycled polyester"],
      products: 48,
      icon: "ri-leaf-line",
      iconTone: "tone-green",
    },
    {
      id: 4,
      name: "Style",
      type: "Text options",
      values: ["Classic", "Modern", "Minimal", "Coastal"],
      products: 32,
      icon: "ri-shapes-line",
      iconTone: "tone-amber",
    },
    {
      id: 5,
      name: "Capacity",
      type: "Text options",
      values: ["250 ml", "500 ml", "750 ml", "1 L"],
      products: 19,
      icon: "ri-flask-line",
      iconTone: "tone-cyan",
    },
    {
      id: 6,
      name: "Fit",
      type: "Text options",
      values: ["Slim", "Regular", "Relaxed"],
      products: 27,
      icon: "ri-t-shirt-line",
      iconTone: "tone-rose",
    },
  ];

  const grid = document.getElementById("attribute-grid");
  const search = document.getElementById("attribute-search");
  const form = document.getElementById("attribute-form");
  const modalElement = document.getElementById("attribute-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  let editingId = null;

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[character])
    );

  function renderAttributes() {
    const query = search.value.trim().toLowerCase();
    const visibleAttributes = attributes.filter((attribute) =>
      `${attribute.name} ${attribute.type} ${attribute.values.join(" ")}`
        .toLowerCase()
        .includes(query)
    );

    grid.innerHTML = visibleAttributes
      .map((attribute) => {
        const visibleValues = attribute.values.slice(0, 4);
        const valueMarkup =
          attribute.type === "Color swatches"
            ? visibleValues
                .map(
                  (value) =>
                    `<span class="attribute-value-chip"><i class="attribute-color-dot color-${escapeHtml(
                      value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                    )}"></i>${escapeHtml(value)}</span>`
                )
                .join("")
            : visibleValues
                .map(
                  (value) =>
                    `<span class="attribute-value-chip">${escapeHtml(
                      value
                    )}</span>`
                )
                .join("");
        const extraValues = attribute.values.length - visibleValues.length;
        return `<tr>
          <td><div class="attribute-name-cell"><span class="attribute-icon avatar avatar-md fs-20 avatar-rounded ${escapeHtml(attribute.iconTone)}"><i class="${escapeHtml(attribute.icon)}" aria-hidden="true"></i></span><span><strong>${escapeHtml(attribute.name)}</strong><small class="text-muted d-block">${attribute.values.length} values</small></span></div></td>
          <td><span class="attribute-type-badge">${escapeHtml(attribute.type)}</span></td>
          <td><div class="attribute-value-list">${valueMarkup}${extraValues > 0 ? `<span class="attribute-more-values">+${extraValues} more</span>` : ""}</div></td>
          <td><span class="fw-semibold">${attribute.products}</span><span class="text-muted ms-1">products</span></td>
          <td class="text-end"><button type="button" class="btn btn-sm btn-light" data-edit-attribute="${attribute.id}" aria-label="Edit ${escapeHtml(attribute.name)}"><i class="ri-edit-line me-1" aria-hidden="true"></i>Edit</button></td>
        </tr>`;
      })
      .join("");

    document.getElementById("attribute-empty").hidden =
      visibleAttributes.length > 0;
    document.getElementById("attribute-total").textContent = attributes.length;
    document.getElementById("attribute-value-total").textContent =
      attributes.reduce((sum, attribute) => sum + attribute.values.length, 0);
  }

  function prepareForm(attribute = null) {
    editingId = attribute?.id ?? null;
    document.getElementById("attribute-modal-title").textContent = attribute
      ? "Edit attribute"
      : "Add attribute";
    document.getElementById("attribute-save-button").innerHTML = attribute
      ? '<i class="ri-save-line me-1"></i>Save changes'
      : '<i class="ri-save-line me-1"></i>Save attribute';
    document.getElementById("attribute-name").value = attribute?.name || "";
    document.getElementById("attribute-type").value =
      attribute?.type || "Text options";
    document.getElementById("attribute-values").value =
      attribute?.values.join(", ") || "";
  }

  document
    .getElementById("add-attribute-button")
    .addEventListener("click", () => {
      prepareForm();
      modal.show();
    });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-attribute]");
    if (!button) return;
    const attribute = attributes.find(
      (item) => item.id === Number(button.dataset.editAttribute)
    );
    if (!attribute) return;
    prepareForm(attribute);
    modal.show();
  });
  search.addEventListener("input", renderAttributes);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("attribute-name").value.trim();
    const type = document.getElementById("attribute-type").value;
    const values = [
      ...new Set(
        document
          .getElementById("attribute-values")
          .value.split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      ),
    ];
    if (!name || !values.length) return;

    if (editingId) {
      const attribute = attributes.find((item) => item.id === editingId);
      Object.assign(attribute, { name, type, values });
    } else {
      attributes.push({
        id: Date.now(),
        name,
        type,
        values,
        products: 0,
        icon: "ri-list-settings-line",
        iconTone: "tone-blue",
      });
    }
    const message = editingId
      ? `${name} was updated.`
      : `${name} was added to your attributes.`;
    editingId = null;
    form.reset();
    modal.hide();
    renderAttributes();
    document.getElementById(
      "attribute-feedback"
    ).textContent = `${message} Changes are stored in this page session.`;
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    editingId = null;
    form.reset();
  });

  renderAttributes();
})();
