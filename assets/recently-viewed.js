class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();
    this.recentlyViewedProducts = [];
    this.cart =
      document.querySelector('cart-notification') ||
      document.querySelector('cart-drawer');
    this.sectionId = this.closest('.shopify-section')?.id.replace(
      'shopify-section-',
      ''
    );
    this.title = this.getAttribute('title') || 'Recently Viewed Products';
    this.recentlyViewedProducts =
      JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
    this.render();
  }

  async addToCart(productId) {
    try {
      const formData = new FormData();
      formData.append('id', productId);
      formData.append('quantity', 1);

      // If there's a cart and sections exist, append relevant data
      if (this.cart) {
        formData.append(
          'sections',
          this.cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
        // this.cart.setActiveElement(document.activeElement);
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData // Use FormData here
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const data = await response.json();
      // Update cart drawer

      if (this.cart) {
        this.cart.renderContents(data); // Ensure you are passing the correct data
        if (this.cart && this.cart.classList.contains('is-empty'))
          this.cart.classList.remove('is-empty');
      } else {
        console.log('Cart drawer not found.');
      }
    } catch (error) {
      console.error(error);
      console.log('Error adding product to cart. Please try again.');
    }
  }

  render() {
    if (this.recentlyViewedProducts.length === 0) return;

    // Create grid container
    const productGrid = document.createElement('div');
    productGrid.classList.add('recently-viewed-products-grid');

    // Remove current product from recently viewed list
    this.recentlyViewedProducts = this.recentlyViewedProducts.filter(
      (product) => product.productId !== window.productId
    );

    // Create title element - only if there are products, and if the current product is not in the list
    if (this.recentlyViewedProducts.length >= 1) {
      const titleElement = document.createElement('h2');
      titleElement.classList.add('text-2xl', 'font-bold', 'mb-4');
      titleElement.textContent = this.title;
      this.appendChild(titleElement);
    }

    this.recentlyViewedProducts.forEach((product) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <a href="${product.productUrl}">
          <img src="${product.productImg}" alt="${product.productTitle}">
          <p class="font-semibold">${product.productTitle}</p>
          <p class="text-gray-700">${product.productPrice}</p>
        </a>
        <button class="add-to-cart-btn shopify-payment-button__button bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-id="${product.productVariantId}">Add to Cart</button>
      `;
      productGrid.appendChild(productCard);
    });

    this.appendChild(productGrid);

    // Add event listeners for "Add to Cart" buttons
    this.querySelectorAll('.add-to-cart-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        const productId = event.target.getAttribute('data-id');
        this.addToCart(productId);
      });
    });
  }
}

customElements.define('recently-viewed-products', RecentlyViewedProducts);
