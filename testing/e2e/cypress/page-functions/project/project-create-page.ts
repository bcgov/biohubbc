/// <reference types="cypress" />
import * as faker from "faker";

export function navigate_project() {
  // Create project
  cy.wait(5000);
  cy.visit("/admin/projects/create");
  cy.wait(5000);
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
  cy.contains("Project Contact").should("be.visible");
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
  cy.get("div.MuiPaper-root > ul.MuiList-root > li.MuiButtonBase-root", {
    includeShadowDom: true,
  })
    .eq(faker.random.number({ min: 0, max: 2 }))
    .click({ force: true });
}

export function add_locations(description, kml_file) {
  // Locations
  cy.get("span.MuiStepLabel-iconContainer").eq(4).click(); // Click on the Navigation bar
  cy.contains("Locations").should("be.visible");
  cy.get("#location_description").type(description || faker.lorem.paragraph());
  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (kml_file || faker.random.number({ min: 1, max: 9 })) + ".kml"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
}

export function add_gpx(gpx_file) {
  // GPX Flight Path upload
  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (gpx_file || faker.random.number({ min: 1, max: 8 })) + ".gpx"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
}

export function add_zip(zip_file) {
  // Shapefile zip upload
  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + (zip_file || faker.random.number({ min: 1, max: 1 })) + ".zip"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();
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
  var i = 0;
  while (i < faker.random.number({ min: 1, max: 4 })) {
    cy.get(
      "#project_activities-option-" + faker.random.number({ min: 1, max: 7 })
    ).click();
    i++;
  }
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

export function add_classification(
  classification,
  sub_classification1,
  sub_classification2
) {
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

  cy.get("#classificationDetails\\.\\[0\\]\\.subClassification1")
    .focus()
    .type("{downarrow}{enter}"); // Select the first Entry

  cy.get("#classificationDetails\\.\\[0\\]\\.subClassification2")
    .focus()
    .type("{downarrow}{enter}"); // Select the first Entry

  cy.wait(5000);
}

export function add_funding(start_date, end_date) {
  cy.get("span.MuiStepLabel-iconContainer").eq(6).click(); // Click on the Navigation bar
  cy.contains("Funding").should("be.visible");
  cy.get('button[data-testid="add-button"]')
    .contains("Add Funding Source")
    .click();
  cy.get("#agency_id").focus().type("{downarrow}{enter}");
  cy.get("#agency_project_id").type(
    faker.random.number({ min: 1000, max: 9999999 })
  );
  cy.get("#funding_amount").type(
    faker.random.number({ min: 100, max: 100000 })
  );
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
  cy.get("button").contains("Save Changes").click();
  cy.wait(5000);
}

export function add_partnerships() {
  cy.get("span.MuiStepLabel-iconContainer").eq(7).click(); // Click on the Navigation bar
  cy.contains("Partnerships").should("be.visible");

  cy.get("#indigenous_partnerships").focus().type("{downarrow}{enter}");
  cy.get("#stakeholder_partnerships").focus().type("{downarrow}{enter}");

  cy.wait(5000);
}

export function publish_project() {
  cy.get('button[data-testid="publish-project-button"]')
    .contains("Publish")
    .should("be.visible");
  cy.get('button[data-testid="publish-project-button"]').click();
  cy.wait(10000);
  cy.get('button[data-testid="publish-project-button"]')
    .contains("Unpublish")
    .should("be.visible");
  cy.wait(2000);
}

export function attach_file() {
  cy.get("#custom-menu-button-Upload").focus().click();
  cy.wait(1000);
  cy.get("#custom-menu-button-item-UploadReport").click();
  cy.wait(1000);
  cy.get("#title").type(
    (faker.company.catchPhrase() + " " + faker.company.bs()).substring(0, 50)
  );
  cy.get("#year_published").type(faker.random.number({ min: 2018, max: 2200 }));
  cy.get("#description").type(faker.lorem.paragraph());
  cy.get("#authors\\.\\[0\\]\\.first_name").type(faker.name.firstName());
  cy.get("#authors\\.\\[0\\]\\.last_name").type(faker.name.lastName());
  cy.get('input[data-testid="drop-zone-input"]').attachFile("1.doc");
  cy.wait(1000);
  cy.get("button").contains("Finish").click();
  cy.wait(2000);
}

export function add_survey() {
  cy.get("#h2-button-toolbar-CreateSurvey").click();

  cy.get("h1").contains("Create Survey").should("be.visible");
  cy.get('button[title="Edit General Information"]').click();

  cy.get("input#start_date").then(($input) => {
    const sdate = $input.val().toString();
    cy.log("sdate", sdate);

    cy.get("input#end_date").then(($input) => {
      const edate = $input.val().toString();
      cy.log("edate", edate);

      cy.get("button").contains("Cancel").click();
      cy.get("a").contains("Surveys").click();

      cy.get("h2").contains("Surveys").should("be.visible");

      cy.get("button").contains("Create Survey").click();
      cy.get("h1").contains("Create Survey").should("be.visible");

      cy.get("#survey_name").clear().type(faker.lorem.words());

      cy.log("sdate", sdate);
      cy.get("#start_date").type(sdate);
      cy.log("edate", edate);
      cy.get("#end_date").type(edate);
    });
  });

  cy.get("#focal_species").focus().click().type("{downArrow}{enter}");

  cy.get("#ancillary_species")
    .focus()
    .click()
    .type("{downArrow}{downArrow}{enter}");
  cy.get("#common_survey_methodology_id")
    .focus()
    .type("{enter}{downArrow}{enter}");
  cy.get("#survey_purpose").type(faker.lorem.text());
  cy.get("#permit_number").click().type("{downArrow}{enter}");

  cy.get("#funding_sources").click().type("{enter}");
  cy.get("#biologist_first_name").type(faker.name.firstName());
  cy.get("#biologist_last_name").type(faker.name.lastName());

  cy.get("#survey_area_name").clear().type(faker.lorem.words());
  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + faker.random.number({ min: 1, max: 9 }) + ".kml"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();

  cy.get('input[name="sedis_procedures_accepted"]').click();
  cy.get('input[name="foippa_requirements_accepted"]').click();
  cy.get("button").contains("Save and Exit").click();

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
