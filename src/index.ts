// Single-file implementation: types, data, cart logic, and UI

// ---------- Types ----------
export enum DessertCategory {
    Waffle = 'Waffle',
    CremeBrulee = 'Crème Brûlée',
    Macaron = 'Macaron',
    Tiramisu = 'Tiramisu',
    Baklava = 'Baklava',
    Pie = 'Pie',
    Cake = 'Cake',
    Brownie = 'Brownie',
    PannaCotta = 'Panna Cotta'
}

export type DessertId = string;
export type Currency = number;
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Dessert {
    id: DessertId;
    name: string;
    category: DessertCategory;
    price: Currency;
    image: string;
    description?: string;
    inStock: boolean;
}

export interface CartItem {
    dessert: Dessert;
    quantity: number;
    addedAt: Date;
}

export interface OrderDetails {
    items: CartItem[];
    subtotal: Currency;
    tax: Currency;
    total: Currency;
    createdAt: Date;
}

export interface Order {
    id: string;
    details: OrderDetails;
    status: OrderStatus;
    confirmedAt?: Date;
}

export type CartEvent =
    | { type: 'item-added'; item: CartItem }
    | { type: 'item-removed'; dessertId: DessertId }
    | { type: 'quantity-updated'; dessertId: DessertId; newQuantity: number }
    | { type: 'cart-cleared' }
    | { type: 'cart-total-changed'; total: Currency };

export type CartEventListener = (event: CartEvent) => void;

// ---------- Data ----------
const dessertsData: Dessert[] = [
    { id: 'waffle-berries', name: 'Waffle with Berries', category: DessertCategory.Waffle, price: 6.5, image: 'images/image-waffle-desktop.jpg', description: 'Fresh waffle topped with mixed berries and syrup', inStock: true },
    { id: 'creme-brulee', name: 'Vanilla Bean Crème Brûlée', category: DessertCategory.CremeBrulee, price: 7.0, image: 'images/image-creme-brulee-desktop.jpg', description: 'Classic French dessert with caramelized sugar top', inStock: true },
    { id: 'macaron-mix', name: 'Macaron Mix of Five', category: DessertCategory.Macaron, price: 8.0, image: 'images/image-macaron-desktop.jpg', description: 'Assortment of five colorful French macarons', inStock: true },
    { id: 'tiramisu', name: 'Classic Tiramisu', category: DessertCategory.Tiramisu, price: 5.5, image: 'images/image-tiramisu-desktop.jpg', description: 'Traditional Italian coffee-flavored dessert', inStock: true },
    { id: 'baklava', name: 'Pistachio Baklava', category: DessertCategory.Baklava, price: 4.0, image: 'images/image-baklava-desktop.jpg', description: 'Sweet pastry with pistachios', inStock: true },
    { id: 'pie-lemon', name: 'Lemon Meringue Pie', category: DessertCategory.Pie, price: 5.0, image: 'images/image-meringue-desktop.jpg', description: 'Tangy lemon filling topped with fluffy meringue', inStock: true },
    { id: 'cake-red-velvet', name: 'Red Velvet Cake', category: DessertCategory.Cake, price: 4.5, image: 'images/image-cake-desktop.jpg', description: 'Rich red velvet cake with cream cheese frosting', inStock: true },
    { id: 'brownie-salted-caramel', name: 'Salted Caramel Brownie', category: DessertCategory.Brownie, price: 5.5, image: 'images/image-brownie-desktop.jpg', description: 'Fudgy brownie with salted caramel drizzle', inStock: true },
    { id: 'panna-cotta', name: 'Vanilla Panna Cotta', category: DessertCategory.PannaCotta, price: 6.5, image: 'images/image-panna-cotta-desktop.jpg', description: 'Creamy Italian dessert with vanilla bean', inStock: true }
];

// ---------- Cart (class) ----------
class ShoppingCart {
    private items: Map<DessertId, CartItem> = new Map();
    private listeners: Set<CartEventListener> = new Set();

    addItem(dessert: Dessert, quantity: number = 1): void {
        if (quantity <= 0) throw new Error('Quantity must be greater than 0');
        if (!dessert.inStock) throw new Error('Dessert is not in stock');
        const existing = this.items.get(dessert.id);
        if (existing) {
            existing.quantity += quantity;
            this.emit({ type: 'quantity-updated', dessertId: dessert.id, newQuantity: existing.quantity });
        } else {
            const item: CartItem = { dessert, quantity, addedAt: new Date() };
            this.items.set(dessert.id, item);
            this.emit({ type: 'item-added', item });
        }
        this.emit({ type: 'cart-total-changed', total: this.getTotal() });
    }

