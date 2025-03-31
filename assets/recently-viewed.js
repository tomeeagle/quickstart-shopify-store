// Web component that gets recently viewed products from the Shopify API and displays them in a grid
class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();
    this.recentlyViewedProducts = [];
    this.sectionId = this.closest('.shopify-section').id.replace(
      'shopify-section-',
      ''
    );
    this.recentlyViewedProducts =
      JSON.parse(localStorage.getItem(`recently_viewed_products`)) || [];
    this.render();
  }

  render() {
    console.log(this.recentlyViewedProducts);
    if (this.recentlyViewedProducts.length === 0) return;

    const productGrid = document.createElement('div');
    productGrid.classList.add(
      'recently-viewed-products-grid'
    );
    // Filter out the current product from the recently viewed products
    console.log("Product ID: ",   window.productId);
    this.recentlyViewedProducts = this.recentlyViewedProducts.filter(
      (product) => {
        return product.productId !== window.productId;
      }
    );

    this.recentlyViewedProducts.forEach((product) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <a href="${product.productUrl}">
          <img src="${product.productImg}" alt="${product.productTitle}">
          <h2>${product.productTitle}</h2>
        </a>
      `;
      productGrid.appendChild(productCard);
    });

    console.log(productGrid);
    this.appendChild(productGrid);
  }
}
customElements.define('recently-viewed-products', RecentlyViewedProducts);
