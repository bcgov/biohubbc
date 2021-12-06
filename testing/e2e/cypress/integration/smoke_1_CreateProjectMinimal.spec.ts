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
  add_zip,
  add_project_info,
  add_objectives,
  add_classification,
  add_funding,
  add_partnerships,
  publish_project,
  attach_file,
  add_survey,
} from "../page-functions/project/project-create-page";

beforeEach(() => {
  cy.logout();
  cy.login();
  navigate();
});

afterEach(() => {
  navigate();
  cy.logout();
});

var n = 0;
while (n < 1) {
  /* for future iterations */
  it("CreateProject", function () {
    /* ==== Open Create Project ==== */
    navigate_project();

    add_coordinator_info(null, null, null, null, null, false); //navloc,fname,lname,email,agency,noshare
    next_page_project();

    add_permits(null, null, null, "true"); //navloc, permit_nr, permit_type, sampling
    next_page_project();

    add_project_info(null, null, null, null); //project_name, project_type, start_date, end_date
    next_page_project();

    add_objectives(null, null); //objectives, caveats
    next_page_project();

    add_locations(null, null); //description, kml_file
    add_gpx(null); // gpx_file
    //add_zip(1);
    next_page_project();

    add_classification(null, null, null); //classification, sub_classification1, sub_classification2
    next_page_project();

    add_funding(null,null);
    next_page_project();

    add_partnerships();
    submit_project();
    cy.wait(10000);

    publish_project();

    attach_file();

    //add_survey();

  });
  n++;
}
