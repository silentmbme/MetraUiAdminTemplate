(function () {
  "use strict";

  const form = document.getElementById("checkout-form");
  const couponInput = document.getElementById("checkout-coupon-code");
  const couponFeedback = document.getElementById("checkout-coupon-feedback");
  const cardFields = document.getElementById("checkout-card-fields");
  const otherPayment = document.getElementById("checkout-other-payment");
  const subtotal = 489.96;
  let discountRate = 0;

  const formatMoney = (amount) =>
    `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  function updateTotal() {
    const delivery = Number(
      form.querySelector('input[name="deliveryMethod"]:checked')?.dataset
        .cost || 0
    );
    const discount = Math.round(subtotal * discountRate * 100) / 100;
    const total = subtotal - discount + delivery;

    document.getElementById("checkout-subtotal").textContent =
      formatMoney(subtotal);
    document.getElementById("checkout-discount").textContent = `-${formatMoney(
      discount
    )}`;
    document.getElementById("checkout-shipping").textContent =
      delivery === 0 ? "Free" : formatMoney(delivery);
    document.getElementById("checkout-total").textContent = formatMoney(total);
    document.getElementById("checkout-button-total").textContent =
      formatMoney(total);
    document.getElementById("checkout-confirmation-total").textContent =
      formatMoney(total);
  }

  function applyCoupon() {
    const validCode = couponInput.value.trim().toUpperCase() === "STYLE10";
    discountRate = validCode ? 0.1 : 0;
    couponFeedback.textContent = validCode
      ? "STYLE10 applied. You saved 10% on your items."
      : "That code is not valid. Try STYLE10.";
    couponFeedback.classList.toggle("is-success", validCode);
    couponFeedback.classList.toggle("is-error", !validCode);
    updateTotal();
  }

  document
    .getElementById("checkout-apply-coupon")
    .addEventListener("click", applyCoupon);
  couponInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCoupon();
    }
  });

  form.querySelectorAll('input[name="deliveryMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      form.querySelectorAll(".checkout-choice-card").forEach((label) => {
        label.classList.toggle(
          "is-selected",
          label.contains(input) && input.checked
        );
      });
      updateTotal();
    });
  });

  form.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      const isCard = input.value === "card" && input.checked;
      form.querySelectorAll(".checkout-payment-option").forEach((label) => {
        label.classList.toggle(
          "is-selected",
          label.contains(input) && input.checked
        );
      });
      cardFields.hidden = !isCard;
      cardFields.querySelectorAll("input").forEach((field) => {
        field.required = isCard;
      });
      otherPayment.hidden = isCard;
      otherPayment.textContent =
        input.value === "paypal"
          ? "PayPal will be available when you continue to payment."
          : "Pay when your order is delivered to your address.";
    });
  });

  form.addEventListener("input", () => {
    document.getElementById("checkout-confirmation").hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("was-validated");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const confirmation = document.getElementById("checkout-confirmation");
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  updateTotal();
})();
