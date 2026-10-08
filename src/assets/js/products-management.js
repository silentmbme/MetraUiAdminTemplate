(() => {
  "use strict";
  const products = [
    {
      name: "Studio Wireless Headphones",
      sku: "AUD-2048",
      category: "Electronics",
      price: 149.0,
      quantity: 42,
      status: "Active",
      updated: "Sep 24, 2026",
      image: "2.png",
    },
    {
      name: "Everyday Runner Sneakers",
      sku: "FW-1082",
      category: "Fashion",
      price: 89.5,
      quantity: 8,
      status: "Active",
      updated: "Sep 23, 2026",
      image: "1.png",
    },
    {
      name: "Minimal Desk Lamp",
      sku: "HOM-0314",
      category: "Home",
      price: 64.0,
      quantity: 0,
      status: "Draft",
      updated: "Sep 22, 2026",
      image: "3.png",
    },
    {
      name: "Smart Watch Series 5",
      sku: "EL-9271",
      category: "Electronics",
      price: 229.0,
      quantity: 16,
      status: "Active",
      updated: "Sep 21, 2026",
      image: "4.png",
    },
    {
      name: "Classic Leather Tote",
      sku: "ACC-6610",
      category: "Accessories",
      price: 118.0,
      quantity: 3,
      status: "Active",
      updated: "Sep 20, 2026",
      image: "5.png",
    },
    {
      name: "Ceramic Pour-over Set",
      sku: "HOM-4930",
      category: "Home",
      price: 42.0,
      quantity: 27,
      status: "Active",
      updated: "Sep 19, 2026",
      image: "7.png",
    },
    {
      name: "Cloud Knit Cardigan",
      sku: "FW-7721",
      category: "Fashion",
      price: 76.0,
      quantity: 0,
      status: "Archived",
      updated: "Sep 18, 2026",
      image: "8.png",
    },
    {
      name: "Compact Bluetooth Speaker",
      sku: "AUD-1820",
      category: "Electronics",
      price: 58.0,
      quantity: 12,
      status: "Draft",
      updated: "Sep 17, 2026",
      image: "9.png",
    },
  ];
  const $ = (id) => document.getElementById(id);
  const body = $("catalog-rows");
  const state = { quick: "all" };
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  const stockFor = (quantity) =>
    quantity === 0 ? "Out of stock" : quantity <= 8 ? "Low stock" : "In stock";

  function render() {
    const query = $("catalog-search").value.trim().toLowerCase();
    let rows = products.filter((item) => {
      const stock = stockFor(item.quantity);
      return (
        `${item.name} ${item.sku} ${item.category}`
          .toLowerCase()
          .includes(query) &&
        (!$("catalog-category").value ||
          item.category === $("catalog-category").value) &&
        (!$("catalog-status").value ||
          item.status === $("catalog-status").value) &&
        (!$("catalog-stock").value ||
          stock.toLowerCase() === $("catalog-stock").value.toLowerCase()) &&
        (state.quick === "all" ||
          (state.quick === "Low stock"
            ? stock === "Low stock"
            : item.status === state.quick))
      );
    });
    const sort = $("catalog-sort").value;
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-high") rows.sort((a, b) => b.price - a.price);
    if (sort === "price-low") rows.sort((a, b) => a.price - b.price);
    if (sort === "newest")
      rows.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    body.innerHTML = rows.length
      ? rows
          .map((item) => {
            const statusClass = {
              Active: "bg-success-transparent text-success",
              Draft: "bg-warning-transparent text-warning",
              Archived: "bg-secondary-transparent text-secondary",
            }[item.status];
            const inventoryClass =
              item.quantity === 0
                ? "text-danger"
                : item.quantity <= 8
                ? "text-warning"
                : "text-success";
            return `<tr>
        <td><input class="form-check-input catalog-row-select" type="checkbox" aria-label="Select ${
          item.name
        }"></td>
        <td><a class="d-flex align-items-center gap-3 text-default" href="product-details.html"><span class="product-row-image"><img src="../assets/images/ecommerce/png/${
          item.image
        }" alt="" loading="lazy"></span><span><strong class="d-block fw-medium">${
              item.name
            }</strong><small class="text-muted">${
              item.category
            }</small></span></a></td>
        <td class="text-muted">${item.sku}</td><td>${
              item.category
            }</td><td class="fw-semibold">${money(item.price)}</td>
        <td><span class="${inventoryClass}"><i class="ri-checkbox-blank-circle-fill fs-9 me-1"></i>${
              item.quantity
            } <span class="text-muted">(${stockFor(
              item.quantity
            )})</span></span></td>
        <td><span class="badge ${statusClass}">${
              item.status
            }</span></td><td class="text-muted">${item.updated}</td>
        <td><div class="dropdown"><button class="btn btn-light btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-label="Actions for ${
          item.name
        }"><i class="ri-more-2-fill"></i></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="product-details.html"><i class="ri-eye-line me-2"></i>View product</a></li><li><a class="dropdown-item" href="add-product.html"><i class="ri-edit-line me-2"></i>Edit product</a></li><li><button class="dropdown-item text-danger catalog-delete" type="button" data-sku="${
              item.sku
            }"><i class="ri-delete-bin-line me-2"></i>Delete</button></li></ul></div></td>
      </tr>`;
          })
          .join("")
      : '<tr><td colspan="9" class="text-center text-muted py-5">No products match these filters.</td></tr>';
    $(
      "catalog-result-count"
    ).textContent = `Showing ${rows.length} of ${products.length} demo products`;
  }

  [
    "catalog-search",
    "catalog-category",
    "catalog-status",
    "catalog-stock",
    "catalog-sort",
  ].forEach((id) =>
    $(id).addEventListener(id === "catalog-search" ? "input" : "change", render)
  );
  document.querySelectorAll("[data-quick-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      state.quick = button.dataset.quickFilter;
      document.querySelectorAll("[data-quick-filter]").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("active", active);
        chip.classList.toggle("btn-primary", active);
        chip.classList.toggle("text-black", active);
        chip.classList.toggle("btn-light", !active);
      });
      render();
    })
  );
  $("catalog-select-all").addEventListener("change", (event) =>
    document.querySelectorAll(".catalog-row-select").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    })
  );
  body.addEventListener("change", (event) => {
    if (event.target.matches(".catalog-row-select") && !event.target.checked)
      $("catalog-select-all").checked = false;
  });
  body.addEventListener("click", (event) => {
    const button = event.target.closest(".catalog-delete");
    if (!button) return;
    const index = products.findIndex((item) => item.sku === button.dataset.sku);
    const product = products[index];
    Swal.fire({
      title: "Delete product?",
      text: `Remove ${product.name} from this demo catalog?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;
      products.splice(index, 1);
      render();
      Swal.fire({
        title: "Deleted",
        text: `${product.name} was removed.`,
        icon: "success",
      });
    });
  });
  $("product-export").addEventListener("click", () => {
    const csv = [
      "Name,SKU,Category,Price,Quantity,Status",
      ...products.map((item) =>
        [
          item.name,
          item.sku,
          item.category,
          item.price,
          item.quantity,
          item.status,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "product-catalog.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  render();
})();
