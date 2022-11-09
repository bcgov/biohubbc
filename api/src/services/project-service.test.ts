import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { PROJECT_ROLE } from '../constants/roles';
import { HTTP400, HTTPError } from '../errors/http-error';
import { PostFundingSource, PostProjectObject } from '../models/project-create';
import {
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetAttachmentsData,
  GetReportAttachmentsData
} from '../models/project-view';
import { GET_ENTITIES } from '../paths/project/{projectId}/update';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectService } from './project-service';

chai.use(sinonChai);
// 184-270,384-386,396-820,833,853

const mockService = () => {
  const dbConnection = getMockDBConnection();
  return new ProjectService(dbConnection);
};

const mockProjectData = (): PostProjectObject => {
  const data = {
    coordinator: {
      first_name: '',
      last_name: '',
      email_address: '',
      coordinator_agency: '',
      share_contact_details: ''
    },
    project: {
      project_name: '',
      project_type: 1,
      project_activities: [1],
      start_date: '',
      end_date: '',
      comments: ''
    },
    objectives: {
      objectives: '',
      caveats: ''
    },
    location: {
      location_description: '',
      geometry: []
    },
    funding: {
      funding_sources: [{
        agency_id: 1,
        investment_action_category: 1,
        agency_project_id: 1,
        funding_amount: 1,
        start_date: 1,
        end_date: '',
      }]
    },
    iucn: {
      classificationDetails: [{
        classification: 1,
        subClassification1: 1,
        subClassification2: 1
      }]
    },
    partnerships: {
      indigenous_partnerships: [1],
      stakeholder_partnerships: ["some stake holder"]
    }
  }
  return new PostProjectObject(data);
}

