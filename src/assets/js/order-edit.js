(function () {
  "use strict";

  const form = document.getElementById("order-edit-form");
  const itemList = document.getElementById("order-edit-items");
  const subtotalOutput = document.getElementById("order-subtotal");
  const totalOutput = document.getElementById("order-total");
  const feedback = document.getElementById("order-edit-feedback");
  const money = (amount) => `$${amount.toFixed(2)}`;

  function updateTotals() {
    let subtotal = 0;
    itemList.querySelectorAll(".order-edit-item-row").forEach((row) => {
      const price = Number(row.dataset.price) || 0;
      const quantity = Math.max(
        1,
        Number(row.querySelector(".order-item-quantity").value) || 1
      );
      row.querySelector(".order-item-quantity").value = quantity;
      const lineTotal = price * quantity;
      row.querySelector(".order-line-total").textContent = money(lineTotal);
      subtotal += lineTotal;
    });
    const discount = Math.min(0.01, subtotal);
    subtotalOutput.textContent = money(subtotal);
    totalOutput.textContent = money(subtotal - discount);
  }

  itemList.addEventListener("input", (event) => {
    if (event.target.matches(".order-item-quantity")) updateTotals();
  });

  itemList.addEventListener("click", (event) => {
    const decrease = event.target.closest(".order-qty-decrease");
    const increase = event.target.closest(".order-qty-increase");
    const remove = event.target.closest(".order-remove-item");
    if (decrease || increase) {
      const input = event.target
        .closest(".order-edit-item-row")
        .querySelector(".order-item-quantity");
      input.value = Math.max(
        1,
        (Number(input.value) || 1) + (increase ? 1 : -1)
      );
      updateTotals();
    }
    if (remove) {
      event.target.closest(".order-edit-item-row").remove();
      updateTotals();
    }
  });

  document.getElementById("add-order-item").addEventListener("click", () => {
    const row = document.createElement("tr");
    row.className = "order-edit-item-row";
    row.dataset.price = "25";
    row.innerHTML = `
      <td>
        <div class="order-edit-product">
          <span class="order-edit-product-image">
            <img
              src="../assets/images/ecommerce/png/12.png"
              alt="Shoe care kit"
            >
          </span>
          <span>
            <strong>Shoe care kit</strong>
            <small>CARE-KIT-01 · Universal</small>
          </span>
        </div>
      </td>
      <td class="text-end">
        <span class="order-edit-unit-price">$25.00</span>
      </td>
      <td>
        <div class="order-qty-control">
          <button type="button" class="order-qty-decrease" aria-label="Decrease quantity">
            <i class="ri-subtract-line"></i>
          </button>
          <input
            class="order-item-quantity"
            type="number"
            min="1"
            value="1"
            aria-label="Shoe care kit quantity"
          >
          <button type="button" class="order-qty-increase" aria-label="Increase quantity">
            <i class="ri-add-line"></i>
          </button>
        </div>
      </td>
      <td class="text-end fw-semibold order-line-total">$25.00</td>
      <td class="text-end">
        <button
          type="button"
          class="btn btn-icon btn-sm btn-danger-light order-remove-item"
          aria-label="Remove Shoe care kit"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    `;
    itemList.appendChild(row);
    updateTotals();
  });

  form.addEventListener("input", () => {
    feedback.textContent = "";
  });
  form.addEventListener("change", () => {
    feedback.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    feedback.textContent = "Order changes saved.";
    feedback.classList.add("is-visible");
  });

  updateTotals();
})();
