document.addEventListener('DOMContentLoaded', () => {
  const productList = document.querySelector('.product-list');
  const cartItemsContainer = document.querySelector('.cart-items-container');
  const cartQuantity = document.getElementById('cart-quantity');
  const totalPriceEl = document.getElementById('total-price');
  const emptyCartMessage = document.querySelector('.empty-cart-message');
  const confirmOrderButton = document.querySelector('.confirm-order-button');
  const orderConfirmationModal = document.querySelector('.order-confirmation-modal');
  const startNewOrderButton = document.querySelector('.start-new-order-button');
  const modalTotalPrice = document.getElementById('modal-total-price');
  const modalOrderSummary = document.querySelector('.order-summary');

  let cart = [];

  // Fetch products and render them
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      renderProducts(data);
    });

  function renderProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
      const productCard = document.createElement('article');
      productCard.classList.add('product-card');
      productCard.dataset.id = product.name; // Use name as a unique ID

      productCard.innerHTML = `
        <div class="product-image">
          <picture>
            <source media="(min-width: 1440px)" srcset="${product.image.desktop}">
            <source media="(min-width: 768px)" srcset="${product.image.tablet}">
            <img src="${product.image.mobile}" alt="${product.name}" class="product-thumbnail">
          </picture>
        </div>
        <div class="product-details">
          <p class="product-category">${product.category}</p>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart-button">
            <img src="./assets/images/icon-add-to-cart.svg" alt="Add to cart icon">
            Add to Cart
          </button>
          <div class="quantity-selector" style="display: none;">
            <button class="decrement-quantity"><img src="./assets/images/icon-decrement-quantity.svg" alt="Decrement quantity"></button>
            <span class="quantity">1</span>
            <button class="increment-quantity"><img src="./assets/images/icon-increment-quantity.svg" alt="Increment quantity"></button>
          </div>
        </div>
      `;
      productList.appendChild(productCard);
    });
  }

  // Event Listeners
  productList.addEventListener('click', handleProductClick);
  cartItemsContainer.addEventListener('click', handleCartClick);
  confirmOrderButton.addEventListener('click', showOrderConfirmation);
  startNewOrderButton.addEventListener('click', startNewOrder);

  function handleProductClick(event) {
    const target = event.target.closest('button');
    if (!target) return;

    const productCard = target.closest('.product-card');
    const productName = productCard.dataset.id;

    if (target.classList.contains('add-to-cart-button')) {
      addToCart(productName);
    } else if (target.classList.contains('increment-quantity')) {
      updateQuantity(productName, 1);
    } else if (target.classList.contains('decrement-quantity')) {
      updateQuantity(productName, -1);
    }
  }

  function handleCartClick(event) {
      const target = event.target.closest('button');
      if (target && target.classList.contains('remove-item-button')) {
          const itemName = target.dataset.id;
          removeFromCart(itemName);
      }
  }

  function addToCart(productName) {
    const productInCart = cart.find(item => item.name === productName);
    if (productInCart) {
      productInCart.quantity++;
    } else {
      fetch('data.json')
        .then(response => response.json())
        .then(data => {
          const productToAdd = data.find(p => p.name === productName);
          cart.push({ ...productToAdd, quantity: 1 });
          updateCart();
        });
    }
    updateCart();
  }

  function updateQuantity(productName, change) {
    const productInCart = cart.find(item => item.name === productName);
    if (productInCart) {
      productInCart.quantity += change;
      if (productInCart.quantity <= 0) {
        removeFromCart(productName);
      } else {
        updateCart();
      }
    }
  }
  
  function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCart();
  }

  function updateCart() {
    renderCartItems();
    updateCartTotals();
    updateProductCardStates();
    toggleEmptyMessage();
  }
  
  function renderCartItems() {
    cartItemsContainer.innerHTML = ''; 
    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <div class="item-details">
          <h4 class="item-name">${item.name}</h4>
          <div class="item-quantity-price">
            <span class="item-quantity">${item.quantity}x</span>
            <span class="item-price-per-unit">@ $${item.price.toFixed(2)}</span>
            <span class="item-total-price">$${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        </div>
        <button class="remove-item-button" data-id="${item.name}">
            <img src="./assets/images/icon-remove-item.svg" alt="Remove item">
        </button>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
  }
  
  function updateCartTotals() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    cartQuantity.textContent = totalItems;
    totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
  }

  function updateProductCardStates() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      const productName = card.dataset.id;
      const itemInCart = cart.find(item => item.name === productName);
      const addToCartBtn = card.querySelector('.add-to-cart-button');
      const quantitySelector = card.querySelector('.quantity-selector');
      const quantitySpan = card.querySelector('.quantity');

      if (itemInCart) {
        addToCartBtn.style.display = 'none';
        quantitySelector.style.display = 'flex';
        quantitySpan.textContent = itemInCart.quantity;
      } else {
        addToCartBtn.style.display = 'inline-flex';
        quantitySelector.style.display = 'none';
      }
    });
  }

  function toggleEmptyMessage() {
    if (cart.length === 0) {
      if(!document.querySelector('.empty-cart-message')) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your added items will appear here</p>';
      }
    } else {
        const emptyMsg = document.querySelector('.empty-cart-message');
        if(emptyMsg) emptyMsg.remove();
    }
  }

  function showOrderConfirmation() {
    if (cart.length === 0) return;

    modalOrderSummary.innerHTML = '';
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.classList.add('cart-item'); // Reuse cart-item styling
        orderItem.innerHTML = `
          <div class="item-details">
            <img src="${item.image.thumbnail}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 4px; margin-right: 1rem;">
            <div>
              <h4 class="item-name">${item.name}</h4>
              <div class="item-quantity-price">
                <span class="item-quantity">${item.quantity}x</span>
                <span class="item-price-per-unit">@ $${item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <span class="item-total-price" style="font-weight: 700;">$${(item.quantity * item.price).toFixed(2)}</span>
        `;
        modalOrderSummary.appendChild(orderItem);
    });

    modalTotalPrice.textContent = totalPriceEl.textContent;
    orderConfirmationModal.style.display = 'flex';
  }

  function startNewOrder() {
    cart = [];
    updateCart();
    orderConfirmationModal.style.display = 'none';
  }
});
