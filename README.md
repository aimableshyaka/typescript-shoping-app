# TypeScript Dessert Shop

A fully-featured shopping cart application built with TypeScript, implementing both functional and object-oriented programming paradigms.

## 🎯 Features

- **Type-Safe TypeScript Implementation** with strict mode enabled
- **Functional Programming Approach** with immutable cart operations
- **Object-Oriented Design** with ShoppingCart and OrderManager classes
- **Event System** for reactive cart updates
- **Order Management** with full order lifecycle handling

## 📁 Project Structure

```
shoping App/
├── src/
│   ├── components/
│   │   ├── ShoppingCart.ts       # OOP ShoppingCart class with events
│   │   └── OrderManager.ts       # Order creation and management
│   ├── data/
│   │   └── desserts.ts           # Dessert data array
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces and enums
│   ├── utils/
│   │   └── cartFunctions.ts      # Functional cart operations
│   └── index.ts                  # Main application entry point
├── styles/
│   └── styles.css                # Application styling
├── images/                       # Dessert images
├── index.html                    # Main HTML file
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile TypeScript:
```bash
npm run build
```

3. Watch mode for development:
```bash
npm run watch
```

4. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server (install globally: npm i -g http-server)
http-server
```

## 📚 Implementation Details

### Phase 1: Foundation & Type Definitions

#### Type Definitions (`src/types/index.ts`)
- ✅ `Dessert` interface with id, name, category, price, image, description, inStock
- ✅ `CartItem` interface with dessert, quantity, addedAt
- ✅ `DessertCategory` enum with 9 categories
- ✅ Type aliases: `DessertId`, `Currency`, `OrderStatus`
- ✅ `CartEvent` discriminated union for event system
- ✅ `OrderDetails` and `Order` interfaces

#### Dessert Data (`src/data/desserts.ts`)
- ✅ Array of 9 dessert objects
- ✅ Proper typing with enum values
- ✅ Matching UI images data

### Phase 2: Functional Cart Logic

#### Cart Functions (`src/utils/cartFunctions.ts`)

**Task 2.1: Add to Cart**
```typescript
addToCart(cart: CartItem[], dessert: Dessert, quantity: number): CartItem[]
```
- Validates quantity > 0
- Handles duplicates by updating quantity
- Returns new array (immutable)
- Checks stock availability

**Task 2.2: Remove from Cart**
```typescript
removeFromCart(cart: CartItem[], dessertId: string): CartItem[]
```
- Removes item by ID
- Handles non-existent items gracefully
- Returns new array (immutable)

**Task 2.3: Update Quantity**
```typescript
updateQuantity(cart: CartItem[], dessertId: string, newQuantity: number): CartItem[]
```
- Updates item quantity
- Removes item if quantity is 0
- Includes increment/decrement helpers
- Returns new array (immutable)

**Task 2.4: Calculate Total**
```typescript
calculateTotal(cart: CartItem[]): CartTotals
```
- Calculates subtotal, tax (10%), and grand total
- Rounds to 2 decimal places
- Returns `{ subtotal, tax, total }`

### Phase 3: Object-Oriented Approach

#### ShoppingCart Class (`src/components/ShoppingCart.ts`)

**Task 3.1: Cart Management**
```typescript
class ShoppingCart {
    private items: Map<string, CartItem>
    
    // Core methods
    addItem(dessert: Dessert, quantity: number): void
    removeItem(dessertId: DessertId): void
    updateQuantity(dessertId: DessertId, newQuantity: number): void
    incrementItem(dessertId: DessertId): void
    decrementItem(dessertId: DessertId): void
    
    // Getters
    getTotal(): Currency
    getItemCount(): number
    getItems(): CartItem[]
    getItem(dessertId: DessertId): CartItem | undefined
    getSummary(): CartSummary
    
    // Properties
    get isEmpty(): boolean
    get size(): number
    hasItem(dessertId: DessertId): boolean
    
    clear(): void
}
```

