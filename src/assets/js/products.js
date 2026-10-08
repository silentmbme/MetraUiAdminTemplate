(function () {
  "use strict";

  const products = [
    {
      id: "SPK001",
      name: "Smart TV 50 inch",
      image: "1.png",
      price: 699.99,
      oldPrice: 799.99,
      quantity: 42,
      status: "Published",
      category: "electronics",
      rating: "4.8",
      reviews: 124,
      sold: 328,
      label: "Bestseller",
    },
    {
      id: "SPK002",
      name: "Running Shoes",
      image: "2.png",
      price: 89.99,
      quantity: 0,
      status: "Draft",
      category: "fashion",
      rating: "4.6",
      reviews: 86,
      sold: 0,
      label: "New",
    },
    {
      id: "SPK003",
      name: "Wooden Dining Table",
      image: "3.png",
      price: 399.99,
      quantity: 18,
      status: "Published",
      category: "home",
      rating: "4.9",
      reviews: 42,
      sold: 86,
      label: "",
    },
    {
      id: "SPK004",
      name: "Wireless Earbuds",
      image: "4.png",
      price: 129.99,
      oldPrice: 159.99,
      quantity: 7,
      status: "Published",
      category: "electronics",
      rating: "4.7",
      reviews: 208,
      sold: 512,
      label: "Popular",
    },
    {
      id: "SPK005",
      name: "Leather Jacket",
      image: "5.png",
      price: 199.99,
      quantity: 24,
      status: "Archived",
      category: "fashion",
      rating: "4.5",
      reviews: 73,
      sold: 119,
      label: "",
    },
    {
      id: "SPK006",
      name: "Office Desk Chair",
      image: "7.png",
      price: 149.99,
      quantity: 0,
      status: "Draft",
      category: "home",
      rating: "4.4",
      reviews: 58,
      sold: 0,
      label: "",
    },
    {
      id: "SPK007",
      name: "Portable Speaker",
      image: "8.png",
      price: 79.99,
      quantity: 31,
      status: "Published",
      category: "electronics",
      rating: "4.6",
      reviews: 156,
      sold: 274,
      label: "Trending",
    },
    {
      id: "SPK008",
      name: "Summer Dress",
      image: "9.png",
      price: 59.99,
      quantity: 5,
      status: "Published",
      category: "fashion",
      rating: "4.8",
      reviews: 94,
      sold: 201,
      label: "Low stock",
    },
    {
      id: "SPK009",
      name: "Coffee Maker",
      image: "10.png",
      price: 59.99,
      quantity: 13,
      status: "Published",
      category: "home",
      rating: "4.5",
      reviews: 61,
      sold: 144,
      label: "",
    },
    {
      id: "SPK010",
      name: "Electric Kettle",
      image: "16.png",
      price: 39.99,
      quantity: 0,
      status: "Archived",
      category: "electronics",
      rating: "4.3",
      reviews: 37,
      sold: 0,
      label: "",
    },
  ];
  const grid = document.getElementById("products-grid");
  const search = document.getElementById("search-input");
  const category = document.getElementById("category-filter");
  const status = document.getElementById("status-filter");
  const stock = document.getElementById("stock-filter");
  const sort = document.getElementById("sort-filter");
  let quickCategory = "all";

  function render() {
    let visible = products.filter((product) => {
      const query = search.value.trim().toLowerCase();
      const stockState =
        product.quantity === 0
          ? "out-of-stock"
          : product.quantity <= 8
            ? "low-stock"
            : "in-stock";
      return (
        (product.name.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query) ||
          product.category.includes(query)) &&
        (!category.value || product.category === category.value) &&
        (!status.value ||
          status.value === "all" ||
          product.status.toLowerCase() === status.value) &&
        (!stock.value || stock.value === "all" || stockState === stock.value) &&
        (quickCategory === "all" || product.category === quickCategory)
      );
    });
    if (sort.value === "price") visible.sort((a, b) => a.price - b.price);
    if (sort.value === "name")
      visible.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = visible.length
      ? visible
        .map((product) => {
          const stockLabel =
            product.quantity === 0
              ? "Out of stock"
              : product.quantity <= 8
                ? "Low stock"
                : "In stock";
          const stockClass =
            product.quantity === 0
              ? "text-danger"
              : product.quantity <= 8
                ? "text-warning"
                : "text-success";
          const stockWidth = Math.min(product.quantity * 2, 100);
          return `
            <div class="col">
                <article class="card custom-card product-catalog-card">
                    <div class="product-catalog-image">
                        <div class="product-card-tags">
                            <span class="badge ${product.status === "Published"
              ? "bg-success-transparent"
              : product.status === "Draft"
                ? "bg-warning-transparent"
                : "bg-secondary-transparent"
            }">${product.status}</span>
                            ${product.label
              ? `<span class="badge bg-dark-transparent">${product.label}</span>`
              : ""
            }
                        </div>
                        <button class="btn btn-icon btn-white btn-sm product-favorite" type="button" aria-label="Add ${product.name
            } to favorites"><i class="ri-heart-line"></i></button>
                        <a href="product-details.html" aria-label="View ${product.name
            }"><img src="../assets/images/ecommerce/png/${product.image
            }" alt="${product.name}" loading="lazy"></a>
                        <div class="product-image-actions"><a href="product-details.html" class="btn btn-sm btn-dark"><i class="ri-eye-line me-1"></i>Quick view</a></div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                            <span class="text-muted fs-12 text-uppercase">${product.category
            } <span class="mx-1">·</span>${product.id}</span>
                            <span class="text-warning fs-13"><i class="ri-star-fill me-1"></i>${product.rating
            } <span class="text-muted">(${product.reviews
            })</span></span>
                        </div>
                        <a href="product-details.html" class="fw-semibold text-default product-catalog-name">${product.name
            }</a>
                        <div class="d-flex align-items-center justify-content-between mt-3">
                            <div><span class="fs-18 fw-semibold">$${product.price.toFixed(
              2
            )}</span>${product.oldPrice
              ? `<del class="text-muted fs-12 ms-2">$${product.oldPrice.toFixed(
                2
              )}</del>`
              : ""
            }</div>
                            <span class="${stockClass} fs-12 fw-medium"><i class="ri-checkbox-blank-circle-fill fs-9 me-1"></i>${stockLabel}</span>
                        </div>
                        <div class="product-stock-meter mt-3"><div class="d-flex justify-content-between text-muted fs-12 mb-1"><span>Inventory</span><span>${product.quantity
            } units</span></div><div class="progress progress-xs"><div class="progress-bar ${product.quantity <= 8 ? "bg-warning" : "bg-success"
            }" role="progressbar" style="width:${stockWidth}%" aria-valuenow="${product.quantity
            }" aria-valuemin="0" aria-valuemax="50"></div></div></div>
                        <div class="d-flex justify-content-between align-items-center text-muted fs-12 mt-3"><span><i class="ri-shopping-cart-2-line me-1"></i>${product.sold
            } sold</span><span>SKU ${product.id}</span></div>
                    </div>
                    <div class="card-footer bg-transparent d-flex gap-2">
                        <a href="cart.html" class="btn btn-dark"><i class="ri-shopping-cart-2-line"></i> Add To Cart</a>
                        <a href="add-product.html" class="btn btn-light btn-icon" aria-label="Edit ${product.name
            }"><i class="ri-edit-line"></i></a>
                        <button class="btn btn-light btn-icon product-delete" type="button" data-product-id="${product.id
            }" aria-label="Delete ${product.name
            }"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </article>
            </div>`;
        })
        .join("")
      : '<div class="col-12"><div class="text-center text-muted py-5">No matching products found.</div></div>';
    document.getElementById(
      "product-result-count"
    ).textContent = `${visible.length} items`;
    document.getElementById("product-visible-count").textContent =
      visible.length;
    grid.classList.toggle(
      "product-list-view",
      document.querySelector('[data-product-view="list"].active') !== null
    );
  }

  search.addEventListener("input", render);
  [category, status, stock, sort].forEach((control) =>
    control.addEventListener("change", () => {
      if (control === category) {
        quickCategory = category.value || "all";
        document
          .querySelectorAll("[data-product-category]")
          .forEach((chip) =>
            chip.classList.toggle(
              "active",
              chip.dataset.productCategory === quickCategory
            )
          );
      }
      render();
    })
  );
  document.querySelectorAll("[data-product-category]").forEach((button) =>
    button.addEventListener("click", () => {
      quickCategory = button.dataset.productCategory;
      category.value = quickCategory === "all" ? "" : quickCategory;
      document.querySelectorAll("[data-product-category]").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("active", active);
      });
      render();
    })
  );
  document.querySelectorAll("[data-product-view]").forEach((button) =>
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-view]").forEach((toggle) => {
        toggle.classList.toggle("active", toggle === button);
        toggle.setAttribute("aria-pressed", String(toggle === button));
      });
      render();
    })
  );
  grid.addEventListener("click", (event) => {
    const favorite = event.target.closest(".product-favorite");
    if (favorite) {
      favorite.classList.toggle("is-favorite");
      favorite.innerHTML = `<i class="${favorite.classList.contains("is-favorite")
          ? "ri-heart-fill"
          : "ri-heart-line"
        }"></i>`;
    }
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".product-delete");
    if (!button) return;
    const product = products.find(
      (item) => item.id === button.dataset.productId
    );
    Swal.fire({
      title: "Delete product?",
      text: `Remove ${product.name} from the product list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        products.splice(products.indexOf(product), 1);
        render();
        Swal.fire({
          title: "Deleted",
          text: `${product.name} was removed.`,
          icon: "success",
        });
      }
    });
  });
  render();
})();
