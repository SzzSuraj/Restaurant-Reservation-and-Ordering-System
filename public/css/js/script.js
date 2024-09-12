let cart = [];
let totalPrice = 0;

function addToCart(item, price) {
    // Add item to cart
    cart.push({ item, price });
    totalPrice += price;

    // Update Cart Display
    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById('cart-items');
    let totalElement = document.getElementById('total-price');

    // Clear cart display
    cartItems.innerHTML = '';

    // Display items in cart
    cart.forEach((cartItem, index) => {
        let itemElement = document.createElement('p');
        itemElement.textContent = `${cartItem.item} - $${cartItem.price.toFixed(2)}`;
        cartItems.appendChild(itemElement);
    });

    // Display total price
    totalElement.innerHTML = `<p>Total: $${totalPrice.toFixed(2)}</p>`;
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
    } else {
        alert('Proceeding to checkout with total: $' + totalPrice.toFixed(2));
        // Here you would add the functionality to handle checkout (e.g., redirect to payment page)
    }
}
