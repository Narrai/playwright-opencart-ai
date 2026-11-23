import { Locator, Page } from "@playwright/test";

export type CustomerRegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  telephone?: string;
  confirmPassword?: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly txtFirstName: Locator;
  private readonly txtLastName: Locator;
  private readonly txtEmail: Locator;
  private readonly txtTelephone: Locator;
  private readonly txtPassword: Locator;
  private readonly txtConfirmPassword: Locator;
  private readonly chkPrivacyPolicy: Locator;
  private readonly btnContinue: Locator;
  private readonly registrationConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.txtFirstName = page.locator("#input-firstname");
    this.txtLastName = page.locator("#input-lastname");
    this.txtEmail = page.locator("#input-email");
    this.txtTelephone = page.locator("#input-telephone");
    this.txtPassword = page.locator("#input-password");
    this.txtConfirmPassword = page.locator("#input-confirm");
    this.chkPrivacyPolicy = page.locator('input[name="agree"]');
    this.btnContinue = page.getByRole("button", { name: "Continue", exact: true });
    this.registrationConfirmation = page.getByRole("heading", {
      name: "Your Account Has Been Created!",
      exact: true,
    });
  }

  /**
   * Completes and submits customer registration.
   * @param customer - Customer registration details
   */
  async completeRegistration(customer: CustomerRegistrationData): Promise<void> {
    try {
      await this.txtFirstName.fill(customer.firstName);
      await this.txtLastName.fill(customer.lastName);
      await this.txtEmail.fill(customer.email);
      if (customer.telephone && (await this.txtTelephone.count()) > 0) {
        await this.txtTelephone.fill(customer.telephone);
      }
      await this.txtPassword.fill(customer.password);
      if (customer.confirmPassword && (await this.txtConfirmPassword.count()) > 0) {
        await this.txtConfirmPassword.fill(customer.confirmPassword);
      }
      await this.chkPrivacyPolicy.check();
      await this.btnContinue.click();
    } catch (error) {
      console.log(`Error completing customer registration: ${error}`);
      throw error;
    }
  }

  /**
   * Waits for the account-created confirmation after registration.
   */
  async waitForRegistrationSuccess(): Promise<void> {
    await this.registrationConfirmation.waitFor({ state: "visible" });
  }
}