    removeItem(dessertId: DessertId): void {
        if (this.items.delete(dessertId)) {
            this.emit({ type: 'item-removed', dessertId });
            this.emit({ type: 'cart-total-changed', total: this.getTotal() });
        }
    }

    updateQuantity(dessertId: DessertId, newQuantity: number): void {
        if (newQuantity <= 0) return this.removeItem(dessertId);
        const item = this.items.get(dessertId);
        if (item) {
            item.quantity = newQuantity;
            this.emit({ type: 'quantity-updated', dessertId, newQuantity });
            this.emit({ type: 'cart-total-changed', total: this.getTotal() });
        }
    }

    incrementItem(dessertId: DessertId): void {
        const item = this.items.get(dessertId);
        if (item) this.updateQuantity(dessertId, item.quantity + 1);
    }

    decrementItem(dessertId: DessertId): void {
        const item = this.items.get(dessertId);
        if (item) this.updateQuantity(dessertId, item.quantity - 1);
    }

    getTotal(): Currency {
        let total = 0;
        this.items.forEach((item) => {
            total += item.dessert.price * item.quantity;
        });
        return this.round(total);
    }

    getItemCount(): number {
        let count = 0;
        this.items.forEach((item) => (count += item.quantity));
        return count;
    }

    getItems(): CartItem[] {
        return Array.from(this.items.values());
    }

    clear(): void {
        this.items.clear();
        this.emit({ type: 'cart-cleared' });
        this.emit({ type: 'cart-total-changed', total: 0 });
    }

    get isEmpty(): boolean {
        return this.items.size === 0;
    }

    hasItem(dessertId: DessertId): boolean {
        return this.items.has(dessertId);
    }

    getItem(dessertId: DessertId): CartItem | undefined {
        return this.items.get(dessertId);
    }

    get size(): number {
        return this.items.size;
    }

    subscribe(listener: CartEventListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit(event: CartEvent): void {
        this.listeners.forEach((listener) => listener(event));
    }

    private round(value: number): number {
        return Math.round(value * 100) / 100;
    }

    getSummary() {
        const subtotal = this.getTotal();
        const tax = this.round(subtotal * 0.1);
        const total = this.round(subtotal + tax);
        return { itemCount: this.getItemCount(), subtotal, tax, total, items: this.getItems() };
    }
}

// ---------- Orders ----------
class OrderManager {
    private orders: Map<string, Order> = new Map();
    private orderCounter = 0;

    createOrder(cartItems: CartItem[]): Order {
        if (cartItems.length === 0) throw new Error('Cannot create order with empty cart');
        const subtotal = this.calc(cartItems);
        const tax = this.round(subtotal * 0.1);
        const total = this.round(subtotal + tax);
        this.orderCounter += 1;
        const id = `ORD-${Date.now()}-${this.orderCounter}`;
        const details: OrderDetails = { items: cartItems.map((c) => ({ ...c, addedAt: new Date(c.addedAt) })), subtotal, tax, total, createdAt: new Date() };
        const order: Order = { id, details, status: 'pending' };
        this.orders.set(id, order);
        return order;
    }

    confirmOrder(orderId: string): Order {
        const order = this.orders.get(orderId);
        if (!order) throw new Error(`Order not found: ${orderId}`);
        if (order.status !== 'pending') throw new Error(`Order ${orderId} is already ${order.status}`);
        order.status = 'confirmed';
        order.confirmedAt = new Date();
        return order;
    }

    getOrder(orderId: string): Order | undefined {
        return this.orders.get(orderId);
    }

    clearAll(): void {
        this.orders.clear();
        this.orderCounter = 0;
    }

    private calc(cartItems: CartItem[]): Currency {
        const subtotal = cartItems.reduce((sum, item) => sum + item.dessert.price * item.quantity, 0);
        return this.round(subtotal);
    }

    private round(value: number): number {
        return Math.round(value * 100) / 100;
    }
}

/**
 * Main UI Controller Class
 * Handles all DOM interactions and connects UI with business logic
 */
class UIController {
    private cart: ShoppingCart;
    private orderManager: OrderManager;

    constructor() {
        this.cart = new ShoppingCart();
        this.orderManager = new OrderManager();
        this.init();
    }

    /**
     * Initialize the application
     */
    private init(): void {
        this.renderDesserts();
        this.setupCartEventListeners();
        this.updateCartUI();
    }

