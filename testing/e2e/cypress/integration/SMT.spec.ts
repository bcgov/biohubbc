import * as faker from 'faker';

import {
  navigate, login, logout,
} from '../page-functions/common/login-page'

import { navigate_project, add_coordinator_info, add_permits, submit_project, next_page_project, previous_page_project, cancel_project, }
  from '../page-functions/project/project-create-page'

beforeEach(() => {
  navigate()
  login('', '')
});

afterEach(() => {

});

it('CreateProject', function () {
  /* ==== Open Create Project ==== */
  navigate_project()
  add_coordinator_info(null, null, null, null, null, false) //navloc,fname,lname,email,agency,noshare
  next_page_project()
  add_permits(null, null, null, 'true') //navloc, permit_nr, permit_type, sampling
  next_page_project()
}
);
