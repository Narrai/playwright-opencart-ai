import { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly btnMyAccount: Locator;
  private readonly linkRegister: Locator;
  private readonly linkLogin: Locator;
  private readonly linkLogout: Locator;
  private readonly txtSearch: Locator;
  private readonly btnSearch: Locator;
  private readonly storefrontHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.btnMyAccount = page.getByRole("button", {
      name: "My Account",
      exact: true,
    });
    this.linkRegister = page.locator(
      '.dropdown-menu.show a[href*="route=account/register"]',
    );
    this.linkLogin = page.locator(
      '.dropdown-menu.show a[href*="route=account/login"]',
    );
    this.linkLogout = page.locator(
      '.dropdown-menu.show a[href*="route=account/logout"]',
    );
    this.txtSearch = page.locator('input[name="search"]');
    this.btnSearch = page.locator(
      'form[action*="route=common/search.redirect"] button[type="submit"]',
    );
    this.storefrontHeader = this.btnMyAccount;
  }

  /**
   * Checks that the storefront header is displayed.
   * @returns Promise<boolean> - true if the storefront header is visible
   */
  async isStorefrontDisplayed(): Promise<boolean> {
    return this.storefrontHeader.isVisible();
  }

  /**
   * Opens the customer account menu.
   */
  async openMyAccountMenu(): Promise<void> {
    await this.btnMyAccount.click();
  }

  /**
   * Navigates to customer registration.
   */
  async navigateToRegistration(): Promise<void> {
    await this.openMyAccountMenu();
    await this.linkRegister.click();
  }

  /**
   * Navigates to customer login.
   */
  async navigateToLogin(): Promise<void> {
    await this.openMyAccountMenu();
    await this.linkLogin.click();
  }

  /**
   * Logs out the current customer from the account menu.
   */
  async logout(): Promise<void> {
    await this.openMyAccountMenu();
    await this.linkLogout.click();
  }

  /**
   * Searches the storefront for a product.
   * @param productName - Product name to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.txtSearch.fill(productName);
    await this.btnSearch.click();
  }
}
