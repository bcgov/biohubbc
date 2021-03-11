import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectData, PostLocationData, PostCoordinatorData, PostObjectivesData } from '../models/project';
import { getProjectSQL, getProjectsSQL, postProjectSQL, postProjectRegionSQL } from './project-queries';

describe('postProjectSQL', () => {
  describe('Null project param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = postProjectSQL(
        (null as unknown) as PostProjectData & PostLocationData & PostCoordinatorData & PostObjectivesData
      );

      expect(response).to.be.null;
    });
  });

  describe('Valid project param provided', () => {
    const projectData = {
      name: 'name_test_data',
      objectives: 'objectives_test_data',
      management_recovery_action: 'management_recovery_action_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      caveats: 'caveats_test_data',
      comments: 'comments_test_data'
    };

    const coordinatorData = {
      first_name: 'coordinator_first_name',
      last_name: 'coordinator_last_name',
      email_address: 'coordinator_email_address@email.com',
      coordinator_agency: 'coordinator_agency_name',
      share_contact_details: false
    };

    const locationData = {
      location_description: 'a location description',
      regions: ['Valid Region']
    };

    const objectivesData = {
      objectives: 'an objective',
      caveats: 'a caveat maybe'
    };

    const postProjectData = new PostProjectData(projectData);
    const postCoordinatorData = new PostCoordinatorData(coordinatorData);
    const postObjectivesData = new PostObjectivesData(objectivesData);

    it('returns a SQLStatement', () => {
      const postLocationData = new PostLocationData(locationData);
      const response = postProjectSQL({
        ...postProjectData,
        ...postCoordinatorData,
        ...postLocationData,
        ...postObjectivesData
      });

      expect(response).to.not.be.null;
    });

    it('returns a SQLStatement with a single geometry inserted correctly', () => {
      const locationDataWithGeo = {
        ...locationData,
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ]
            },
            properties: {
              name: 'Biohub Islands'
            }
          }
        ]
      };

      const postLocationData = new PostLocationData(locationDataWithGeo);
      const response = postProjectSQL({
        ...postProjectData,
        ...postCoordinatorData,
        ...postLocationData,
        ...postObjectivesData
      });

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(
        '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
      );
    });

    it('returns a SQLStatement with multiple geometries inserted correctly', () => {
      const locationDataWithGeos = {
        ...locationData,
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo1',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-128, 55],
                  [-128, 55.5],
                  [-128, 56],
                  [-126, 58],
                  [-128, 55]
                ]
              ]
            },
            properties: {
              name: 'Biohub Islands 1'
            }
          },
          {
            type: 'Feature',
            id: 'myGeo2',
            geometry: {
              type: 'Point',
              coordinates: [-128, 55]
            },
            properties: {
              name: 'Biohub Islands 2'
            }
          }
        ]
      };

      const postLocationData = new PostLocationData(locationDataWithGeos);
      const response = postProjectSQL({
        ...postProjectData,
        ...postCoordinatorData,
        ...postLocationData,
        ...postObjectivesData
      });

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(
        '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
      );
      expect(response?.values).to.deep.include('{"type":"Point","coordinates":[-128,55]}');
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
      const response = postProjectRegionSQL((null as unknown) as string, projectId);

      expect(response).to.be.null;
    });

    it('Null region and null projectId provided - should return null', () => {
      // force the function to accept a null value
      const response = postProjectRegionSQL((null as unknown) as string, (null as unknown) as number);

      expect(response).to.be.null;
    });

    it('Valid region with null projectId - should return null', () => {
      // force the function to accept a null value
      const response = postProjectRegionSQL('Valid Region', (null as unknown) as number);

      expect(response).to.be.null;
    });
  });
});

describe('valid parameters', () => {
  it('Valid project region params provided - returns a SQLStatement', () => {
    const projectId = 1;
    const regionName = 'Kootenays';

    const response = postProjectRegionSQL(regionName, projectId);

    expect(response).to.not.be.null;
  });
});
