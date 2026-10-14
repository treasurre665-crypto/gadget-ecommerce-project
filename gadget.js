

document.addEventListener("DOMContentLoaded", () => {

  
  const toast = document.getElementById("toast");
  let toastTimer;

  
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

 

  const menuToggle = document.getElementById("menuToggle");
  const navbar = document.querySelector(".navbar");

  menuToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });


  const watchedSections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  watchedSections.forEach((section) => spy.observe(section));



  const searchInput = document.getElementById("search");
  const headerSearchBtn = document.getElementById("headerSearchBtn");

  headerSearchBtn.addEventListener("click", () => {
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    searchInput.focus();
  });


  const productGrid = document.getElementById("productGrid");
  const products = Array.from(productGrid.querySelectorAll(".product-card"));
  const noResults = document.getElementById("noResults");
  const pagination = document.querySelector(".pagination");
  const pageButtons = document.querySelectorAll(".page-number");

  const searchForm = document.getElementById("searchForm");
  const categoryTrigger = document.getElementById("categoryTrigger");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const categoryLabel = document.getElementById("categoryLabel");
  const categoryOptions = document.querySelectorAll(".category-option");

  let currentPage = 1;
  let currentCategory = "all";
  let searchTerm = "";

  function isFiltering() {
    return searchTerm.trim() !== "" || currentCategory !== "all";
  }

  function renderProducts() {
    let visibleCount = 0;

    products.forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      const matchesSearch = name.includes(searchTerm.trim().toLowerCase());
      const matchesCategory = currentCategory === "all" || card.dataset.category === currentCategory;

      const visible = isFiltering()
        ? matchesSearch && matchesCategory
        : card.dataset.page === String(currentPage);

      card.style.display = visible ? "" : "none";
      if (visible) visibleCount++;
    });

    noResults.hidden = visibleCount !== 0;
    pagination.style.display = isFiltering() ? "none" : "flex";
  }

  
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderProducts();
  });
  searchForm.addEventListener("submit", (e) => e.preventDefault());

  
  categoryTrigger.addEventListener("click", () => {
    const isOpen = !categoryDropdown.hidden;
    categoryDropdown.hidden = isOpen;
    categoryTrigger.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".category-dropdown-wrapper")) {
      categoryDropdown.hidden = true;
      categoryTrigger.setAttribute("aria-expanded", "false");
    }
  });

  categoryOptions.forEach((option) => {
    option.addEventListener("click", () => {
      currentCategory = option.dataset.category;
      categoryLabel.textContent = option.textContent;
      categoryOptions.forEach((o) => o.classList.toggle("active", o === option));
      categoryDropdown.hidden = true;
      categoryTrigger.setAttribute("aria-expanded", "false");
      renderProducts();
    });
  });

  
  pageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = btn.dataset.page === "next"
        ? (currentPage < 4 ? currentPage + 1 : 1)
        : Number(btn.dataset.page);

      pageButtons.forEach((b) => b.classList.toggle("active", b.dataset.page === String(currentPage)));
      renderProducts();
    });
  });

  renderProducts(); 

  const timerEl = document.getElementById("offerTimer");
  let secondsLeft = 12 * 3600 + 12 * 60 + 12; // matches the "12h : 12m : 12s" starting point

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
  }

  const countdown = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(countdown);
      timerEl.textContent = "Deal ended";
      timerEl.classList.add("ended");
      return;
    }
    timerEl.textContent = formatTime(secondsLeft);
  }, 1000);

  

  const cart = JSON.parse(localStorage.getItem("gadgetCart") || "[]");

  const cartButton = document.getElementById("cartButton");
  const cartCount = document.querySelector(".cart-count");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCartBtn = document.getElementById("closeCart");
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function saveCart() {
    localStorage.setItem("gadgetCart", JSON.stringify(cart));
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      cartItemsEl.innerHTML = cart
        .map(
          ({ name, price, qty }) => `
        <div class="cart-item" data-name="${name}">
          <span class="cart-item-name">${name}</span>
          <button type="button" class="cart-item-remove">Remove</button>
          <div class="cart-item-qty">
            <div class="qty-controls">
              <button type="button" class="qty-decrease" aria-label="Decrease quantity">-</button>
              <span>${qty}</span>
              <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">$${price * qty}</span>
          </div>
        </div>`
        )
        .join("");
    }

    const subtotal = cart.reduce((sum, { price, qty }) => sum + price * qty, 0);
    cartSubtotalEl.textContent = `$${subtotal}`;
    cartCount.textContent = cart.reduce((sum, { qty }) => sum + qty, 0);
  }

  function openCart() {
    closeFavorites(); 
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
    cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  
  function closeAllDrawers() {
    closeCartDrawer();
    closeFavorites();
  }

  cartButton.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCartDrawer);
  cartOverlay.addEventListener("click", closeAllDrawers);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDrawers();
  });

  
  function addToCart(name, price) {
    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast(`${name} added to cart`);
  }

  
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const name = card.querySelector("h3").textContent;
      const price = Number(card.querySelector(".price").textContent.replace("$", ""));
      addToCart(name, price);
    });
  });

  
  cartItemsEl.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;

    const name = row.dataset.name;
    const item = cart.find((i) => i.name === name);
    const index = cart.findIndex((i) => i.name === name);

    if (e.target.classList.contains("qty-increase")) {
      item.qty += 1;
    } else if (e.target.classList.contains("qty-decrease")) {
      item.qty -= 1;
      if (item.qty <= 0) cart.splice(index, 1);
    } else if (e.target.classList.contains("cart-item-remove")) {
      cart.splice(index, 1);
    } else {
      return;
    }

    saveCart();
    renderCart();
  });

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty");
      return;
    }
    showToast("Order placed! Thank you for shopping with GADGET.");
    cart.length = 0;
    saveCart();
    renderCart();
    closeCartDrawer();
  });

  renderCart();
  const favorites = JSON.parse(localStorage.getItem("gadgetFavorites") || "[]");

  const favoriteButtons = document.querySelectorAll(".product-name-row button");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const wishlistCount = document.querySelector(".wishlist-count");
  const favoritesDrawer = document.getElementById("favoritesDrawer");
  const favoritesItemsEl = document.getElementById("favoritesItems");
  const closeFavoritesBtn = document.getElementById("closeFavorites");

  function saveFavorites() {
    localStorage.setItem("gadgetFavorites", JSON.stringify(favorites));
  }

  
  function syncFavoriteButtons() {
    favoriteButtons.forEach((btn) => {
      const name = btn.closest(".product-card").querySelector("h3").textContent;
      const isSaved = favorites.some((item) => item.name === name);
      const icon = btn.querySelector("i");

      btn.classList.toggle("saved", isSaved);
      icon.classList.toggle("fa-solid", isSaved);
      icon.classList.toggle("fa-regular", !isSaved);
    });
  }

  function renderFavorites() {
    if (favorites.length === 0) {
      favoritesItemsEl.innerHTML =
        '<p class="cart-empty">No favorites yet. Tap the bookmark on any product to save it.</p>';
    } else {
      favoritesItemsEl.innerHTML = favorites
        .map(
          ({ name, price }) => `
        <div class="cart-item" data-name="${name}">
          <span class="cart-item-name">${name}</span>
          <button type="button" class="cart-item-remove">Remove</button>
          <div class="cart-item-qty">
            <span class="cart-item-price">$${price}</span>
            <button type="button" class="fav-add-btn">Add to cart</button>
          </div>
        </div>`
        )
        .join("");
    }

    
    const hasFavorites = favorites.length > 0;
    const heartIcon = wishlistBtn.querySelector("i");
    wishlistCount.textContent = favorites.length;
    wishlistBtn.classList.toggle("has-favorites", hasFavorites);
    heartIcon.classList.toggle("fa-solid", hasFavorites);
    heartIcon.classList.toggle("fa-regular", !hasFavorites);

    syncFavoriteButtons();
  }

  
  function toggleFavorite(name, price) {
    const index = favorites.findIndex((item) => item.name === name);

    if (index === -1) {
      favorites.push({ name, price });
      showToast(`${name} saved to favorites`);
    } else {
      favorites.splice(index, 1);
      showToast(`${name} removed from favorites`);
    }

    saveFavorites();
    renderFavorites();
  }

  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const name = card.querySelector("h3").textContent;
      const price = Number(card.querySelector(".price").textContent.replace("$", ""));
      toggleFavorite(name, price);
    });
  });

  function openFavorites() {
    closeCartDrawer(); 
    favoritesDrawer.classList.add("open");
    cartOverlay.classList.add("show");
    favoritesDrawer.setAttribute("aria-hidden", "false");
  }

  function closeFavorites() {
    favoritesDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
    favoritesDrawer.setAttribute("aria-hidden", "true");
  }

  wishlistBtn.addEventListener("click", openFavorites);
  closeFavoritesBtn.addEventListener("click", closeFavorites);

  
  favoritesItemsEl.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;

    const item = favorites.find((i) => i.name === row.dataset.name);
    if (!item) return;

    if (e.target.classList.contains("cart-item-remove")) {
      toggleFavorite(item.name, item.price); // it's already saved, so this removes it
    } else if (e.target.classList.contains("fav-add-btn")) {
      addToCart(item.name, item.price);
    }
  });

  renderFavorites(); 
  const testimonials = [
    {
      name: "Cameron Williamson",
      role: "Project head of Turbo Electrolight",
      quote:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste voluptatem rerum vero ducimus odio praesentium in aliquam, est quasi similique!",
      image: "images/cameron-williamson.jpg",
    },
    {
      name: "Aisha Bello",
      role: "Marketing Lead, BrightWave Media",
      quote:
        "GADGET has become our go-to for office tech. Orders arrive fast, and the support team actually replies.",
      initials: "AB",
    },
    {
      name: "David Chen",
      role: "Small Business Owner",
      quote:
        "I've bought three cameras and a drone from GADGET so far. Every product page is accurate to what actually arrives.",
      initials: "DC",
    },
  ];

  let testimonialIndex = 0;
  const quoteEl = document.getElementById("testimonialQuote");
  const nameEl = document.getElementById("testimonialName");
  const roleEl = document.getElementById("testimonialRole");
  const imageWrap = document.querySelector(".testimonial-image");
  const progressBar = document.querySelector(".testimonial-progress span");

  function renderTestimonial() {
    const t = testimonials[testimonialIndex];
    quoteEl.textContent = t.quote;
    nameEl.textContent = t.name;
    roleEl.textContent = t.role;

    imageWrap.innerHTML = t.image
      ? `<img src="${t.image}" alt="${t.name}">`
      : `<div class="testimonial-initials">${t.initials}</div>`;

    progressBar.style.width = `${((testimonialIndex + 1) / testimonials.length) * 100}%`;
  }

  document.getElementById("prevTestimonial").addEventListener("click", () => {
    testimonialIndex = testimonialIndex === 0 ? testimonials.length - 1 : testimonialIndex - 1;
    renderTestimonial();
  });

  document.getElementById("nextTestimonial").addEventListener("click", () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial();
  });

  renderTestimonial(); 

  const newsletterForm = document.querySelector(".newsletter-form");

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      showToast("Please enter a valid email address");
      return;
    }

    showToast("Thanks for subscribing!");
    emailInput.value = "";
  });


  document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Exposed for gadget-demo.js (demo signup + checkout flow)
  window.GadgetDemo = { cart, saveCart, renderCart, showToast, closeCartDrawer };
});