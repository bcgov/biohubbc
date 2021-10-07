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

beforeEach(() => {
  navigate();
  login("", "");
});

afterEach(() => {
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

    cy.visit("/admin/projects/1/surveys");
    cy.get("h2").contains("Surveys").should("be.visible");

    cy.get("button").contains("Create Survey").click();
    cy.get("h1").contains("Create Survey").should("be.visible");

    cy.get("#survey_name").clear().type(faker.lorem.words());
    cy.get("#start_date").type(
        "20" +
          faker.random.number({ min: 19, max: 21 }) +
          "-" +
          faker.random.number({ min: 10, max: 12 }) +
          "-" +
          faker.random.number({ min: 10, max: 28 })
    );
    cy.get("#end_date").type(
        "20" +
          faker.random.number({ min: 22, max: 30 }) +
          "-" +
          faker.random.number({ min: 10, max: 12 }) +
          "-" +
          faker.random.number({ min: 10, max: 28 })
    );

    cy.get("#focal_species").focus().click().type("{downArrow}{enter}");

    cy.get("#ancillary_species").focus().click().type("{downArrow}{downArrow}{enter}");
    cy.get("#common_survey_methodology_id").focus().type("{enter}").find('li[data-value="' + faker.random.number({ min: 1, max: 3 }) + '"]').click();

    cy.wait(5000);

 });
  n++;
}
