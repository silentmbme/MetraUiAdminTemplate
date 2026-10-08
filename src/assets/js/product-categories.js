(() => {
  "use strict";
  const categories = [
    {
      id: "footwear",
      name: "Footwear",
      description: "Everyday shoes, athletic styles, and seasonal footwear.",
      products: 286,
      children: 12,
      share: 32,
      icon: "ri-footprint-line",
      tone: "mint",
      top: "Air Max 2025 Sneakers",
      image: "1.png",
    },
    {
      id: "electronics",
      name: "Electronics",
      description: "Smart devices, audio, and accessories for daily life.",
      products: 324,
      children: 18,
      share: 26,
      icon: "ri-device-line",
      tone: "lavender",
      top: "Wireless Earbuds",
      image: "4.png",
    },
    {
      id: "fashion",
      name: "Fashion",
      description: "Clothing and essentials for every season and occasion.",
      products: 412,
      children: 24,
      share: 24,
      icon: "ri-t-shirt-line",
      tone: "peach",
      top: "Classic Leather Jacket",
      image: "5.png",
    },
    {
      id: "home-living",
      name: "Home & Living",
      description: "Furniture, kitchenware, and thoughtful home details.",
      products: 158,
      children: 16,
      share: 12,
      icon: "ri-home-4-line",
      tone: "blue",
      top: "Wooden Dining Table",
      image: "3.png",
    },
    {
      id: "accessories",
      name: "Accessories",
      description: "Finishing touches, bags, and everyday carry pieces.",
      products: 64,
      children: 9,
      share: 4,
      icon: "ri-handbag-line",
      tone: "yellow",
      top: "Everyday Crossbody Bag",
      image: "7.png",
    },
    {
      id: "beauty-care",
      name: "Beauty & Care",
      description: "Personal care products and daily wellness essentials.",
      products: 40,
      children: 7,
      share: 2,
      icon: "ri-heart-pulse-line",
      tone: "rose",
      top: "Daily Care Essentials",
      image: "8.png",
    },
  ];
  const cards = document.getElementById("category-cards");
  const search = document.getElementById("category-search");
  const sort = document.getElementById("category-sort");
  const form = document.getElementById("category-editor-form");
  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("category-editor-modal")
  );
  const escapeHTML = (value) =>
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
  let nextId = 1;

  function render() {
    const query = search.value.trim().toLowerCase();
    let visible = categories.filter((category) =>
      `${category.name} ${category.description}`.toLowerCase().includes(query)
    );
    if (sort.value === "name")
      visible.sort((a, b) => a.name.localeCompare(b.name));
    if (sort.value === "products")
      visible.sort((a, b) => b.products - a.products);
    if (sort.value === "revenue") visible.sort((a, b) => b.share - a.share);
    cards.innerHTML = visible
      .map(
        (category) => `
      <div class="col-xxl-4 col-md-6">
        <article class="category-card card custom-card h-100">
          <div class="category-card-visual tone-${category.tone}">
            <span class="category-card-icon"><i class="${category.icon}"></i></span>
            <div class="dropdown">
              <button class="btn btn-icon btn-white btn-sm" type="button" data-bs-toggle="dropdown" aria-label="Actions for ${escapeHTML(category.name)}"><i class="ri-more-2-fill"></i></button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item category-edit" type="button" data-id="${escapeHTML(category.id)}"><i class="ri-edit-line me-2"></i>Edit category</button></li>
                <li><button class="dropdown-item text-danger category-delete" type="button" data-id="${escapeHTML(category.id)}"><i class="ri-delete-bin-line me-2"></i>Delete category</button></li>
              </ul>
            </div>
            <span class="category-card-pattern" aria-hidden="true"></span>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-start justify-content-between gap-3 mb-2">
              <div>
                <h3 class="fs-16 fw-semibold mb-1">${escapeHTML(category.name)}</h3>
                <p class="text-muted fs-12 mb-0 category-card-description">${escapeHTML(category.description || "No description added yet.")}</p>
              </div>
              <span class="category-share">${category.share}%<small>sales</small></span>
            </div>
            <div class="category-card-metrics">
              <div><strong>${category.products}</strong><span>Products</span></div>
              <div><strong>${category.children}</strong><span>Subcategories</span></div>
              <div><strong>$${(category.products * 42).toLocaleString("en-US")}</strong><span>Catalog value</span></div>
            </div>
            <div class="category-share-meter">
              <div class="d-flex justify-content-between text-muted fs-11 mb-1"><span>Revenue contribution</span><span>${category.share}%</span></div>
              <div class="progress bg-light"><div class="progress-bar bg-dark progress-bar-stipped" style="width:${category.share * 2.5}%"></div></div>
            </div>
          </div>
          <div class="card-footer bg-transparent d-flex align-items-center justify-content-between gap-2">
            <div class="d-flex align-items-center gap-2 min-w-0">
              <span class="category-top-product-image"><img src="../assets/images/ecommerce/png/${escapeHTML(category.image)}" alt="" loading="lazy"></span>
              <span class="category-top-product"><small>Top product</small><strong>${escapeHTML(category.top)}</strong></span>
            </div>
            <a href="products.html" class="btn btn-sm btn-light flex-shrink-0">View products <i class="ri-arrow-right-line ms-1"></i></a>
          </div>
        </article>
      </div>`
      )
      .join("");
    document.getElementById(
      "category-results-count"
    ).textContent = `${visible.length} shown`;
    document.getElementById("category-visible-count").textContent =
      visible.length;
    document
      .getElementById("category-empty-state")
      .classList.toggle("d-none", visible.length !== 0);
    cards.classList.toggle("d-none", visible.length === 0);
    document.getElementById("category-total-count").textContent =
      12 + categories.length - 6;
  }

  function openEditor(category) {
    form.reset();
    document.getElementById("category-edit-id").value = category?.id || "";
    document.getElementById("sidenav-category-label").value = category?.name || "";
    document.getElementById("category-description").value =
      category?.description || "";
    document.getElementById("category-parent").value = category?.parent || "";
    document.getElementById("category-editor-title").textContent = category
      ? "Edit category"
      : "Create category";
    modal.show();
  }

  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  document
    .querySelectorAll('[data-bs-target="#category-editor-modal"]')
    .forEach((button) => button.addEventListener("click", () => openEditor()));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const id = document.getElementById("category-edit-id").value;
    const name = document.getElementById("sidenav-category-label").value.trim();
    const description = document
      .getElementById("category-description")
      .value.trim();
    const parent = document.getElementById("category-parent").value;
    const existing = categories.find((category) => category.id === id);
    if (existing) Object.assign(existing, { name, description, parent });
    else
      categories.push({
        id: `custom-${nextId++}`,
        name,
        description,
        parent,
        products: 0,
        children: 0,
        share: 0,
        icon: "ri-price-tag-3-line",
        tone: "blue",
        top: "No products yet",
        image: "1.png",
      });
    modal.hide();
    render();
  });
  cards.addEventListener("click", (event) => {
    const editButton = event.target.closest(".category-edit");
    if (editButton) {
      openEditor(
        categories.find((category) => category.id === editButton.dataset.id)
      );
      return;
    }
    const deleteButton = event.target.closest(".category-delete");
    if (!deleteButton) return;
    const category = categories.find(
      (item) => item.id === deleteButton.dataset.id
    );
    Swal.fire({
      title: "Delete category?",
      text: `Remove ${category.name} from this category list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;
      categories.splice(categories.indexOf(category), 1);
      render();
    });
  });
  render();
})();
