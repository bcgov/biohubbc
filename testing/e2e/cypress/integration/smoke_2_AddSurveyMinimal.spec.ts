import * as faker from "faker";

import { navigate, login, logout } from "../page-functions/common/login-page";

import {
  navigate_project,
  add_coordinator_info,
  add_permits,
  submit_project,
  next_page_project,
  previous_page_project,
  cancel_project,
  add_locations,
  add_gpx,
  add_project_info,
  add_objectives,
  add_classification,
  add_funding,
  add_partnerships,
} from "../page-functions/project/project-create-page";

before(() => {
  navigate();
  login("", "");
});

after(() => {
  navigate();
  logout();
});

var n = 0;
while (n < 1) {
  /* for future iterations */
  it("Add SurveytoProject", function () {
    /* ==== Open Project 1 ==== */
    cy.visit("/admin/projects/1/details");
    cy.wait(5000);
    cy.get("h1").should("be.visible");

    cy.get('button[title="Edit General Information"]').click();

    describe("Handling dates", () => {
      let sdate;
      let edate;

      cy.get("input#start_date").then(($input) => {
        sdate = $input.val().toString();
        cy.log("sdate", sdate);
      });

      cy.get("input#end_date").then(($input) => {
        edate = $input.val().toString();
        cy.log("edate", edate);
      });

      cy.visit("/admin/projects/1/surveys");
      cy.get("h2").contains("Surveys").should("be.visible");

      cy.get("button").contains("Create Survey").click();
      cy.get("h1").contains("Create Survey").should("be.visible");

      cy.get("#survey_name").clear().type(faker.lorem.words());

      cy.log("sdate", sdate);
      cy.get("#start_date").type(sdate);
      cy.log("edate", edate);
      cy.get("#end_date").type(edate);
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
  });
  n++;
}
