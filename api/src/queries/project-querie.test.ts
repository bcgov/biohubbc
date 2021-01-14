import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectObject } from '../models/project';
import { getProjectSQL, getProjectsSQL, postProjectSQL } from './project-queries';

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
        comments: 'comments_test_data'
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
