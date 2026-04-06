@regression
Feature: Recruitment - Candidates flow
  As an HR user
  I want to add and shortlist a candidate, then verify the candidate appears in search results

  Background:
    Given I open the OrangeHRM login page
    And I login with admin credentials

  @smoke @candidate
  Scenario: Add, shortlist and search a candidate
    When I navigate to the Recruitment -> Candidates page
    Then I should see the Candidates page
    When I click Add Candidate
    Then I should see the Add Candidate page
    When I fill the candidate form with candidate data
    And I save the candidate
    Then I should see the candidate profile with correct details
    When I shortlist the candidate with shortlist notes
    Then the candidate status should be updated to "Application Initiated"
    When I search for the candidate using the search form
    Then the search results should contain the candidate with expected vacancy and status

  @smoke @vacancy
  Scenario: Create a vacancy with attachment and verify in search
    When I navigate to the Recruitment -> Vacancies page
    Then I should see the Vacancies page
    When I click Add Vacancy
    Then I should see the Add Vacancy page
    When I fill the vacancy form with vacancy data
    And I save the vacancy
    When I add an attachment to the vacancy
    Then the vacancy attachment should be visible in the attachments table
    When I navigate to the Recruitment -> Candidates page from vacancy
    And I navigate to the Recruitment -> Vacancies page
    Then I should see the Vacancies page
    When I search for the created vacancy on the Vacancies page
    Then the search results should contain the created vacancy

