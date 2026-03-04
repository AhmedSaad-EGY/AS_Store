const { createApp } = Vue;

createApp({
    data() {
        return {
            products: products,
            searchQuery: '',
            currentYear: new Date().getFullYear(),
            isHomeVisible: true,
            isCartVisible: false,
            cart: [],
            user: window.ASAuth ? window.ASAuth.getUser() : null
        };
    },
    computed: {
        filteredProducts() {
            const query = this.searchQuery.trim().toLowerCase();
            return this.products.filter(product => {
                return product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query);
            });
        },
        cartCount() {
            return this.cart.reduce((count, item) => count + item.quantity, 0);
        },
        cartTotal() {
            return this.cart.reduce((total, item) =>
                total + (item.price * item.quantity), 0);
        },
        isLoggedIn() {
            return !!this.user;
        },
        userEmail() {
            return this.user ? this.user.email : '';
        }
    },
    methods: {
        syncAuthState() {
            this.user = window.ASAuth ? window.ASAuth.getUser() : null;
        },
        showHome() {
            this.isHomeVisible = true;
            this.isCartVisible = false;
        },
        showCart() {
            this.isHomeVisible = false;
            this.isCartVisible = true;
        },
        getProductById(productId) {
            return this.products.find(product => product.id === productId);
        },
        getProductStock(productId) {
            const product = this.getProductById(productId);
            return product ? product.stock : 0;
        },
        addToCart(product) {
            if (!product || product.stock <= 0) return;

            const cartItem = this.cart.find(item => item.id === product.id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }

            product.stock--;
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
            const itemIndex = this.cart.findIndex(item => item.id === itemId);
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
                window.location.href = "login.html?next=checkout";
                return;
            }

            window.location.href = "checkout.html";
        },
        logout() {
            if (window.ASAuth) {
                window.ASAuth.logout();
            }
            this.syncAuthState();
        }
    },
    mounted() {
        this.syncAuthState();
    }
}).mount('#app');
