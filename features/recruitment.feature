Feature: Recruitment - Candidates flow
  As an HR user
  I want to add and shortlist a candidate, then verify the candidate appears in search results

  Background:
    Given I open the OrangeHRM login page
    And I login with admin credentials

  Scenario: Add, shortlist and search a candidate
    When I navigate to the Recruitment -> Candidates page
    Then I should see the Candidates page
    When I click Add Candidate and fill the form with candidate data
    And I save the candidate
    Then I should see the candidate profile with correct details
    When I shortlist the candidate with shortlist notes
    Then the candidate status should be updated to "Shortlisted"
    When I search for the candidate using the search form
    Then the search results should contain the candidate with expected vacancy and status

