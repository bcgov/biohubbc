/// <reference types="cypress" />
import * as faker from "faker";

export function navigate_project() {
  // Create project
  cy.wait(5000);
  cy.visit("/admin/projects/create");
  cy.wait(5000);
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
  cy.wait(15000);
  cy.get("h1").contains("Create Survey").should("be.visible");

  cy.get("#start_date-helper-text").then(($help) => {
    var sdate = right($help.text().trim(), 12); // this returns the start date
    const months = "JanFebMarAprMayJunJulAugSepOctNovDec";
    var smonth = months.indexOf(left(sdate, 3)) / 3 + 1;
    sdate =
      right(sdate, 4) +
      "-" +
      smonth.toString() +
      "-" +
      sdate.slice(4, 6).trim();
    cy.log("sdate", sdate);
    cy.get("#end_date-helper-text").then(($help) => {
      var edate = right($help.text().trim(), 12); // this returns the end date
      smonth = months.indexOf(left(edate, 3)) / 3 + 1;
      edate =
        right(edate, 4) +
        "-" +
        smonth.toString() +
        "-" +
        edate.slice(4, 6).trim();
      cy.log("edate", edate);
      cy.get("#survey_details\\.survey_name").clear().type(faker.lorem.words());

      cy.log("sdate", sdate);
      cy.get('[data-testid="start-date"]').type(sdate);
      cy.log("edate", edate);
      cy.get('[data-testid="end-date"]').type(edate);
    });
  });

  cy.get("#species\\.focal_species").focus().type("killer");
  cy.wait(2000);
  cy.get('#species\\.focal_species-option-0').click();
  cy.get("#funding\\.funding_sources").click()

  cy.get("#species\\.ancillary_species").click().type("grey whale");
  cy.get('#species\\.ancillary_species-option-0').click();
  cy.get("#funding\\.funding_sources").click()

  cy.get("#survey_details\\.biologist_first_name").type(faker.name.firstName());
  cy.get("#survey_details\\.biologist_last_name").type(faker.name.lastName());
  cy.get("#permit_number").click().type("{downArrow}{enter}");
  cy.get("#funding\\.funding_sources").click().type("{enter}");
  cy.get("#mui-component-select-purpose_and_methodology\\.intended_outcome_id").focus().type("{downArrow}{enter}");
  cy.get("#purpose_and_methodology\\.additional_details").type(faker.lorem.text());
  cy.get("#mui-component-select-purpose_and_methodology\\.field_method_id").focus().type("{downArrow}{enter}");
  cy.get("#mui-component-select-purpose_and_methodology\\.ecological_season_id").focus().type("{downArrow}{enter}");
  cy.get("#purpose_and_methodology\\.vantage_code_ids").focus().type("{downArrow}{enter}");
  cy.get("#location\\.survey_area_name").clear().type(faker.lorem.words());

  cy.get('[data-testid="boundary_file-upload"]').click();
  cy.get('[data-testid="drop-zone-input"]').attachFile(
    "shapes/" + faker.random.number({ min: 1, max: 9 }) + ".kml"
  );
  cy.wait(5000);
  cy.get("button").contains("Close").click();

  cy.get('input[name="agreements\\.sedis_procedures_accepted"]').click();
  cy.get('input[name="agreements\\.foippa_requirements_accepted"]').click();
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

export function right(str, chr) {
  return str.slice(str.length - chr, str.length);
}

export function left(str, chr) {
  return str.slice(0, chr - str.length);
}
