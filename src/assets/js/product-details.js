(() => {
  "use strict";

  const thumbnails = new Swiper(".product-detail-thumbs-swiper", {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: { 576: { slidesPerView: 5 }, 992: { slidesPerView: 6 } },
  });

  new Swiper(".product-detail-main-swiper", {
    spaceBetween: 12,
    keyboard: { enabled: true },
    a11y: { enabled: true },
    navigation: {
      nextEl: ".product-detail-main-swiper .swiper-button-next",
      prevEl: ".product-detail-main-swiper .swiper-button-prev",
    },
    thumbs: { swiper: thumbnails },
  });

  document.querySelectorAll(".product-detail-color").forEach((option) => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".product-detail-color").forEach((item) => {
        const selected = item === option;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      document.getElementById("selected-color-label").textContent =
        option.getAttribute("aria-label");
    });
  });

  document.querySelectorAll(".product-detail-size").forEach((option) => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".product-detail-size").forEach((item) => {
        const selected = item === option;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
  });

  const favorite = document.querySelector(".product-detail-favorite");
  favorite?.addEventListener("click", () => {
    const saved = favorite.getAttribute("aria-pressed") !== "true";
    favorite.setAttribute("aria-pressed", String(saved));
    favorite.setAttribute(
      "aria-label",
      saved ? "Remove from saved products" : "Save product"
    );
    favorite.innerHTML = `<i class="${
      saved ? "ri-heart-fill" : "ri-heart-line"
    }"></i>`;
  });
})();
