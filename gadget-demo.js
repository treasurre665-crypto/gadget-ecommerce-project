/* ============================================================================
   gadget-demo.js — demo signup + full checkout flow for the GADGET site
   Front-end only: signup + orders persist in localStorage, no backend.
   ----------------------------------------------------------------------------
   SETUP (2 small edits):
   1. In gadget.js, paste this BEFORE the final "});" of the file:
        // Exposed for gadget-demo.js (demo signup + checkout flow)
        window.GadgetDemo = { cart, saveCart, renderCart, showToast, closeCartDrawer };
   2. In index.html, add this AFTER the <script src="gadget.js"></script> line:
        <script src="gadget-demo.js"></script>
   Then: git add .  ->  git commit -m "Add demo signup and checkout flow"  ->  git push
   GitHub Pages rebuilds automatically (about 1-2 minutes).
   ============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const G = window.GadgetDemo || {};
  const toast = G.showToast || ((msg) => window.alert(msg));

  if (!window.GadgetDemo) {
    console.warn("[gadget-demo] window.GadgetDemo is missing — paste the snippet from this file's header into gadget.js.");
  }

  /* ---------------- 1. injected styles (site theme: dark navy + yellow) ---------------- */
  const css = `
    .demo-overlay{position:fixed;inset:0;background:rgba(4,10,24,.74);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;box-sizing:border-box}
    .demo-modal{background:#0d1830;color:#f2f5fa;border:1px solid rgba(246,180,14,.28);border-radius:16px;padding:24px;width:100%;max-width:430px;max-height:92vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.55);box-sizing:border-box}
    .demo-title{margin:0 0 4px;font-size:22px;color:#fff}
    .demo-sub{margin:0 0 14px;font-size:13px;color:#9aa7bd;line-height:1.5}
    .demo-center{text-align:center}
    .demo-ref{color:#f6b40e;letter-spacing:1px}
    .demo-label{display:block;font-size:13px;color:#c6d0e2;margin:0 0 12px}
    .demo-input{display:block;width:100%;margin-top:6px;padding:10px 12px;border-radius:10px;border:1px solid #2a3a5c;background:#0a1327;color:#fff;font-size:14px;box-sizing:border-box;font-family:inherit}
    textarea.demo-input{resize:vertical;min-height:60px}
    .demo-input:focus{outline:2px solid #f6b40e;border-color:#f6b40e}
    .demo-btn{display:block;width:100%;padding:12px;border:0;border-radius:10px;background:#f6b40e;color:#101828;font-weight:700;font-size:15px;cursor:pointer;margin-top:6px}
    .demo-btn:hover{filter:brightness(1.06)}
    .demo-link{display:block;width:100%;background:none;border:0;color:#9aa7bd;margin-top:10px;cursor:pointer;font-size:13px}
    .demo-link:hover{color:#fff}
    .demo-radio{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px;color:#e6ebf5;cursor:pointer}
    .demo-radio input{accent-color:#f6b40e}
    .demo-row{display:flex;justify-content:space-between;gap:12px;font-size:14px;color:#dbe3f2;padding:7px 0;border-bottom:1px dashed #22314f}
    .demo-total{font-weight:700;color:#fff;border-bottom:0;margin:6px 0 14px}
    .demo-check{width:56px;height:56px;border-radius:50%;background:#1f9d55;color:#fff;font-size:28px;display:flex;align-items:center;justify-content:center;margin:4px auto 12px}
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------------- 2. modal helpers ---------------- */
  function closeModal() {
    document.querySelectorAll(".demo-overlay").forEach((o) => o.remove());
    document.body.style.overflow = "";
  }
  function openModal(html) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "demo-overlay";
    const box = document.createElement("div");
    box.className = "demo-modal";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = html;
    overlay.appendChild(box);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    const first = box.querySelector("input");
    if (first) first.focus();
    return box;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function closeMobileNav() {
    const navbar = document.querySelector(".navbar");
    if (navbar) navbar.classList.remove("show");
    const toggle = document.getElementById("menuToggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  /* ---------------- 3. demo signup ----------------
     The header's "Sign Up" links point to signup.html (which doesn't exist,
     so they 404). We intercept them and open a working signup modal instead. */
  const USER_KEY = "gadgetUser";
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  };

  const signupLinks = [...document.querySelectorAll('a[href="signup.html"]')];

  function paintSignupLinks() {
    const user = getUser();
    const label = user ? `Hi, ${user.name.split(" ")[0]}` : "Sign Up";
    signupLinks.forEach((a) => { a.textContent = label; });
  }

  function openSignup() {
    const existing = getUser();
    if (existing) {
      // Already signed in -> this click logs out (demo).
      localStorage.removeItem(USER_KEY);
      paintSignupLinks();
      toast(`Logged out. See you soon, ${existing.name.split(" ")[0]}!`);
      return;
    }
    const box = openModal(`
      <h2 class="demo-title">Create your account</h2>
      <p class="demo-sub">Demo signup — your details are saved in this browser only.</p>
      <label class="demo-label">Full name
        <input id="suName" class="demo-input" type="text" placeholder="Adaeze Obi" autocomplete="name">
      </label>
      <label class="demo-label">Email
        <input id="suEmail" class="demo-input" type="email" placeholder="you@example.com" autocomplete="email">
      </label>
      <label class="demo-label">Password
        <input id="suPass" class="demo-input" type="password" placeholder="At least 6 characters" autocomplete="new-password">
      </label>
      <button id="suGo" class="demo-btn" type="button">Sign Up</button>
      <button id="suCancel" class="demo-link" type="button">Cancel</button>
    `);
    box.querySelector("#suCancel").addEventListener("click", closeModal);
    box.querySelector("#suGo").addEventListener("click", () => {
      const name = box.querySelector("#suName").value.trim();
      const email = box.querySelector("#suEmail").value.trim();
      const pass = box.querySelector("#suPass").value;
      if (name.length < 2) { toast("Please enter your name"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("Please enter a valid email address"); return; }
      if (pass.length < 6) { toast("Password must be at least 6 characters"); return; }
      localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
      closeModal();
      closeMobileNav();
      paintSignupLinks();
      toast(`Welcome, ${name.split(" ")[0]}! Your account is ready.`);
    });
  }

  signupLinks.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openSignup(); }));
  paintSignupLinks();

  /* ---------------- 4. demo checkout ----------------
     Replaces gadget.js's one-toast checkout with a full demo flow:
     order summary -> delivery details -> validation -> order reference
     -> saved to localStorage ("gadgetOrders") -> confirmation screen. */
  const ORDERS_KEY = "gadgetOrders";

  function openCheckout() {
    if (!G.cart) { toast("Setup incomplete: add window.GadgetDemo to gadget.js (see gadget-demo.js header)."); return; }
    const cart = G.cart;
    if (cart.length === 0) { toast("Your cart is empty"); return; }

    const user = getUser();
    const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
    const itemCount = cart.reduce((s, it) => s + it.qty, 0);
    const rows = cart
      .map((it) => `<div class="demo-row"><span>${esc(it.name)} × ${it.qty}</span><span>$${it.price * it.qty}</span></div>`)
      .join("");

    const box = openModal(`
      <h2 class="demo-title">Checkout</h2>
      <p class="demo-sub">Demo checkout — no real payment is taken.</p>
      ${rows}
      <div class="demo-row demo-total"><span>Subtotal</span><span>$${subtotal}</span></div>
      <label class="demo-label">Full name
        <input id="coName" class="demo-input" type="text" value="${esc(user ? user.name : "")}" autocomplete="name">
      </label>
      <label class="demo-label">Phone number
        <input id="coPhone" class="demo-input" type="tel" placeholder="0803 123 4567" autocomplete="tel">
      </label>
      <label class="demo-label">Delivery address
        <textarea id="coAddr" class="demo-input" rows="2" placeholder="Street, area, city"></textarea>
      </label>
      <span class="demo-label">Payment method</span>
      <label class="demo-radio"><input type="radio" name="coPay" value="Pay on delivery" checked> Pay on delivery</label>
      <label class="demo-radio"><input type="radio" name="coPay" value="Demo card"> Demo card</label>
      <button id="coPlace" class="demo-btn" type="button">Place Order — $${subtotal}</button>
      <button id="coCancel" class="demo-link" type="button">Back to cart</button>
    `);

    box.querySelector("#coCancel").addEventListener("click", closeModal);
    box.querySelector("#coPlace").addEventListener("click", () => {
      const name = box.querySelector("#coName").value.trim();
      const phone = box.querySelector("#coPhone").value.trim();
      const addr = box.querySelector("#coAddr").value.trim();
      const payEl = box.querySelector('input[name="coPay"]:checked');
      const pay = payEl ? payEl.value : "Pay on delivery";

      if (name.length < 2) { toast("Please enter your name"); return; }
      if (phone.replace(/\D/g, "").length < 7) { toast("Please enter a valid phone number"); return; }
      if (addr.length < 5) { toast("Please enter a delivery address"); return; }

      const ref = "GAD-" + Date.now().toString(36).toUpperCase().slice(-6);
      let orders = [];
      try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch { orders = []; }
      orders.push({
        ref,
        date: new Date().toISOString(),
        items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        subtotal, name, phone, addr, pay,
      });
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

      // Empty the cart through the main app's exposed API.
      if (G.cart) {
        G.cart.length = 0;
        if (G.saveCart) G.saveCart();
        if (G.renderCart) G.renderCart();
        if (G.closeCartDrawer) G.closeCartDrawer();
      }
      closeModal();

      const done = openModal(`
        <div class="demo-check">✓</div>
        <h2 class="demo-title demo-center">Order confirmed!</h2>
        <p class="demo-sub demo-center">Order reference: <strong class="demo-ref">${ref}</strong></p>
        <div class="demo-row"><span>Items</span><span>${itemCount}</span></div>
        <div class="demo-row demo-total"><span>Total${pay === "Pay on delivery" ? " (pay on delivery)" : ""}</span><span>$${subtotal}</span></div>
        <p class="demo-sub demo-center">Thanks ${esc(name.split(" ")[0])} — your gadgets are on the way!</p>
        <button id="doneClose" class="demo-btn" type="button">Continue shopping</button>
      `);
      done.querySelector("#doneClose").addEventListener("click", closeModal);
      toast("Order placed! Thank you for shopping with GADGET.");
    });
  }

  // Swap gadget.js's one-toast checkout handler for the full flow.
  // cloneNode(true) copies the button WITHOUT its old listeners.
  const oldBtn = document.getElementById("checkoutBtn");
  if (oldBtn) {
    const fresh = oldBtn.cloneNode(true);
    oldBtn.replaceWith(fresh);
    fresh.addEventListener("click", openCheckout);
  }
});