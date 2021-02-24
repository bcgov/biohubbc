import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectObject, PostProjectRegionObject } from '../models/project';
import { getProjectSQL, getProjectsSQL, postProjectSQL, postProjectRegionSQL } from './project-queries';

describe('postProjectSQL', () => {
  describe('Null project param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = postProjectSQL((null as unknown) as PostProjectObject);

      expect(response).to.be.null;
    });
  });

  describe('Valid project param provided', () => {
    it('returns a SQLStatement', () => {
      const obj = {
        name: 'name_test_data',
        objectives: 'objectives_test_data',
        scientific_collection_permit_number: 'scientific_collection_permit_number_test_data',
        management_recovery_action: 'management_recovery_action_test_data',
        location_description: 'location_description_test_data',
        start_date: 'start_date_test_data',
        end_date: 'end_date_test_data',
        results: 'results_test_data',
        caveats: 'caveats_test_data',
        comments: 'comments_test_data',
        coordinator_first_name: 'coordinator_first_name',
        coordinator_last_name: 'coordinator_last_name',
        coordinator_email_address: 'coordinator_email_address@email.com',
        coordinator_agency_name: 'coordinator_agency_name'
      };

      const postProjectObject = new PostProjectObject(obj);

      const response = postProjectSQL(postProjectObject);

      expect(response).to.not.be.null;
    });
  });
});

describe('getProjectSQL', () => {
  describe('Null project id param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = getProjectSQL((null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('Valid project id param provided', () => {
    it('returns a SQLStatement', () => {
      const response = getProjectSQL(1);

      expect(response).to.not.be.null;
    });
  });
});

describe('getProjectsSQL', () => {
  it('returns a SQLStatement', () => {
    const response = getProjectsSQL();

    expect(response).to.not.be.null;
  });
});

describe('postProjectRegionSQL', () => {
  describe('invalid parameters', () => {
    it('Null region provided', () => {
      // force the function to accept a null project region object
      const projectId = 1;
      const response = postProjectRegionSQL((null as unknown) as PostProjectRegionObject, projectId);

      expect(response).to.be.null;
    });

    it('Null region and null projectId provided - should return null', () => {
      // force the function to accept a null value
      const response = postProjectRegionSQL((null as unknown) as PostProjectRegionObject, (null as unknown) as number);

      expect(response).to.be.null;
    });

    it('Valid region with null projectId - should return null', () => {
      // force the function to accept a null value
      const response = postProjectRegionSQL((null as unknown) as PostProjectRegionObject, (null as unknown) as number);

      expect(response).to.be.null;
    });
  });
});

describe('valid parameters', () => {
  it('Valid project region params provided - returns a SQLStatement', () => {
    const projectId = 1;
    const obj = {
      region_name: 'Kootenays'
    };

    const postProjectRegionObject = new PostProjectRegionObject(obj);

    const response = postProjectRegionSQL(postProjectRegionObject, projectId);

    expect(response).to.not.be.null;
  });
});
