/// <reference types="cypress" />
import * as faker from "faker";

export function navigate_project() {
  // Create project
  cy.visit("/admin/projects/create");
  cy.wait(5000);
  cy.get("h1").contains("Create Project").should("be.visible");
}

// Add Coordinator takes variables or when omitted (NULL), it will use fake data)
export function add_coordinator_info(
  navloc,
  fname,
  lname,
  email,
  agency,
  share
) {
  // Coordinator Info
  cy.get("span.MuiStepLabel-iconContainer")
    .eq(navloc || 0)
    .click(); // Click on the Navigation bar
  cy.contains("Project Coordinator").should("be.visible");
  cy.get("#first_name").clear();
  cy.get("#first_name").type(fname || faker.name.firstName());
  cy.get("#last_name").clear();
  cy.get("#last_name").type(lname || faker.name.lastName());
  cy.get("#email_address").clear();
  cy.get("#email_address").type(email || faker.internet.email());
  cy.get("#coordinator_agency").click();

  // Agency is the sequential number for the shown agency in the drop down.
  cy.get(
    "#coordinator_agency-option-" +
      (agency || faker.random.number({ min: 0, max: 264 }))
  ).click();

  // Select the Radiobutton
  // the Share parameter takes 'Yes', 'No' or NULL, which defaults to 'Yes'

  cy.get('[name="share_contact_details"][type="radio"]').check({
    force: share,
  });
  //cy.get('input[name="share_contact_details"]').uncheck()
}

export function add_permits(navloc, permit_nr, permit_type, sampling) {
  // Permits Info
  cy.get("span.MuiStepLabel-iconContainer")
    .eq(navloc || 1)
    .click(); // Click on the Navigation bar
  cy.contains("Permits").should("be.visible");
  cy.get("button").contains("Add New Permit").click();
  cy.get("#permits\\.\\[0\\]\\.permit_number").clear();
  cy.get("#permits\\.\\[0\\]\\.permit_number").type(
    permit_nr || faker.random.number()
  );
  cy.get("#permits\\.\\[0\\]\\.permit_type").focus().type("{enter}");
  cy.get('li[data-value="Wildlife Permit - General"]').click();
}

export function add_locations(description, kml_file) {
  // Locations
  cy.get("span.MuiStepLabel-iconContainer").eq(4).click(); // Click on the Navigation bar
  cy.contains("Locations").should("be.visible");
  cy.get("#location_description").type(description || faker.lorem.paragraph());
  cy.get('[data-testid="kml-file-upload"]').attachFile(
    kml_file || faker.random.number({ min: 1, max: 6 }) + ".kml"
  );
  cy.wait(5000);
}

export function add_project_info(
  project_name,
  project_type,
  start_date,
  end_date
) {
  cy.get("span.MuiStepLabel-iconContainer").eq(2).click(); // Click on the Navigation bar
  cy.contains("General Information").should("be.visible");
  cy.get("#project_name").clear();
  cy.get("#project_name").type(
    (
      project_name || faker.company.catchPhrase() + " " + faker.company.bs()
    ).substring(0, 50)
  );
  cy.get("body").click();
  cy.get("#project_type").focus().type("{enter}");
  if (project_type) {
    cy.get('[data-value="' + project_type + '"]').click();
  } else {
    cy.get(
      '[data-value="' + faker.random.number({ min: 1, max: 4 }) + '"]'
    ).click();
  }
  cy.get("#project_activities").click();
  cy.get("#project_activities-option-1").click();
  cy.get("#project_activities-option-2").click();
  cy.get("#project_activities-option-3").click();
  cy.get("#start_date").type(
    start_date ||
      "20" +
        faker.random.number({ min: 19, max: 21 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 })
  );
  cy.get("#end_date").type(
    end_date ||
      "20" +
        faker.random.number({ min: 22, max: 30 }) +
        "-" +
        faker.random.number({ min: 10, max: 12 }) +
        "-" +
        faker.random.number({ min: 10, max: 28 })
  );
}

export function add_objectives(objectives, caveats) {
  cy.get("span.MuiStepLabel-iconContainer").eq(3).click(); // Click on the Navigation bar
  cy.contains("Objectives").should("be.visible");
  cy.get("#objectives").click();
  cy.get("#objectives").type(objectives || faker.lorem.paragraph());
  cy.get("#caveats").click();
  cy.get("#caveats").type(caveats || faker.lorem.paragraph());
}

export function add_classification(classification, sub_classification1, sub_classification2) {

  var subclass1_count, subclass2_count;
  cy.get("span.MuiStepLabel-iconContainer").eq(5).click(); // Click on the Navigation bar
  cy.contains("IUCN Conservation Actions Classification").should("be.visible");

  cy.get("button").contains("Add Classification").click();
  cy.get("#classificationDetails\\.\\[0\\]\\.classification")
    .focus()
    .type("{enter}");
  if (classification) {
    cy.get('li[data-value="' + classification + '"]').click();
  } else {
    cy.get(
      'li[data-value="' + faker.random.number({ min: 1, max: 10 }) + '"]'
    ).click();
  }

  cy.get('#classificationDetails\\.\\[0\\]\\.subClassification1')
  .find('ul')
  .find('li')
  .then(li => {
    const subclass1_count = Cypress.$(li).length;
  });


  cy.get("#classificationDetails\\.\\[0\\]\\.subClassification1")
  .focus()
  .type("{enter}");
  if (sub_classification1) {
    cy.get('li[data-value="' + sub_classification1 + '"]').click();
  } else {
    cy.get(
      'li[data-value="' + faker.random.number({ min: 7, max: 9 }) + '"]'
    ).click();
  }

  cy.get("#classificationDetails\\.\\[0\\]\\.subClassification2")
  .focus()
  .type("{enter}");
  if (sub_classification2) {
    cy.get('li[data-value="' + sub_classification2 + '"]').click();
  } else {
    cy.get(
      'li[data-value="' + faker.random.number({ min: 38, max: 40 }) + '"]'
    ).click();
  }



  cy.wait(5000);
}

export function add_funding() {
  cy.get("span.MuiStepLabel-iconContainer").eq(6).click(); // Click on the Navigation bar
  cy.contains("Funding").should("be.visible");
  cy.wait(5000);
}

export function add_partnerships() {
  cy.get("span.MuiStepLabel-iconContainer").eq(7).click(); // Click on the Navigation bar
  cy.contains("Partnerships").should("be.visible");
  cy.wait(5000);
}

export function submit_project() {
  cy.get('button[data-testid="stepper_submit"]').click();
  cy.wait(5000);
}

export function next_page_project() {
  cy.get('button[data-testid="stepper_next"]').click();
}

export function previous_page_project() {
  cy.get('button[data-testid="stepper_previous"]').click();
}

export function cancel_project() {
  cy.get('button[data-testid="stepper_cancel"]').click();
}
