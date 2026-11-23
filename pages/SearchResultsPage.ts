import { Locator, Page } from "@playwright/test";
import { ProductPage } from "./ProductPage";

export class SearchResultsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getProductLink(productName: string): Locator {
    return this.page
      .getByRole("heading", { name: productName, exact: true })
      .getByRole("link", { name: productName, exact: true });
  }

  /**
   * Checks whether the named product is present in search results.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true if the product link is visible
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    return this.getProductLink(productName).isVisible();
  }

  /**
   * Opens the named product from search results.
   * @param productName - Product name to open
   * @returns Promise<ProductPage> - Product details page object
   */
  async openProduct(productName: string): Promise<ProductPage> {
    try {
      await this.getProductLink(productName).click();
      return new ProductPage(this.page);
    } catch (error) {
      console.log(`Error opening product "${productName}": ${error}`);
      throw error;
    }
  }
}
