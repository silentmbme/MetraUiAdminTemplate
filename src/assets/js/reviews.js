(() => {
  "use strict";

  const reviews = [
    {
      id: "REV-5201",
      customer: "Olivia Wilson",
      avatar: "1.jpg",
      product: "Linen Table Set",
      rating: 5,
      date: "May 19, 2025",
      title: "Beautiful quality and finish",
      text: "The fabric feels lovely and the stitching is excellent. It looks even better in person. I will definitely be ordering another set.",
      helpful: 24,
      reply:
        "Thank you, Olivia! We’re so glad the set is a great fit for your home.",
    },
    {
      id: "REV-5198",
      customer: "James Taylor",
      avatar: "2.jpg",
      product: "TrailBlaze Runners",
      rating: 4,
      date: "May 18, 2025",
      title: "Comfortable for long walks",
      text: "Very comfortable and lightweight. Delivery took a little longer than expected, but the shoes are worth the wait.",
      helpful: 18,
      reply: "",
    },
    {
      id: "REV-5192",
      customer: "Ava Martinez",
      avatar: "3.jpg",
      product: "Arc Ceramic Lamp",
      rating: 5,
      date: "May 17, 2025",
      title: "A lovely addition to my desk",
      text: "The warm light and simple shape are exactly what I wanted. Packed securely and arrived in perfect condition.",
      helpful: 15,
      reply:
        "Thanks for sharing, Ava. We’re happy your lamp arrived safely and looks right at home.",
    },
    {
      id: "REV-5187",
      customer: "Noah Thompson",
      avatar: "4.jpg",
      product: "Stoneware Mug Pair",
      rating: 3,
      date: "May 16, 2025",
      title: "Nice mugs, smaller than expected",
      text: "The glaze is beautiful, but the cups hold less than I expected from the product photos.",
      helpful: 9,
      reply: "",
    },
    {
      id: "REV-5179",
      customer: "Sophia Chen",
      avatar: "5.jpg",
      product: "Everyday Tote",
      rating: 5,
      date: "May 15, 2025",
      title: "My new everyday bag",
      text: "The material feels durable and it fits everything I need for work. Great value for the price.",
      helpful: 31,
      reply:
        "Thank you, Sophia! We appreciate you taking the time to leave a review.",
    },
    {
      id: "REV-5170",
      customer: "Liam Anderson",
      avatar: "6.jpg",
      product: "Desk Organizer",
      rating: 2,
      date: "May 14, 2025",
      title: "One tray arrived scratched",
      text: "The organizer is useful, though one of the trays has a scratch on the corner. Support helped me quickly.",
      helpful: 6,
      reply: "",
    },
  ];

  const list = document.getElementById("review-list");
  const search = document.getElementById("review-search");
  const ratingFilter = document.getElementById("review-rating-filter");
  const replyFilter = document.getElementById("review-reply-filter");
  const modalElement = document.getElementById("review-reply-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  let activeReview = null;

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

  function renderStars(rating) {
    return Array.from(
      { length: 5 },
      (_, index) =>
        `<i class="${
          index < rating ? "ri-star-fill" : "ri-star-line"
        }" aria-hidden="true"></i>`
    ).join("");
  }

  function renderReviews() {
    const query = search.value.trim().toLowerCase();
    const selectedRating = ratingFilter.value;
    const selectedReply = replyFilter.value;
    const filteredReviews = reviews.filter((review) => {
      const searchableText =
        `${review.customer} ${review.product} ${review.title} ${review.text}`.toLowerCase();
      const matchesReply =
        !selectedReply ||
        (selectedReply === "replied" ? Boolean(review.reply) : !review.reply);
      return (
        searchableText.includes(query) &&
        (!selectedRating || review.rating === Number(selectedRating)) &&
        matchesReply
      );
    });

    list.innerHTML =
      filteredReviews
        .map(
          (review) => `
      <article class="review-item">
        <img class="review-avatar" src="../assets/images/users/${escapeHtml(
          review.avatar
        )}" alt="" loading="lazy" />
        <div class="review-content">
          <div class="review-item-heading"><div><span class="fw-semibold text-default">${escapeHtml(
            review.customer
          )}</span><span class="text-muted fs-12 ms-2">${escapeHtml(
            review.date
          )}</span><div class="review-item-stars" aria-label="${
            review.rating
          } out of 5 stars">${renderStars(
            review.rating
          )}<span class="review-verified"><i class="ri-checkbox-circle-fill" aria-hidden="true"></i>Verified purchase</span></div></div><a href="product-details.html" class="review-product-link">${escapeHtml(
            review.product
          )}<i class="ri-arrow-right-up-line ms-1" aria-hidden="true"></i></a></div>
          <h3>${escapeHtml(review.title)}</h3><p>${escapeHtml(review.text)}</p>
          ${
            review.reply
              ? `<div class="review-seller-reply"><span class="fw-semibold  text-default">Your reply</span><p>${escapeHtml(
                  review.reply
                )}</p></div>`
              : ""
          }
          <div class="review-item-footer"><span class="text-muted fs-12"><i class="ri-thumb-up-line me-1" aria-hidden="true"></i>${
            review.helpful
          } found this helpful</span><button class="btn btn-sm ${
            review.reply ? "btn-light" : "btn-dark"
          }" type="button" data-reply-id="${escapeHtml(review.id)}"><i class="${
            review.reply ? "ri-edit-line" : "ri-reply-line"
          } me-1" aria-hidden="true"></i>${
            review.reply ? "Edit reply" : "Reply"
          }</button></div>
        </div>
      </article>
    `
        )
        .join("") ||
      '<div class="review-empty"><i class="ri-chat-search-line" aria-hidden="true"></i><p class="mb-0">No reviews match your filters.</p></div>';

    document.getElementById("review-count").textContent =
      filteredReviews.length;
    document.getElementById(
      "review-results"
    ).textContent = `Showing ${filteredReviews.length} of ${reviews.length} reviews`;
    document.getElementById("unanswered-count").textContent = reviews.filter(
      (review) => !review.reply
    ).length;
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reply-id]");
    if (!button) return;
    activeReview = reviews.find(
      (review) => review.id === button.dataset.replyId
    );
    if (!activeReview) return;
    document.getElementById(
      "reply-review-context"
    ).textContent = `${activeReview.customer} · ${activeReview.product}`;
    document.getElementById("review-reply-text").value = activeReview.reply;
    modal.show();
  });

  document
    .getElementById("review-reply-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      if (!activeReview) return;
      activeReview.reply = document
        .getElementById("review-reply-text")
        .value.trim();
      if (!activeReview.reply) return;
      const customer = activeReview.customer;
      activeReview = null;
      modal.hide();
      renderReviews();
      document.getElementById(
        "review-feedback"
      ).textContent = `Your reply to ${customer} has been added in this demo.`;
    });

  [search, ratingFilter, replyFilter].forEach((control) => {
    control.addEventListener(
      control === search ? "input" : "change",
      renderReviews
    );
  });

  renderReviews();
})();
