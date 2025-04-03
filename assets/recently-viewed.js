class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();

    this.recentlyViewedProducts = JSON.parse(localStorage.getItem('recently_viewed_rca')) || [];
    this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    this.sectionId = this.closest('.shopify-section')?.id.replace('shopify-section-', '');
    this.title = this.getAttribute('title') || 'Recently Viewed Products';

    this.render();
  }

  async addToCart(productId) {
    try {
      const formData = new FormData();
      formData.append('id', productId);
      formData.append('quantity', 1);

      // Append section data if cart exists
      if (this.cart) {
        formData.append(
          'sections',
          this.cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const data = await response.json();

      // Update cart drawer
      if (this.cart) {
        this.cart.renderContents(data);
        if (this.cart.classList.contains('is-empty')) {
          this.cart.classList.remove('is-empty');
        }
      } else {
        console.log('Cart drawer not found.');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  }

  render() {
    if (this.recentlyViewedProducts.length === 0) return;

    // Remove current product from recently viewed list
    this.recentlyViewedProducts = this.recentlyViewedProducts.filter(
      (product) => product.productId !== window.productId
    );

    if (this.recentlyViewedProducts.length === 0) return;

    // Create title element
    const titleElement = document.createElement('h2');
    titleElement.classList.add('text-2xl', 'font-bold', 'mb-4');
    titleElement.textContent = this.title;
    this.appendChild(titleElement);

    // Create grid container
    const productGrid = document.createElement('div');
    productGrid.classList.add('recently-viewed-products-grid');

    this.recentlyViewedProducts.forEach((product) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <a href="${product.productUrl}">
          <img src="${product.productImg}" alt="${product.productTitle}">
          <p class="font-semibold">${product.productTitle}</p>
          <p class="text-gray-700">${product.productPrice}</p>
        </a>
        <button class="add-to-cart-btn cursor-pointer bg-black hover:bg-blue-700 text-white py-2 px-4" data-id="${product.productVariantId}">
          Add to Cart
        </button>
      `;
      productGrid.appendChild(productCard);
    });

    this.appendChild(productGrid);

    // Attach event listeners to "Add to Cart" buttons
    this.querySelectorAll('.add-to-cart-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        const productId = event.target.getAttribute('data-id');
        this.addToCart(productId);
      });
    });
  }
}

customElements.define('recently-viewed-products', RecentlyViewedProducts);
