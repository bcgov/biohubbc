import * as faker from 'faker';
import moment from 'moment';

const host = Cypress.env('host');
const username = Cypress.env('username');
const password = Cypress.env('password');

it('Login', function () {
  /* ==== Open Application and Login ==== */
  cy.visit(host);
  cy.get('[data-testid="login"]').click();

  cy.get('#username').clear();
  cy.get('#username').type(username);
  cy.get('#password').clear();
  cy.get('#password').type(password);
  cy.get('#kc-login').click();

  var i = 0;
  while (i < 1) {

    // Create project
    cy.get('body').click(); //Just needs a click to be able to continue.
    cy.get('#menu_projects').click();
    cy.contains('Create Project').click();

    // First Page
    cy.get('#first_name').clear();
    cy.get('#first_name').type(faker.name.firstName());
    cy.get('#last_name').clear();
    cy.get('#last_name').type(faker.name.lastName());
    cy.get('#email_address').clear();
    cy.get('#email_address').type(faker.internet.email());
    cy.get('#coordinator_agency').click();
    cy.get('#coordinator_agency-option-'+ faker.random.number({'min': 0,'max': 264})).click();
    // Select the Radiobutton
    cy.contains('Yes').click();

    cy.get('[data-testid="stepper_next"]').click();

    cy.contains('Add Permit').click();
    cy.get('#permits\\.\\[0\\]\\.permit_number').clear();
    cy.get('#permits\\.\\[0\\]\\.permit_number').type(faker.random.number());
    cy.get('body').click();
    cy.get('#permits\\.\\[0\\]\\.permit_type').focus().type('{enter}');
    cy.get('[data-value="Wildlife Permit - General"]').click();
    cy.get('[data-testid=stepper_next]').click();
    cy.get('#project_name').clear();
    cy.get('#project_name').type((faker.company.catchPhrase() + ' ' + faker.company.bs()).substring(0, 50));
    cy.get('body').click();
    cy.get('#project_type').focus().type('{enter}');
    cy.get('[data-value="'+ faker.random.number({'min': 1,'max': 4}) +'"]').click();
    cy.get('#project_activities').click();
    cy.get('#project_activities-option-1').click();
    cy.get('#project_activities-option-2').click();
    cy.get('#project_activities-option-3').click();
    cy.get('#start_date').type('2010-01-01');
    cy.get('#end_date').type('2022-01-01');
    cy.get('[data-testid="stepper_next"]').click();
    cy.get('#objectives').click();
    cy.get('#objectives').type(faker.lorem.paragraph());
    cy.get('#caveats').click();
    cy.get('#caveats').type(faker.lorem.paragraph());
    cy.get('[data-testid="stepper_next"]').click();
    cy.get('#regions').click();
    cy.get('#regions-option-0').click();
    cy.get('#regions-option-'+ faker.random.number({'min': 1,'max': 7})).click();
    cy.get('body').click();
    cy.get('.MuiGrid-container > :nth-child(2)').click({ force: true });
    cy.get('#location_description').click({ force: true });
    cy.get('#location_description').type(faker.lorem.paragraph());
    cy.get('[data-testid="stepper_next"]').click();
    cy.get('#focal_species').click({ force: true });
    cy.get('#focal_species-option-1').click();
    cy.get('#focal_species-option-2').click();
    cy.get('#focal_species-option-3').click();

    cy.get('#focal_species').click({ force: true });

    cy.get('#ancillary_species').click({ force: true });
    cy.get('#ancillary_species-option-5').click();
    cy.get('#ancillary_species').click({ force: true });

    cy.get('[data-testid="stepper_next"]').click();
    cy.get('[data-testid="stepper_submit"]').click();
    cy.get('#menu_projects').click();
    /* ==== End Cypress Studio ==== */
    i++;
  }
});
