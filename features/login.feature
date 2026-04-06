@regression
Feature: Login and Session Management
  As a user
  I want to login, validate session, and logout from OrangeHRM

  @smoke @login
  Scenario: Successful login with valid admin credentials
    Given I open the OrangeHRM login page
    When I login with admin credentials
    Then I should see the dashboard
    When I logout from the application
    Then I should see the login page

  @negative @login
  Scenario Outline: Login fails with invalid credentials
    Given I open the OrangeHRM login page
    When I enter username "<username>" and password "<password>"
    Then I should see the error message "<error>"

    Examples:
      | username    | password  | error               |
      | Admin       | wrongpass | Invalid credentials |
      | invalidUser | admin123  | Invalid credentials |
