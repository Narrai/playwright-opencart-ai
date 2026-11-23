import { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly totalRow: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.totalRow = page.getByRole("row", { name: /^Total\b/ });
  }

  private getProductRow(productName: string): Locator {
    return this.page.getByRole("row").filter({ hasText: productName });
  }

  /**
   * Checks whether the named product appears in the cart.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true if the product row is visible
   */
  async isProductInCart(productName: string): Promise<boolean> {
    return this.getProductRow(productName).isVisible();
  }

  /**
   * Reads the quantity displayed for the named cart product.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.getProductRow(productName)
      .locator('input[name^="quantity"]')
      .inputValue();
  }

  /**
   * Reads the unit price displayed for the named cart product.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product unit price
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    return this.getProductRow(productName).locator("td").nth(4).innerText();
  }

  /**
   * Reads the cart grand total.
   * @returns Promise<string> - Displayed cart total
   */
  async getCartTotal(): Promise<string> {
    return this.totalRow.locator("td").last().innerText();
  }
}
