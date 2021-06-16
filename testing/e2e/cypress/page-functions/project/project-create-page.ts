/// <reference types="cypress" />
import * as faker from 'faker';

export function navigate_project() {
  // Create project
  cy.contains('0 Projects found').should('be.visible')
  cy.visit('/projects/create')

  // Main Projects Page
  cy.contains('Create Project').should('be.visible')
}

// Add Coordinator takes variables or when omitted (NULL), it will use fake data)
export function add_coordinator_info(navloc, fname, lname, email, agency, share) {
  // Coordinator Info
  cy.get("span.MuiStepLabel-iconContainer").eq(navloc || 0).click() // Click on the Navigation bar
  cy.contains('Project Coordinator').should('be.visible')
  cy.get('#first_name').clear()
  cy.get('#first_name').type(fname || faker.name.firstName())
  cy.get('#last_name').clear()
  cy.get('#last_name').type(lname || faker.name.lastName())
  cy.get('#email_address').clear()
  cy.get('#email_address').type(email || faker.internet.email())
  cy.get('#coordinator_agency').click()

  // Agency is the sequential number for the shown agency in the drop down.
  cy.get('#coordinator_agency-option-' + (agency || faker.random.number({ 'min': 0, 'max': 264 }))).click()

  // Select the Radiobutton
  // the Share parameter takes 'Yes', 'No' or NULL, which defaults to 'Yes'

  cy.get('[name="share_contact_details"][type="radio"]').check({ force: share })
  //cy.get('input[name="share_contact_details"]').uncheck()
}

export function add_permits(navloc, permit_nr, permit_type, sampling) {
  // Permits Info
  // Permits Info
  cy.get("span.MuiStepLabel-iconContainer").eq(navloc || 1).click() // Click on the Navigation bar
  cy.contains('Permits').should('be.visible')
  cy.contains('Add Permit').click()
  cy.get('#permits\\.\\[0\\]\\.permit_number').clear()
  cy.get('#permits\\.\\[0\\]\\.permit_number').type(permit_nr || faker.random.number())
  cy.get('body').click()
  cy.get('#permits\\.\\[0\\]\\.permit_type').focus().type('{enter}')
  cy.get('[data-value="Wildlife Permit - General"]').click()
  cy.get('#permits\\.\\[0\\]\\.sampling_conducted').focus().type('{enter}')
  cy.get('[data-value="'+ (sampling || 'true') +'"]').click()
}



export function submit_project() {
  cy.get('[data-testid="stepper_submit"]').click()
}

export function next_page_project() {
  cy.get('[data-testid="stepper_next"]').click()
}

export function previous_page_project() {
  cy.get('[data-testid="stepper_previous"]').click()
}

export function cancel_project() {
  cy.get('[data-testid="stepper_cancel"]').click()
}