**Task 3.2: Event System**
```typescript
// Subscribe to cart events
subscribe(listener: CartEventListener): () => void

// Events emitted:
// - item-added
// - item-removed
// - quantity-updated
// - cart-cleared
// - cart-total-changed
```

#### OrderManager Class (`src/components/OrderManager.ts`)

**Task 3.3: Order Management**
```typescript
class OrderManager {
    createOrder(cartItems: CartItem[]): Order
    confirmOrder(orderId: string): Order
    cancelOrder(orderId: string): Order
    completeOrder(orderId: string): Order
    
    getOrder(orderId: string): Order | undefined
    getAllOrders(): Order[]
    getOrdersByStatus(status: OrderStatus): Order[]
    
    getTotalRevenue(): Currency
    getStatistics(): OrderStatistics
}
```

## 🎨 UI Components

The application includes:
- **Dessert Grid**: Displays all available desserts
- **Add to Cart Buttons**: With quantity controls
- **Shopping Cart Sidebar**: Shows cart items, total, and checkout
- **Order Confirmation Modal**: Displays order summary
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🔄 State Management

The application uses an event-driven architecture:
1. User interacts with UI (add/remove items)
2. `UIController` calls `ShoppingCart` methods
3. `ShoppingCart` emits events
4. Event listeners update the UI reactively

## 🧪 Testing Scenarios

You can test the following:
1. Add items to cart
2. Increment/decrement quantities
3. Remove items from cart
4. View cart total updates
5. Confirm order
6. Start new order (clears cart)

## 📝 Code Quality

- ✅ TypeScript strict mode enabled
- ✅ No implicit any
- ✅ Strict null checks
- ✅ Full type coverage
- ✅ Immutable functional operations
- ✅ Event-driven architecture
- ✅ Clean separation of concerns

## 🎯 Design Patterns Used

1. **Observer Pattern**: Event system for cart updates
2. **Repository Pattern**: OrderManager for data management
3. **MVC Pattern**: Separation of data, logic, and UI
4. **Factory Pattern**: Creating cart items and orders
5. **Singleton Pattern**: Single cart and order manager instances

## 📖 API Reference

### Functional API

```typescript
import * as CartFunctions from './utils/cartFunctions';

// Add to cart
const newCart = CartFunctions.addToCart(cart, dessert, 2);

// Remove from cart
const updatedCart = CartFunctions.removeFromCart(cart, dessertId);

// Calculate total
const totals = CartFunctions.calculateTotal(cart);
```

### Object-Oriented API

```typescript
import { ShoppingCart } from './components/ShoppingCart';
import { OrderManager } from './components/OrderManager';

const cart = new ShoppingCart();
const orderManager = new OrderManager();

// Cart operations
cart.addItem(dessert, 2);
cart.incrementItem(dessertId);
cart.removeItem(dessertId);

// Subscribe to changes
const unsubscribe = cart.subscribe((event) => {
    console.log('Cart changed:', event);
});

// Create order
const order = orderManager.createOrder(cart.getItems());
orderManager.confirmOrder(order.id);
```

## 🌟 Features Highlight

### Immutable Operations
All functional cart operations return new arrays, preserving immutability:
```typescript
const newCart = addToCart(oldCart, dessert, 1);
// oldCart remains unchanged
```

### Type Safety
Full TypeScript coverage with strict checks:
```typescript
// Compile-time type checking
const dessert: Dessert = { ... };
cart.addItem(dessert, 1); // ✅ Type-safe
cart.addItem("invalid", 1); // ❌ Compile error
```

### Event System
Reactive updates using observer pattern:
```typescript
cart.subscribe((event) => {
    switch(event.type) {
        case 'item-added':
            console.log('Item added:', event.item);
            break;
        case 'cart-total-changed':
            updateTotalDisplay(event.total);
            break;
    }
});
```

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 👨‍💻 Author

Built as a comprehensive TypeScript learning project demonstrating both functional and object-oriented programming paradigms.
