import { Locator, Page } from "@playwright/test";

export class AccountPage {
  // Locators
  private readonly accountDashboard: Locator;
  private readonly logoutConfirmation: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    const main = page.getByRole("main");
    this.accountDashboard = main.getByRole("heading", {
      name: "My Account",
      exact: true,
    });
    this.logoutConfirmation = main.getByRole("heading", {
      name: "Account Logout",
      exact: true,
    });
  }

  /**
   * Waits for the authenticated customer dashboard.
   */
  async waitForDashboard(): Promise<void> {
    await this.accountDashboard.waitFor({ state: "visible" });
  }

  /**
   * Checks whether the logout confirmation page is displayed.
   * @returns Promise<boolean> - true if the Account Logout heading is visible
   */
  async isLogoutConfirmationDisplayed(): Promise<boolean> {
    return this.logoutConfirmation.isVisible();
  }
}
