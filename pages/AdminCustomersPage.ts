import { Locator, Page } from "@playwright/test";

export type AdminCustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
};

export class AdminCustomersPage {
  private readonly page: Page;
  private readonly txtUsername: Locator;
  private readonly txtPassword: Locator;
  private readonly btnLogin: Locator;
  private readonly customerMenu: Locator;
  private readonly customersLink: Locator;
  private readonly txtEmailFilter: Locator;
  private readonly btnFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.txtUsername = page.locator("#input-username");
    this.txtPassword = page.locator("#input-password");
    this.btnLogin = page.getByRole("button", { name: "Login", exact: true });
    this.customerMenu = page.locator("#menu-customer > a");
    this.customersLink = page.locator(
      '#menu-customer a[href*="route=customer/customer&"]',
    );
    this.txtEmailFilter = page.locator("#input-email");
    this.btnFilter = page.locator("#button-filter");
  }

  async login(username: string, password: string): Promise<void> {
    await this.txtUsername.fill(username);
    await this.txtPassword.fill(password);
    await this.btnLogin.click();
    await this.page.waitForURL(/route=common\/dashboard/);
  }

  async openCustomerList(): Promise<void> {
    await this.customerMenu.click();
    await this.customersLink.click();
    await this.page.waitForURL(/route=customer\/customer&/);
  }

  async searchByEmail(email: string): Promise<void> {
    await this.txtEmailFilter.fill(email);
    await this.btnFilter.click();
  }

  getCustomerRow(email: string): Locator {
    return this.page.locator("#customer tbody tr").filter({ hasText: email });
  }

  async openCustomerDetails(email: string): Promise<void> {
    await this.getCustomerRow(email)
      .locator('a[href*="route=customer/customer.form"]')
      .click();
  }

  async getCustomerDetails(): Promise<AdminCustomerDetails> {
    return {
      firstName: await this.page.locator("#input-firstname").inputValue(),
      lastName: await this.page.locator("#input-lastname").inputValue(),
      email: await this.page.locator("#input-email").inputValue(),
      enabled: await this.page.locator("#input-status").isChecked(),
    };
  }
}
