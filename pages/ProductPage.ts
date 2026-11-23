import { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productTitle: Locator;
  private readonly txtQuantity: Locator;
  private readonly btnAddToCart: Locator;
  private readonly addToCartConfirmation: Locator;
  private readonly linkShoppingCart: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productTitle = page.locator("h1");
    this.txtQuantity = page.locator("#input-quantity");
    this.btnAddToCart = page.locator("#button-cart");
    this.addToCartConfirmation = page.locator(".alert-success");
    this.linkShoppingCart = this.addToCartConfirmation.locator(
      'a[href*="route=checkout/cart"]',
    );
  }

  /**
   * Checks whether the requested product details are displayed.
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product heading matches
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    return this.productTitle.filter({ hasText: productName }).isVisible();
  }

  /**
   * Sets the quantity for the product.
   * @param quantity - Quantity to add
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.txtQuantity.fill(quantity);
  }

  /**
   * Adds the product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    try {
      await this.btnAddToCart.click();
    } catch (error) {
      console.log(`Error adding product to cart: ${error}`);
      throw error;
    }
  }

  /**
   * Returns the add-to-cart confirmation message.
   * @returns Promise<string> - Confirmation message text
   */
  async getAddToCartConfirmation(): Promise<string> {
    return this.addToCartConfirmation.innerText();
  }

  /**
   * Opens the cart using the success message link.
   */
  async openShoppingCart(): Promise<void> {
    await this.linkShoppingCart.click();
  }
}
