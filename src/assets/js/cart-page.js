(function () {
  "use strict";

  const cartList = document.getElementById("cart-items-list");
  const savedList = document.getElementById("cart-saved-list");
  const couponForm = document.getElementById("cart-coupon-form");
  const couponInput = document.getElementById("cart-coupon");
  const couponFeedback = document.getElementById("cart-coupon-feedback");
  const currency = (value) => `$${value.toFixed(2)}`;
  let couponApplied = false;

  function refreshCart() {
    const items = [...cartList.querySelectorAll(":scope > tr.cart-item")];
    const units = items.reduce(
      (sum, item) =>
        sum +
        Math.max(1, Number(item.querySelector(".cart-qty-input").value) || 1),
      0
    );
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.dataset.unitPrice) || 0) *
          Math.max(1, Number(item.querySelector(".cart-qty-input").value) || 1),
      0
    );
    const discount = couponApplied ? Math.round(subtotal * 10) / 100 : 0;
    document.getElementById("cart-product-count").textContent = items.length;
    document.getElementById("cart-summary-products").textContent = `${
      items.length
    } ${items.length === 1 ? "product" : "products"}`;
    document.getElementById("cart-unit-count").textContent = `${units} ${
      units === 1 ? "unit" : "units"
    }`;
    document.getElementById("cart-subtotal").textContent = currency(subtotal);
    document.getElementById("cart-discount").textContent = `-${currency(
      discount
    )}`;
    document.getElementById("cart-grand-total").textContent = currency(
      subtotal - discount
    );
    document.getElementById("cart-empty-state").hidden = items.length > 0;
    document.getElementById("cart-saved-section").hidden =
      savedList.children.length === 0;
    document.getElementById("cart-saved-count").textContent =
      savedList.children.length;
    const checkout = document.querySelector(".cart-checkout-button");
    if (checkout) {
      checkout.classList.toggle("disabled", items.length === 0);
      checkout.setAttribute("aria-disabled", String(items.length === 0));
      if (items.length === 0) checkout.removeAttribute("href");
      else checkout.setAttribute("href", "checkout.html");
    }
  }

  function updateLine(item) {
    const quantityInput = item.querySelector(".cart-qty-input");
    const quantity = Math.min(
      30,
      Math.max(1, Number(quantityInput.value) || 1)
    );
    quantityInput.value = quantity;
    item.querySelector(".cart-item-total strong").textContent = currency(
      Number(item.dataset.unitPrice) * quantity
    );
    refreshCart();
  }

  cartList.addEventListener("input", (event) => {
    if (event.target.matches(".cart-qty-input"))
      updateLine(event.target.closest(".cart-item"));
  });

  document.addEventListener("click", (event) => {
    const quantityButton = event.target.closest(".cart-qty-button");
    if (quantityButton) {
      const item = quantityButton.closest(".cart-item");
      const quantityInput = item.querySelector(".cart-qty-input");
      quantityInput.value = Math.min(
        30,
        Math.max(
          1,
          (Number(quantityInput.value) || 1) +
            Number(quantityButton.dataset.quantityStep)
        )
      );
      updateLine(item);
      return;
    }

    const saveButton = event.target.closest(".cart-save-button");
    if (saveButton) {
      const item = saveButton.closest(".cart-item");
      item.classList.add("is-saved");
      saveButton.className = "cart-save-button cart-restore-button";
      saveButton.innerHTML =
        '<i class="ri-shopping-cart-line"></i><span>Move to cart</span>';
      savedList.appendChild(item);
      refreshCart();
      return;
    }

    const restoreButton = event.target.closest(".cart-restore-button");
    if (restoreButton) {
      const item = restoreButton.closest(".cart-item");
      item.classList.remove("is-saved");
      restoreButton.className = "cart-save-button";
      restoreButton.innerHTML =
        '<i class="ri-heart-line"></i><span>Save</span>';
      cartList.appendChild(item);
      refreshCart();
      return;
    }

    const removeButton = event.target.closest(".cart-remove-button");
    if (removeButton) {
      removeButton.closest(".cart-item").remove();
      refreshCart();
    }
  });

  couponForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (couponInput.value.trim().toUpperCase() === "STYLE10") {
      couponApplied = true;
      couponFeedback.textContent = "STYLE10 applied. 10% off your items.";
      couponFeedback.className = "is-success";
      refreshCart();
    } else {
      couponApplied = false;
      couponFeedback.textContent = "That code is not valid. Try STYLE10.";
      couponFeedback.className = "is-error";
      refreshCart();
    }
  });

  refreshCart();
})();