    /**
     * Render all dessert cards
     */
    private renderDesserts(): void {
        const grid = document.getElementById('dessertsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        dessertsData.forEach((dessert) => {
            const card = this.createDessertCard(dessert);
            grid.appendChild(card);
        });
    }

    /**
     * Create a dessert card element
     */
    private createDessertCard(dessert: Dessert): HTMLElement {
        const card = document.createElement('div');
        card.className = 'dessert-card';
        card.dataset.dessertId = dessert.id;

        const isInCart = this.cart.hasItem(dessert.id);
        const cartItem = this.cart.getItem(dessert.id);

        card.innerHTML = `
            <div class="dessert-image-container">
                <img src="${dessert.image}" alt="${dessert.name}" class="dessert-image">
                <button class="add-to-cart-btn ${isInCart ? 'hidden' : ''}" data-dessert-id="${dessert.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20">
                        <g fill="#C73B0F" clip-path="url(#a)">
                            <path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/>
                            <path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/>
                        </g>
                        <defs>
                            <clipPath id="a"><path fill="#fff" d="M.333 0h20v20h-20z"/></clipPath>
                        </defs>
                    </svg>
                    Add to Cart
                </button>
                <div class="quantity-control ${!isInCart ? 'hidden' : ''}" data-dessert-id="${dessert.id}">
                    <button class="quantity-btn decrement" data-action="decrement" data-dessert-id="${dessert.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2">
                            <path fill="currentColor" d="M0 .375h10v1.25H0V.375Z"/>
                        </svg>
                    </button>
                    <span class="quantity-value">${cartItem?.quantity || 0}</span>
                    <button class="quantity-btn increment" data-action="increment" data-dessert-id="${dessert.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                            <path fill="currentColor" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="dessert-info">
                <p class="dessert-category">${dessert.category}</p>
                <p class="dessert-name">${dessert.name}</p>
                <p class="dessert-price">$${dessert.price.toFixed(2)}</p>
            </div>
        `;

        // Add event listeners
        const addToCartBtn = card.querySelector('.add-to-cart-btn') as HTMLButtonElement;
        const decrementBtn = card.querySelector('.quantity-btn.decrement') as HTMLButtonElement;
        const incrementBtn = card.querySelector('.quantity-btn.increment') as HTMLButtonElement;

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart(dessert));
        }

        if (decrementBtn) {
            decrementBtn.addEventListener('click', () => this.handleDecrement(dessert.id));
        }

        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => this.handleIncrement(dessert.id));
        }

        return card;
    }

    /**
     * Handle add to cart button click
     */
    private handleAddToCart(dessert: Dessert): void {
        this.cart.addItem(dessert, 1);
    }

    /**
     * Handle increment quantity
     */
    private handleIncrement(dessertId: string): void {
        this.cart.incrementItem(dessertId);
    }

    /**
     * Handle decrement quantity
     */
    private handleDecrement(dessertId: string): void {
        this.cart.decrementItem(dessertId);
    }

    /**
     * Handle remove item from cart
     */
    private handleRemoveItem(dessertId: string): void {
        this.cart.removeItem(dessertId);
    }

    /**
     * Setup cart event listeners
     */
    private setupCartEventListeners(): void {
        // Subscribe to cart changes
        this.cart.subscribe(() => {
            this.updateCartUI();
            this.updateDessertCards();
        });

        // Confirm order button
        const confirmBtn = document.getElementById('confirmOrderBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleConfirmOrder());
        }

        // Start new order button
        const startNewBtn = document.getElementById('startNewOrderBtn');
        if (startNewBtn) {
            startNewBtn.addEventListener('click', () => this.handleStartNewOrder());
        }
    }

    /**
     * Update cart UI
     */
    private updateCartUI(): void {
        const cartCount = document.getElementById('cartCount');
        const cartContent = document.getElementById('cartContent');
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        const totalAmount = document.getElementById('totalAmount');

        if (!cartCount || !cartContent || !cartItems || !cartSummary || !totalAmount) return;

        const summary = this.cart.getSummary();
        const isEmpty = this.cart.isEmpty;

        // Update cart count
        cartCount.textContent = summary.itemCount.toString();

        // Show/hide empty cart message
        if (isEmpty) {
            cartContent.classList.remove('hidden');
            cartItems.classList.add('hidden');
            cartSummary.classList.add('hidden');
        } else {
            cartContent.classList.add('hidden');
            cartItems.classList.remove('hidden');
            cartSummary.classList.remove('hidden');

            // Render cart items
            this.renderCartItems(cartItems);

            // Update total
            totalAmount.textContent = `$${summary.total.toFixed(2)}`;
        }
    }

    /**
     * Render cart items
     */
    private renderCartItems(container: HTMLElement): void {
        container.innerHTML = '';

        const items = this.cart.getItems();

        items.forEach((item) => {
            const itemElement = this.createCartItemElement(item);
            container.appendChild(itemElement);
        });
    }

    /**
     * Create a cart item element
     */
    private createCartItemElement(item: CartItem): HTMLElement {
        const element = document.createElement('div');
        element.className = 'cart-item';

        const itemTotal = item.dessert.price * item.quantity;

        element.innerHTML = `
            <div class="cart-item-info">
                <p class="cart-item-name">${item.dessert.name}</p>
                <div class="cart-item-details">
                    <span class="cart-item-quantity">${item.quantity}x</span>
                    <span class="cart-item-price">@ $${item.dessert.price.toFixed(2)}</span>
                    <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
                </div>
            </div>
            <button class="remove-item-btn" data-dessert-id="${item.dessert.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                    <path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
                </svg>
            </button>
        `;

        const removeBtn = element.querySelector('.remove-item-btn') as HTMLButtonElement;
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.handleRemoveItem(item.dessert.id));
        }

        return element;
    }

    /**
     * Update dessert cards to reflect cart state
     */
    private updateDessertCards(): void {
        dessertsData.forEach((dessert) => {
            const card = document.querySelector(`[data-dessert-id="${dessert.id}"]`) as HTMLElement;
            if (!card) return;

            const isInCart = this.cart.hasItem(dessert.id);
            const cartItem = this.cart.getItem(dessert.id);

            const addBtn = card.querySelector('.add-to-cart-btn') as HTMLElement;
            const quantityControl = card.querySelector('.quantity-control') as HTMLElement;
            const quantityValue = card.querySelector('.quantity-value') as HTMLElement;

            if (isInCart && cartItem) {
                card.classList.add('in-cart');
                addBtn?.classList.add('hidden');
                quantityControl?.classList.remove('hidden');
                if (quantityValue) {
                    quantityValue.textContent = cartItem.quantity.toString();
                }
            } else {
                card.classList.remove('in-cart');
                addBtn?.classList.remove('hidden');
                quantityControl?.classList.add('hidden');
            }
        });
    }

    /**
     * Handle confirm order
     */
    private handleConfirmOrder(): void {
        if (this.cart.isEmpty) return;

        const cartItems = this.cart.getItems();
        const order = this.orderManager.createOrder(cartItems);
        this.orderManager.confirmOrder(order.id);

        this.showOrderModal(order.id);
    }

    /**
     * Show order confirmation modal
     */
    private showOrderModal(orderId: string): void {
        const modal = document.getElementById('orderModal');
        const modalOrderItems = document.getElementById('modalOrderItems');
        const modalTotalAmount = document.getElementById('modalTotalAmount');

        if (!modal || !modalOrderItems || !modalTotalAmount) return;

        const order = this.orderManager.getOrder(orderId);
        if (!order) return;

        // Render order items
        modalOrderItems.innerHTML = '';
        order.details.items.forEach((item) => {
            const itemElement = this.createModalOrderItem(item);
            modalOrderItems.appendChild(itemElement);
        });

        // Add total row
        const totalRow = document.createElement('div');
        totalRow.className = 'modal-total';
        totalRow.innerHTML = `
            <span>Order Total</span>
            <span class="modal-total-amount">$${order.details.total.toFixed(2)}</span>
        `;
        modalOrderItems.appendChild(totalRow);

        // Show modal
        modal.classList.remove('hidden');
    }

    /**
     * Create modal order item element
     */
    private createModalOrderItem(item: CartItem): HTMLElement {
        const element = document.createElement('div');
        element.className = 'modal-order-item';

        const itemTotal = item.dessert.price * item.quantity;

        element.innerHTML = `
            <img src="${item.dessert.image}" alt="${item.dessert.name}" class="modal-item-image">
            <div class="modal-item-info">
                <p class="modal-item-name">${item.dessert.name}</p>
                <div class="modal-item-details">
                    <span class="modal-item-quantity">${item.quantity}x</span>
                    <span class="modal-item-price">@ $${item.dessert.price.toFixed(2)}</span>
                </div>
            </div>
            <span class="modal-item-total">$${itemTotal.toFixed(2)}</span>
        `;

        return element;
    }

    /**
     * Handle start new order
     */
    private handleStartNewOrder(): void {
        // Clear cart
        this.cart.clear();

        // Hide modal
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Reset current order
        this.updateCartUI();
        this.updateDessertCards();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
