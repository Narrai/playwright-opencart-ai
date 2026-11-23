import { Locator, Page } from "@playwright/test";

export class LoginPage {
  // Locators
  private readonly txtEmail: Locator;
  private readonly txtPassword: Locator;
  private readonly btnLogin: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.txtEmail = page.locator("#input-email");
    this.txtPassword = page.locator("#input-password");
    this.btnLogin = page.getByRole("button", { name: "Login", exact: true });
  }

  /**
   * Authenticates a customer with the supplied credentials.
   * @param email - Customer email address
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await this.txtEmail.fill(email);
      await this.txtPassword.fill(password);
      await this.btnLogin.click();
    } catch (error) {
      console.log(`Error logging in customer: ${error}`);
      throw error;
    }
  }
}
