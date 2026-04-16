const { createApp } = Vue;

createApp({
  data() {
    return {
      products: window.products || [],
      searchQuery: "",
      currentYear: new Date().getFullYear(),
      isHomeVisible: true,
      isCartVisible: false,
      cart: JSON.parse(localStorage.getItem("as_store_cart") || "[]"),
      selectedCategory: "All",
      maxPrice: 250,
      isCartShaking: false,
      isScrolled: false,
      user: window.ASAuth ? window.ASAuth.getUser() : null,
    };
  },
  watch: {
    cart: {
      handler(newCart) {
        localStorage.setItem("as_store_cart", JSON.stringify(newCart));
      },
      deep: true,
    },
  },
  computed: {
    categories() {
      const cats = this.products.map((p) => p.category);
      return ["All", ...new Set(cats)];
    },
    filteredProducts() {
      const query = this.searchQuery.trim().toLowerCase();
      return this.products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        const matchesCategory =
          this.selectedCategory === "All" ||
          product.category === this.selectedCategory;

        const matchesPrice = product.price <= this.maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      });
    },
    cartCount() {
      return this.cart.reduce((count, item) => count + item.quantity, 0);
    },
    cartTotal() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },
    isLoggedIn() {
      return !!this.user;
    },
    userEmail() {
      return this.user ? this.user.email : "";
    },
    userDisplayName() {
      if (!this.userEmail) return "User";

      const localPart = this.userEmail.split("@")[0] || "user";
      const normalized = localPart.replace(/[._-]+/g, " ").trim();
      if (!normalized) return "User";

      return normalized
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    userInitial() {
      return this.userDisplayName
        ? this.userDisplayName.charAt(0).toUpperCase()
        : "U";
    },
  },
  methods: {
    syncAuthState() {
      this.user = window.ASAuth ? window.ASAuth.getUser() : null;
    },
    closeSidebarOffcanvas() {
      if (window.innerWidth >= 992 || typeof bootstrap === "undefined") return;
      const sidebarOffcanvas = document.getElementById("sidebarOffcanvas");
      if (!sidebarOffcanvas) return;

      const instance = bootstrap.Offcanvas.getInstance(sidebarOffcanvas);
      if (instance) {
        instance.hide();
      }
    },
    applyCategory(category) {
      this.selectedCategory = category;
      this.closeSidebarOffcanvas();
    },
    showHome() {
      this.isHomeVisible = true;
      this.isCartVisible = false;
      this.scrollToTop();
    },
    showCart() {
      this.isHomeVisible = false;
      this.isCartVisible = true;
      this.scrollToTop();
    },
    getProductById(productId) {
      return this.products.find((product) => product.id === productId);
    },
    getProductStock(productId) {
      const product = this.getProductById(productId);
      return product ? product.stock : 0;
    },
    addToCart(product) {
      if (!product || product.stock <= 0) return;

      const cartItem = this.cart.find((item) => item.id === product.id);
      if (cartItem) {
        cartItem.quantity++;
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }

      product.stock--;

      // Trigger shake animation
      this.isCartShaking = true;
      // Reset after animation duration (400ms)
      setTimeout(() => {
        this.isCartShaking = false;
      }, 400);
    },
    increaseQty(item) {
      const product = this.getProductById(item.id);
      if (!product || product.stock <= 0) return;

      item.quantity++;
      product.stock--;
    },
    decreaseQty(item) {
      const product = this.getProductById(item.id);
      if (!product) return;

      if (item.quantity > 1) {
        item.quantity--;
        product.stock++;
      } else {
        this.removeFromCart(item.id);
      }
    },
    removeFromCart(itemId) {
      const itemIndex = this.cart.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return;

      const [removedItem] = this.cart.splice(itemIndex, 1);
      const product = this.getProductById(removedItem.id);
      if (product) {
        product.stock += removedItem.quantity;
      }
    },
    goToCheckout() {
      if (this.cart.length === 0) return;

      this.syncAuthState();
      if (!this.isLoggedIn) {
        // Store current cart in session storage before redirecting
        sessionStorage.setItem(
          "as_store_cart_before_login",
          JSON.stringify(this.cart),
        );
        // Store the next page to redirect to after login
        window.location.href = "./login.html?next=checkout";
        return;
      }

      window.location.href = "checkout.html";
    },
    logout() {
      if (window.ASAuth) {
        window.ASAuth.logout();
      }
      this.syncAuthState();
    },
    clearFilters() {
      this.selectedCategory = "All";
      this.maxPrice = 250;
      this.searchQuery = "";
      this.closeSidebarOffcanvas();
    },
    handleScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      this.isScrolled = scrollTop > 200;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    initTooltips() {
      if (typeof bootstrap === "undefined") return;
      this.$nextTick(() => {
        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipTriggerList.forEach((el) => {
          const instance = bootstrap.Tooltip.getInstance(el);
          if (instance) {
            // Update content if tooltip already exists
            instance.setContent({
              ".tooltip-inner": el.getAttribute("data-bs-title"),
            });
          } else {
            // Initialize new tooltip
            new bootstrap.Tooltip(el);
          }
        });
      });
    },
    sanitizeCartItem(rawItem) {
      if (!rawItem || typeof rawItem !== "object") return null;
      const product = this.getProductById(rawItem.id);
      if (!product) return null;

      const quantity = Number(rawItem.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) return null;

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: Math.floor(quantity),
      };
    },
    reconcileCartWithStock() {
      const normalizedCart = [];

      this.cart.forEach((rawItem) => {
        const sanitizedItem = this.sanitizeCartItem(rawItem);
        if (!sanitizedItem) return;

        const product = this.getProductById(sanitizedItem.id);
        if (!product) return;

        const availableQty = Math.max(
          0,
          Math.min(sanitizedItem.quantity, product.stock),
        );
        if (availableQty <= 0) return;

        product.stock -= availableQty;
        normalizedCart.push({
          ...sanitizedItem,
          quantity: availableQty,
        });
      });

      this.cart = normalizedCart;
    },
  },
  mounted() {
    this.syncAuthState();
    this.initTooltips();
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll(); // Initial check for scroll position

    // Reconcile stock levels from the loaded cart
    // Check for cart data from session storage (e.g., after login redirect)
    const cartFromSession = sessionStorage.getItem(
      "as_store_cart_before_login",
    );
    if (cartFromSession) {
      this.cart = JSON.parse(cartFromSession);
      sessionStorage.removeItem("as_store_cart_before_login"); // Clean up
    }
    this.reconcileCartWithStock();
  },
  updated() {
    this.initTooltips();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
}).mount("#app");