describe('ProjectService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getProjectEntitiesById', () => {
    it('should get all project data', async () => {
      const service = mockService();
      const mockCoordinator = sinon.stub(ProjectService.prototype, 'getCoordinatorData').resolves(
        new GetCoordinatorData({
          coordinator_first_name: 'First',
          coordinator_last_name: 'Last',
          coordinator_email_address: 'email@email.com',
          coordinator_agency_name: 'agency',
          coordinator_public: true,
          revision_count: 1
        })
      );
      const mockPartnership = sinon
        .stub(ProjectService.prototype, 'getPartnershipsData')
        .resolves(new GetPartnershipsData([], []));
      const mockLocation = sinon.stub(ProjectService.prototype, 'getLocationData').resolves(new GetLocationData(null));
      const mockIUNCClassifications = sinon
        .stub(ProjectService.prototype, 'getIUCNClassificationData')
        .resolves(new GetIUCNClassificationData([]));
      const mockObjectives = sinon
        .stub(ProjectService.prototype, 'getObjectivesData')
        .resolves(new GetObjectivesData(null));
      const mockProject = sinon.stub(ProjectService.prototype, 'getProjectData').resolves(new GetProjectData(null, []));

      await service.getProjectEntitiesById(1, [
        GET_ENTITIES.coordinator,
        GET_ENTITIES.funding,
        GET_ENTITIES.iucn,
        GET_ENTITIES.location,
        GET_ENTITIES.objectives,
        GET_ENTITIES.partnerships,
        GET_ENTITIES.project
      ]);

      expect(mockCoordinator).to.be.called;
      expect(mockPartnership).to.be.called;
      expect(mockLocation).to.be.called;
      expect(mockIUNCClassifications).to.be.called;
      expect(mockObjectives).to.be.called;
      expect(mockProject).to.be.calledTwice;
    });

    it('should get project and coordinator information', async () => {
      const service = mockService();
      const mockCoordinator = sinon.stub(ProjectService.prototype, 'getCoordinatorData').resolves(
        new GetCoordinatorData({
          coordinator_first_name: 'First',
          coordinator_last_name: 'Last',
          coordinator_email_address: 'email@email.com',
          coordinator_agency_name: 'agency',
          coordinator_public: true,
          revision_count: 1
        })
      );
      const mockPartnership = sinon
        .stub(ProjectService.prototype, 'getPartnershipsData')
        .resolves(new GetPartnershipsData([], []));
      const mockLocation = sinon.stub(ProjectService.prototype, 'getLocationData').resolves(new GetLocationData(null));
      const mockIUNCClassifications = sinon
        .stub(ProjectService.prototype, 'getIUCNClassificationData')
        .resolves(new GetIUCNClassificationData([]));
      const mockObjectives = sinon
        .stub(ProjectService.prototype, 'getObjectivesData')
        .resolves(new GetObjectivesData(null));
      const mockProject = sinon.stub(ProjectService.prototype, 'getProjectData').resolves(new GetProjectData(null, []));

      await service.getProjectEntitiesById(1, [GET_ENTITIES.coordinator, GET_ENTITIES.project]);

      expect(mockCoordinator).to.be.called;
      expect(mockPartnership).not.to.be.called;
      expect(mockLocation).not.to.be.called;
      expect(mockIUNCClassifications).not.to.be.called;
      expect(mockObjectives).not.to.be.called;
      expect(mockProject).to.be.called;
    });
  });

  describe('getIndigenousPartnershipsRows', () => {
    it('should return row information', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getIndigenousPartnershipsRows(1);
      expect(results).to.have.length(1);
    });

    it('should throw `Failed to build SQL get statement`', async () => {
      const service = mockService();
      sinon.stub(queries.project, 'getIndigenousPartnershipsByProjectSQL').returns(null)

      try {
        await service.getIndigenousPartnershipsRows(1)
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.eql("Failed to build SQL get statement")
      }
    });

    it('should return an empty array when no rows found', async () => {
      const mockQueryResponse = ({rows: []} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getIndigenousPartnershipsRows(1);
      expect(results).to.have.length(0);
    });

    it('should return a null value', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getIndigenousPartnershipsRows(1);
      expect(results).to.have.be.null;
    });
  })

  describe('getStakeholderPartnershipsRows', () => {
    it('should return row information', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getStakeholderPartnershipsRows(1);
      expect(results).to.have.length(1);
    });

    it('should throw `Failed to build SQL get statement`', async () => {
      const service = mockService();
      sinon.stub(queries.project, 'getStakeholderPartnershipsByProjectSQL').returns(null)

      try {
        await service.getStakeholderPartnershipsRows(1)
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.eql("Failed to build SQL get statement")
      }
    });

    it('should return an empty array when no rows found', async () => {
      const mockQueryResponse = ({rows: []} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getStakeholderPartnershipsRows(1);
      expect(results).to.have.length(0);
    });

    it('should return a null value', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getStakeholderPartnershipsRows(1);
      expect(results).to.have.be.null;
    });
  })

  describe('getAttachmentsData', () => {
    it('should return row attachments data', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getAttachmentsData(1);
      expect(results).to.eql(new GetAttachmentsData([{id: 1}]));
    });

    it('should throw `Failed to build SQL get statement`', async () => {
      const service = mockService();
      sinon.stub(queries.project, 'getAttachmentsByProjectSQL').returns(null)

      try {
        await service.getAttachmentsData(1)
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.eql("Failed to build SQL get statement")
      }
    });

    it('should return an empty object when no rows are found', async () => {
      const mockQueryResponse = ({rows: []} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getAttachmentsData(1);
      expect(results).to.eql(new GetAttachmentsData([]));
    });
  });

  describe('createProject', () => {
    it('should create a project and return an ID', async () => {
      const projectId = 1
      const service = mockService()
      const insertProject = sinon.stub(service, 'insertProject').resolves(projectId);
      const insertFunding = sinon.stub(service, 'insertFundingSource').resolves(1);
      const insertPartnerships = sinon.stub(service, 'insertIndigenousNation').resolves(1);
      const insertStakeholder = sinon.stub(service, 'insertStakeholderPartnership').resolves(1);
      const inClassification = sinon.stub(service, 'insertClassificationDetail').resolves(1);
      const insertActivity = sinon.stub(service, 'insertActivity').resolves(1);
      sinon.stub(service, 'insertParticipantRole').resolves();

      const projectData = mockProjectData()

      const results = await service.createProject(projectData)
      expect(projectId).to.be.eql(results);
      expect(insertProject).to.be.called;
      expect(insertFunding).to.be.called;
      expect(insertPartnerships).to.be.called;
      expect(insertStakeholder).to.be.called;
      expect(inClassification).to.be.called;
      expect(insertActivity).to.be.called;
    });
  })

  describe('updateFundingData', () => {
    it('should run without issue', async() => {
      const mockQueryResponse = ({rows: [{id: 1}], rowCount: 1} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const updateData = {
        coordinator: null,
        project: null,
        objectives: null,
        location: null,
        iucn: null,
        funding: {
          fundingSources: [{
            id: 1,
            investment_action_category: null,
            agency_project_id: null,
            funding_amount: null,
            start_date: null,
            end_date: null,
            revision_count: null
          }]
        },
        partnerships: null
      }
      await service.updateFundingData(1, updateData);
    });

    it('should throw  `Failed to build SQL delete statement` error', async() => {
      const mockQueryResponse = ({rows: [{id: 1}], rowCount: 1} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const updateData = {
        coordinator: null,
        project: null,
        objectives: null,
        location: null,
        iucn: null,
        funding: {
          fundingSources: [{
            id: null,
            investment_action_category: null,
            agency_project_id: null,
            funding_amount: null,
            start_date: null,
            end_date: null,
            revision_count: null
          }]
        },
        partnerships: null
      }
      try {
        await service.updateFundingData(1, updateData);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql("Failed to build SQL delete statement");
      }
    });

    it('should throw  `Failed to delete survey funding source` error', async() => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const updateData = {
        coordinator: null,
        project: null,
        objectives: null,
        location: null,
        iucn: null,
        funding: {
          fundingSources: [{
            id: 1,
            investment_action_category: null,
            agency_project_id: null,
            funding_amount: null,
            start_date: null,
            end_date: null,
            revision_count: null
          }]
        },
        partnerships: null
      }
      try {
        await service.updateFundingData(1, updateData);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql("Failed to delete survey funding source");
      }
    });

    it('should throw  `Failed to delete survey funding source` error', async() => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.project, 'putProjectFundingSourceSQL').returns(null);
      const updateData = {
        coordinator: null,
        project: null,
        objectives: null,
        location: null,
        iucn: null,
        funding: {
          fundingSources: [{
            id: 1,
            investment_action_category: null,
            agency_project_id: null,
            funding_amount: null,
            start_date: null,
            end_date: null,
            revision_count: null
          }]
        },
        partnerships: null
      }
      try {
        await service.updateFundingData(1, updateData);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql("Failed to build SQL insert statement");
      }
    });
  });

  describe('insertProject', () => {
    it('should return project id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      const id = await service.insertProject(mockData);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      sinon.stub(queries.project, 'postProjectSQL').returns(null);


      try {
        await service.insertProject(mockData);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project boundary data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      // sinon.stub(queries.project, 'postProjectSQL').returns(null);


      try {
        await service.insertProject(mockData);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project boundary data');
      }
    });
  });

  describe('insertFundingSource', () => {
    it('should return an id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      const data = new PostFundingSource(mockData.funding);
      const id = await service.insertFundingSource(data, 1);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      const data = new PostFundingSource(mockData.funding);
      sinon.stub(queries.project, 'postProjectFundingSourceSQL').returns(null);


      try {
      await service.insertFundingSource(data, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project funding data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const mockData = mockProjectData();
      const data = new PostFundingSource(mockData.funding);

      try {
        await service.insertFundingSource(data, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project funding data');
      }
    });
  });

  describe('insertIndigenousNation', () => {
    it('should return an id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const id = await service.insertIndigenousNation(1, 1);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.project, 'postProjectIndigenousNationSQL').returns(null);


      try {
        await service.insertIndigenousNation(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project first nations partnership data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertIndigenousNation(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project first nations partnership data');
      }
    });
  });

  describe('insertStakeholderPartnership', () => {
    it('should return an id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const id = await service.insertStakeholderPartnership("Acme Inc.", 1);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.project, 'postProjectStakeholderPartnershipSQL').returns(null);


      try {
        await service.insertStakeholderPartnership("Acme Inc.", 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project stakeholder partnership data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertStakeholderPartnership("Acme Inc.", 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project stakeholder partnership data');
      }
    });
  });

  describe('insertClassificationDetail', () => {
    it('should return an id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const id = await service.insertClassificationDetail(1, 1);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.project, 'postProjectIUCNSQL').returns(null);


      try {
        await service.insertClassificationDetail(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project IUCN data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertClassificationDetail(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project IUCN data');
      }
    });
  });

  describe('insertActivity', () => {
    it('should return an id', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      const id = await service.insertActivity(1, 1);

      expect(id).to.be.eql(1);
    });

    it('should throw `Failed to build SQL insert statement` error', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.project, 'postProjectActivitySQL').returns(null);


      try {
        await service.insertActivity(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project activity data` error', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertActivity(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project activity data');
      }
    });
  });

  describe('insertParticipantRole', () => {
    it('should run without issue', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ 
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });
      const service = new ProjectService(mockDBConnection);
      await service.insertParticipantRole(1, PROJECT_ROLE.PROJECT_LEAD);
    });

    it('should throw `Failed to identify system user ID`', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ 
        query: async () => mockQueryResponse,
        systemUserId: () => null
      });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertParticipantRole(1, PROJECT_ROLE.PROJECT_LEAD);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to identify system user ID');
      }
    });

    it('should throw `Failed to build SQL insert statement`', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}], rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ 
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });
      const service = new ProjectService(mockDBConnection);
      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleNameSQL').returns(null);
      try {
        await service.insertParticipantRole(1, PROJECT_ROLE.PROJECT_LEAD);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert project team member`', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ 
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });
      const service = new ProjectService(mockDBConnection);

      try {
        await service.insertParticipantRole(1, PROJECT_ROLE.PROJECT_LEAD);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert project team member');
      }
    });
  });

  describe('getReportAttachmentsData', () => {
    it('should return row attachments data', async () => {
      const mockQueryResponse = ({ rows: [{id: 1}] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getReportAttachmentsData(1);
      expect(results).to.eql(new GetReportAttachmentsData([{id: 1}]));
    });

    it('should throw `Failed to build SQL get statement`', async () => {
      const service = mockService();
      sinon.stub(queries.project, 'getReportAttachmentsByProjectSQL').returns(null)

      try {
        await service.getReportAttachmentsData(1)
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.eql("Failed to build SQL get statement")
      }
    });

    it('should return an empty object when no rows are found', async () => {
      const mockQueryResponse = ({rows: []} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const service = new ProjectService(mockDBConnection);

      const results = await service.getReportAttachmentsData(1);
      expect(results).to.eql(new GetReportAttachmentsData([]));
    });
  })

  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectService.prototype, 'getProjectParticipant')
        .resolves('existing participant');

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon.stub(ProjectService.prototype, 'getProjectParticipant').resolves(null);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(null);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipant(projectId, systemUserId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipant(projectId, systemUserId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns null if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      expect(result).to.equal(null);
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('getProjectParticipants', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(null);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('addProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(null);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project team member');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should not throw an error on success', async () => {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const addProjectRoleByRoleIdSQLStub = sinon
        .stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL')
        .returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);

      expect(addProjectRoleByRoleIdSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('getProjectList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'getProjectListSQL').returns(null);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectList(true, 1, {});
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectList(true, 1, {});

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [
        {
          id: 123,
          name: 'Project 1',
          start_date: '1900-01-01',
          end_date: '2200-10-10',
          coordinator_agency: 'Agency 1',
          project_type: 'Aquatic Habitat'
        },
        {
          id: 456,
          name: 'Project 2',
          start_date: '1900-01-01',
          end_date: '2000-12-31',
          coordinator_agency: 'Agency 2',
          project_type: 'Terrestrial Habitat'
        }
      ];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectList(true, 1, {});

      expect(result[0].id).to.equal(123);
      expect(result[0].name).to.equal('Project 1');
      expect(result[0].completion_status).to.equal('Active');

      expect(result[1].id).to.equal(456);
      expect(result[1].name).to.equal('Project 2');
      expect(result[1].completion_status).to.equal('Completed');
    });
  });
});

describe('getProjectData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getProjectData(1);

    expect(response).to.eql(new GetProjectData({ id: 1 }, [{ id: 1 }]));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getProjectData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getObjectivesData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getObjectivesData(1);

    expect(response).to.eql(new GetObjectivesData({ id: 1 }));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getObjectivesData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project objectives data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getCoordinatorData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getCoordinatorData(1);

    expect(response).to.eql(new GetCoordinatorData({ id: 1 }));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getCoordinatorData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project contact data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getLocationData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getLocationData(1);

    expect(response).to.eql(new GetLocationData([{ id: 1 }]));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getLocationData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getIUCNClassificationData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getIUCNClassificationData(1);

    expect(response).to.eql(new GetIUCNClassificationData([{ id: 1 }]));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getIUCNClassificationData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getFundingData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getFundingData(1);

    expect(response).to.eql(new GetFundingData([{ id: 1 }]));
  });

  it('returns null if response is empty', async () => {
    const mockQueryResponse = ({} as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getFundingData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get project data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});

describe('getPartnershipsData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns data if valid return', async () => {
    sinon.stub(ProjectService.prototype, 'getIndigenousPartnershipsRows').resolves([]);
    sinon.stub(ProjectService.prototype, 'getStakeholderPartnershipsRows').resolves([]);

    const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    const response = await projectService.getPartnershipsData(1);

    expect(response).to.eql(new GetPartnershipsData([], []));
  });

  it('throws error if indigenous partnership is empty', async () => {
    sinon.stub(ProjectService.prototype, 'getIndigenousPartnershipsRows').resolves(undefined);
    sinon.stub(ProjectService.prototype, 'getStakeholderPartnershipsRows').resolves([]);
    const mockQueryResponse = ({} as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getPartnershipsData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get indigenous partnership data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('throws error if stakeholder partnership is empty', async () => {
    sinon.stub(ProjectService.prototype, 'getIndigenousPartnershipsRows').resolves([]);
    sinon.stub(ProjectService.prototype, 'getStakeholderPartnershipsRows').resolves(undefined);

    const mockQueryResponse = ({} as unknown) as QueryResult<any>;

    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
    const projectService = new ProjectService(mockDBConnection);

    try {
      await projectService.getPartnershipsData(1);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get stakeholder partnership data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});
