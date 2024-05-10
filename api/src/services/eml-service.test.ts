import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { IGetProject } from '../models/project-view';
import { SurveyObject } from '../models/survey-view';
import { getMockDBConnection } from '../__mocks__/db';
import { CodeService } from './code-service';
import { EmlPackage, EmlService } from './eml-service';
import { ProjectService } from './project-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('EmlPackage', () => {
  describe('withEml', () => {
    it('should build an EML section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);
      const packageId = 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii';

      const emlPackage = new EmlPackage({ packageId });

      const response = emlPackage.withEml(emlService._buildEmlSection(packageId));

      expect(response._emlMetadata).to.eql(emlPackage._emlMetadata);
      expect(response._emlMetadata).to.eql({
        $: {
          packageId: 'urn:uuid:aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii',
          system: '',
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      });
    });
  });

  describe('withDataset', () => {
    it('should build an EML dataset section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockOrg = {
        organizationName: 'Test Organization',
        electronicMailAddress: 'EMAIL@address.com'
      };

      const mockPackageId = 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii';
      const mockProjectData = {
        project: {
          project_name: 'Test Project Name'
        }
      } as IGetProject;

      const emlPackage = new EmlPackage({ packageId: mockPackageId });

      sinon.stub(EmlService.prototype, '_getProjectDatasetCreator').returns(mockOrg);

      sinon.stub(EmlService.prototype, '_makeEmlDateString').returns('2023-01-01');

      sinon.stub(EmlService.prototype, '_getProjectContact').returns({
        individualName: {
          givenName: 'First Name',
          surName: 'Last Name'
        },
        ...mockOrg
      });

      const response = emlPackage.withDataset(
        emlService._buildProjectEmlDatasetSection(mockPackageId, mockProjectData)
      );

      expect(response._datasetMetadata).to.eql(emlPackage._datasetMetadata);
      expect(response._datasetMetadata).to.eql({
        $: { system: '', id: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii' },
        title: 'Test Project Name',
        creator: {
          organizationName: 'Test Organization',
          electronicMailAddress: 'EMAIL@address.com'
        },
        pubDate: '2023-01-01',
        language: 'English',
        contact: {
          individualName: {
            givenName: 'First Name',
            surName: 'Last Name'
          },
          organizationName: 'Test Organization',
          electronicMailAddress: 'EMAIL@address.com'
        }
      });
    });
  });

  describe('withProject', () => {
    it('should build a project EML Project section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockPackageId = 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii';

      const mockProjectData = {
        project: {
          uuid: mockPackageId,
          project_name: 'Test Project Name'
        },
        objectives: {
          objectives: 'Project objectives.'
        }
      } as IGetProject;

      const emlPackage = new EmlPackage({ packageId: mockPackageId });

      sinon.stub(EmlService.prototype, '_getProjectPersonnel').returns([
        {
          individualName: { givenName: 'First Name', surName: 'Last Name' },
          organizationName: 'A Rocha Canada',
          electronicMailAddress: 'EMAIL@address.com',
          role: 'pointOfContact'
        }
      ]);

      sinon.stub(EmlService.prototype, '_getProjectTemporalCoverage').returns({
        rangeOfDates: {
          beginDate: { calendarDate: '2023-01-01' },
          endDate: { calendarDate: '2023-01-31' }
        }
      });

      const response = emlPackage.withProject(emlService._buildProjectEmlProjectSection(mockProjectData, []));

      expect(response._projectMetadata).to.eql(emlPackage._projectMetadata);
      expect(response._projectMetadata).to.eql({
        $: { id: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii', system: '' },
        title: 'Test Project Name',
        personnel: [
          {
            individualName: { givenName: 'First Name', surName: 'Last Name' },
            organizationName: 'A Rocha Canada',
            electronicMailAddress: 'EMAIL@address.com',
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [{ title: 'Objectives', para: 'Project objectives.' }]
        },
        studyAreaDescription: {
          coverage: {
            temporalCoverage: {
              rangeOfDates: {
                beginDate: { calendarDate: '2023-01-01' },
                endDate: { calendarDate: '2023-01-31' }
              }
            }
          }
        }
      });
    });
  });

  describe('withAdditionalMetadata', () => {
    it('should add additional metadata to the EML package', () => {
      const additionalMeta1 = [
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: { projectTypes: { projectType: 'Aquatic Habitat' } }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            projectActivities: {
              projectActivity: [{ name: 'Habitat Protection' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            IUCNConservationActions: {
              IUCNConservationAction: [
                {
                  IUCNConservationActionLevel1Classification: 'Awareness Raising',
                  IUCNConservationActionLevel2SubClassification: 'Outreach & Communications',
                  IUCNConservationActionLevel3SubClassification: 'Reported and social media'
                }
              ]
            }
          }
        }
      ];

      const additionalMeta2 = [
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            stakeholderPartnerships: {
              stakeholderPartnership: [{ name: 'BC Hydro' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            firstNationPartnerships: {
              firstNationPartnership: [{ name: 'Acho Dene Koe First Nation' }]
            }
          }
        }
      ];

      const emlPackage = new EmlPackage({ packageId: (null as unknown) as string });

      const response = emlPackage.withAdditionalMetadata(additionalMeta1).withAdditionalMetadata(additionalMeta2);

      expect(response._additionalMetadata).to.eql(emlPackage._additionalMetadata);
      expect(emlPackage._additionalMetadata).to.eql([...additionalMeta1, ...additionalMeta2]);
    });
  });

  describe('withRelatedProjects', () => {
    it('should add a related project to the EML package', () => {
      const project = {
        $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c05', system: '' },
        title: 'Project Name 1'
      };

      const emlPackage = new EmlPackage({ packageId: (null as unknown) as string });

      const response = emlPackage.withRelatedProjects([project]);

      expect(response._relatedProjects).to.eql(emlPackage._relatedProjects);
      expect(emlPackage._relatedProjects).to.eql([
        {
          $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c05', system: '' },
          title: 'Project Name 1'
        }
      ]);
    });

    it('should add multiple related projects to the EML package', () => {
      const project1 = {
        $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c05', system: '' },
        title: 'Project Name 1'
      };

      const project2 = {
        $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c06', system: '' },
        title: 'Project Name 2'
      };

      const emlPackage = new EmlPackage({ packageId: (null as unknown) as string });

      const response = emlPackage.withRelatedProjects([project1]).withRelatedProjects([project2]);

      expect(response._relatedProjects).to.eql(emlPackage._relatedProjects);
      expect(emlPackage._relatedProjects).to.eql([
        {
          $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c05', system: '' },
          title: 'Project Name 1'
        },
        {
          $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c06', system: '' },
          title: 'Project Name 2'
        }
      ]);
    });
  });

  describe('build', () => {
    //
  });
});

describe.skip('EmlService', () => {
  beforeEach(() => {
    sinon.stub(EmlService.prototype, 'loadEmlDbConstants').callsFake(async function (this: EmlService) {
      this._constants.EML_ORGANIZATION_URL = 'Not Supplied';
      this._constants.EML_ORGANIZATION_NAME = 'Not Supplied';
      this._constants.EML_PROVIDER_URL = 'Not Supplied';
      this._constants.EML_SECURITY_PROVIDER_URL = 'Not Supplied';
      this._constants.EML_ORGANIZATION_URL = 'Not Supplied';
      this._constants.EML_INTELLECTUAL_RIGHTS = 'Not Supplied';
      this._constants.EML_TAXONOMIC_PROVIDER_URL = 'Not Supplied';
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const emlService = new EmlService(dbConnectionObj);

    expect(emlService).to.be.instanceof(EmlService);
    expect(emlService._constants).to.eql({
      EML_VERSION: '1.0.0',
      EML_PROVIDER_URL: 'Not Supplied',
      EML_SECURITY_PROVIDER_URL: 'Not Supplied',
      EML_ORGANIZATION_NAME: 'Not Supplied',
      EML_ORGANIZATION_URL: 'Not Supplied',
      EML_TAXONOMIC_PROVIDER_URL: 'Not Supplied',
      EML_INTELLECTUAL_RIGHTS: 'Not Supplied'
    });
  });

  describe('buildProjectEmlPackage', () => {
    it('should build an EML string with no content if no data is provided', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      sinon
        .stub(ProjectService.prototype, 'getProjectById')
        .resolves({ project: { uuid: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii' } } as IGetProject);

      sinon.stub(SurveyService.prototype, 'getSurveysByProjectId').resolves([]);

      sinon.stub(EmlService.prototype, '_buildEmlSection').returns({});
      sinon.stub(EmlService.prototype, '_buildProjectEmlDatasetSection').resolves({});
      sinon.stub(EmlService.prototype, '_buildProjectEmlProjectSection').returns({});
      sinon.stub(EmlService.prototype, '_getProjectAdditionalMetadata').resolves([]);
      sinon.stub(EmlService.prototype, '_getSurveyAdditionalMetadata').resolves([]);
      sinon.stub(EmlService.prototype, '_buildAllSurveyEmlProjectSections').resolves([]);

      const emlPackage = await emlService.buildProjectEmlPackage({ projectId: 1 });

      expect(emlPackage.toString()).to.equal(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><eml:eml><dataset><project/></dataset></eml:eml>`
      );
    });

    it('should build an EML package for a project successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      sinon
        .stub(ProjectService.prototype, 'getProjectById')
        .resolves({ project: { uuid: '1116c94a-8cd5-480d-a1f3-dac794e57c05' } } as IGetProject);

      sinon.stub(SurveyService.prototype, 'getSurveysByProjectId').resolves([]);

      // Build EML section
      sinon.stub(EmlService.prototype, '_buildEmlSection').returns({
        $: {
          packageId: 'urn:uuid:1116c94a-8cd5-480d-a1f3-dac794e57c05',
          system: '',
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      });

      // Build dataset EML section
      sinon.stub(EmlService.prototype, '_buildProjectEmlDatasetSection').returns({
        $: {
          system: '',
          id: '1116c94a-8cd5-480d-a1f3-dac794e57c05'
        },
        title: 'Project Name',
        creator: {
          organizationName: 'A Rocha Canada',
          electronicMailAddress: 'EMAIL@address.com'
        },
        pubDate: '2023-03-13',
        language: 'English',
        contact: {
          individualName: {
            givenName: 'First Name',
            surName: 'Last Name'
          },
          organizationName: 'A Rocha Canada',
          electronicMailAddress: 'EMAIL@address.com'
        }
      });

      // Build Project EML section
      sinon.stub(EmlService.prototype, '_buildProjectEmlProjectSection').returns({
        $: { id: '1116c94a-8cd5-480d-a1f3-dac794e57c05', system: '' },
        title: 'Project Name',
        personnel: [
          {
            individualName: { givenName: 'First Name', surName: 'Last Name' },
            organizationName: 'A Rocha Canada',
            electronicMailAddress: 'EMAIL@address.com',
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [{ title: 'Objectives', para: 'Objectives' }]
        },
        studyAreaDescription: {
          coverage: {
            geographicCoverage: {
              geographicDescription: 'Location Description',
              boundingCoordinates: {
                westBoundingCoordinate: -121.904297,
                eastBoundingCoordinate: -120.19043,
                northBoundingCoordinate: 51.971346,
                southBoundingCoordinate: 50.930738
              },
              datasetGPolygon: [
                {
                  datasetGPolygonOuterGRing: [
                    {
                      gRingPoint: [
                        { gRingLatitude: 50.930738, gRingLongitude: -121.904297 },
                        { gRingLatitude: 51.971346, gRingLongitude: -121.904297 },
                        { gRingLatitude: 51.971346, gRingLongitude: -120.19043 },
                        { gRingLatitude: 50.930738, gRingLongitude: -120.19043 },
                        { gRingLatitude: 50.930738, gRingLongitude: -121.904297 }
                      ]
                    }
                  ]
                }
              ]
            },
            temporalCoverage: {
              rangeOfDates: {
                beginDate: { calendarDate: '2023-01-01' },
                endDate: { calendarDate: '2023-01-31' }
              }
            }
          }
        }
      });

      // Build Project additional metadata
      sinon.stub(EmlService.prototype, '_getProjectAdditionalMetadata').resolves([
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: { projectTypes: { projectType: 'Aquatic Habitat' } }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            projectActivities: {
              projectActivity: [{ name: 'Habitat Protection' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            IUCNConservationActions: {
              IUCNConservationAction: [
                {
                  IUCNConservationActionLevel1Classification: 'Awareness Raising',
                  IUCNConservationActionLevel2SubClassification: 'Outreach & Communications',
                  IUCNConservationActionLevel3SubClassification: 'Reported and social media'
                }
              ]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            stakeholderPartnerships: {
              stakeholderPartnership: [{ name: 'BC Hydro' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            firstNationPartnerships: {
              firstNationPartnership: [{ name: 'Acho Dene Koe First Nation' }]
            }
          }
        }
      ]);

      // Build survey additional metadata
      sinon.stub(EmlService.prototype, '_getSurveyAdditionalMetadata').resolves([]);

      // Build related project section
      sinon.stub(EmlService.prototype, '_buildAllSurveyEmlProjectSections').resolves([
        {
          $: {
            id: '69b506d1-3a50-4a39-b4c7-190bd0b34b96',
            system: ''
          },
          title: 'Survey Name',
          personnel: [
            {
              individualName: {
                givenName: 'First Name',
                surName: 'Last Name'
              },
              role: 'pointOfContact'
            }
          ],
          abstract: {
            section: [
              {
                title: 'Intended Outcomes',
                para: 'Habitat Assessment'
              },
              {
                title: 'Additional Details',
                para: 'Additional Details'
              }
            ]
          },
          studyAreaDescription: {
            coverage: {
              geographicCoverage: {
                geographicDescription: 'Survey Area Name',
                boundingCoordinates: {
                  westBoundingCoordinate: -121.904297,
                  eastBoundingCoordinate: -120.19043,
                  northBoundingCoordinate: 51.971346,
                  southBoundingCoordinate: 50.930738
                },
                datasetGPolygon: [
                  {
                    datasetGPolygonOuterGRing: [
                      {
                        gRingPoint: [
                          {
                            gRingLatitude: 50.930738,
                            gRingLongitude: -121.904297
                          },
                          {
                            gRingLatitude: 51.971346,
                            gRingLongitude: -121.904297
                          },
                          {
                            gRingLatitude: 51.971346,
                            gRingLongitude: -120.19043
                          },
                          {
                            gRingLatitude: 50.930738,
                            gRingLongitude: -120.19043
                          },
                          {
                            gRingLatitude: 50.930738,
                            gRingLongitude: -121.904297
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              temporalCoverage: {
                rangeOfDates: {
                  beginDate: {
                    calendarDate: '2023-01-02'
                  },
                  endDate: {
                    calendarDate: '2023-01-30'
                  }
                }
              },
              taxonomicCoverage: {
                taxonomicClassification: [
                  {
                    taxonRankName: 'SPECIES',
                    taxonRankValue: 'Alces americanus',
                    commonNames: 'Moose',
                    taxonId: {
                      $: {
                        provider: ''
                      },
                      _: '2065'
                    }
                  }
                ]
              }
            }
          },
          designDescription: {
            description: {
              section: [
                {
                  title: 'Field Method',
                  para: 'Call Playback'
                },
                {
                  title: 'Vantage Codes',
                  para: {
                    itemizedlist: {
                      listitem: [
                        {
                          para: 'Aerial'
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      ]);

      const emlPackage = await emlService.buildProjectEmlPackage({ projectId: 1 });

      expect(emlPackage.toString()).to.equal(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><eml:eml packageId="urn:uuid:1116c94a-8cd5-480d-a1f3-dac794e57c05" system="" xmlns:eml="https://eml.ecoinformatics.org/eml-2.2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:stmml="http://www.xml-cml.org/schema/schema24" xsi:schemaLocation="https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd"><dataset system="" id="1116c94a-8cd5-480d-a1f3-dac794e57c05"><title>Project Name</title><creator><organizationName>A Rocha Canada</organizationName><electronicMailAddress>EMAIL@address.com</electronicMailAddress></creator><pubDate>2023-03-13</pubDate><language>English</language><contact><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName><organizationName>A Rocha Canada</organizationName><electronicMailAddress>EMAIL@address.com</electronicMailAddress></contact><project id="1116c94a-8cd5-480d-a1f3-dac794e57c05" system=""><title>Project Name</title><personnel><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName><organizationName>A Rocha Canada</organizationName><electronicMailAddress>EMAIL@address.com</electronicMailAddress><role>pointOfContact</role></personnel><abstract><section><title>Objectives</title><para>Objectives</para></section></abstract><funding><section><title>Agency Name</title><para>BC Hydro</para><section><title>Funding Agency Project ID</title><para>AGENCY PROJECT ID</para></section><section><title>Investment Action/Category</title><para>Not Applicable</para></section><section><title>Funding Amount</title><para>123456789</para></section><section><title>Funding Start Date</title><para>2023-01-02</para></section><section><title>Funding End Date</title><para>2023-01-30</para></section></section></funding><studyAreaDescription><coverage><geographicCoverage><geographicDescription>Location Description</geographicDescription><boundingCoordinates><westBoundingCoordinate>-121.904297</westBoundingCoordinate><eastBoundingCoordinate>-120.19043</eastBoundingCoordinate><northBoundingCoordinate>51.971346</northBoundingCoordinate><southBoundingCoordinate>50.930738</southBoundingCoordinate></boundingCoordinates><datasetGPolygon><datasetGPolygonOuterGRing><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint></datasetGPolygonOuterGRing></datasetGPolygon></geographicCoverage><temporalCoverage><rangeOfDates><beginDate><calendarDate>2023-01-01</calendarDate></beginDate><endDate><calendarDate>2023-01-31</calendarDate></endDate></rangeOfDates></temporalCoverage></coverage></studyAreaDescription><relatedProject id="69b506d1-3a50-4a39-b4c7-190bd0b34b96" system=""><title>Survey Name</title><personnel><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName><role>pointOfContact</role></personnel><abstract><section><title>Intended Outcomes</title><para>Habitat Assessment</para></section><section><title>Additional Details</title><para>Additional Details</para></section></abstract><funding><section><title>Agency Name</title><para>BC Hydro</para><section><title>Funding Agency Project ID</title><para>AGENCY PROJECT ID</para></section><section><title>Investment Action/Category</title><para>Not Applicable</para></section><section><title>Funding Amount</title><para>123456789</para></section><section><title>Funding Start Date</title><para>2023-01-02</para></section><section><title>Funding End Date</title><para>2023-01-30</para></section></section></funding><studyAreaDescription><coverage><geographicCoverage><geographicDescription>Survey Area Name</geographicDescription><boundingCoordinates><westBoundingCoordinate>-121.904297</westBoundingCoordinate><eastBoundingCoordinate>-120.19043</eastBoundingCoordinate><northBoundingCoordinate>51.971346</northBoundingCoordinate><southBoundingCoordinate>50.930738</southBoundingCoordinate></boundingCoordinates><datasetGPolygon><datasetGPolygonOuterGRing><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint></datasetGPolygonOuterGRing></datasetGPolygon></geographicCoverage><temporalCoverage><rangeOfDates><beginDate><calendarDate>2023-01-02</calendarDate></beginDate><endDate><calendarDate>2023-01-30</calendarDate></endDate></rangeOfDates></temporalCoverage><taxonomicCoverage><taxonomicClassification><taxonRankName>SPECIES</taxonRankName><taxonRankValue>Alces americanus</taxonRankValue><commonNames>Moose</commonNames><taxonId provider="">2065</taxonId></taxonomicClassification></taxonomicCoverage></coverage></studyAreaDescription><designDescription><description><section><title>Field Method</title><para>Call Playback</para></section><section><title>Ecological Season</title><para>Spring</para></section><section><title>Vantage Codes</title><para><itemizedlist><listitem><para>Aerial</para></listitem></itemizedlist></para></section></description></designDescription></relatedProject></project></dataset><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><projectTypes><projectType>Aquatic Habitat</projectType></projectTypes></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><projectActivities><projectActivity><name>Habitat Protection</name></projectActivity></projectActivities></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><IUCNConservationActions><IUCNConservationAction><IUCNConservationActionLevel1Classification>Awareness Raising</IUCNConservationActionLevel1Classification><IUCNConservationActionLevel2SubClassification>Outreach &amp; Communications</IUCNConservationActionLevel2SubClassification><IUCNConservationActionLevel3SubClassification>Reported and social media</IUCNConservationActionLevel3SubClassification></IUCNConservationAction></IUCNConservationActions></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><stakeholderPartnerships><stakeholderPartnership><name>BC Hydro</name></stakeholderPartnership></stakeholderPartnerships></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><firstNationPartnerships><firstNationPartnership><name>Acho Dene Koe First Nation</name></firstNationPartnership></firstNationPartnerships></metadata></additionalMetadata></eml:eml>`
      );
    });
  });

  describe('buildSurveyEmlPackage', () => {
    it('should build an EML package for a survey successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      sinon
        .stub(ProjectService.prototype, 'getProjectById')
        .resolves({ project: { uuid: '1116c94a-8cd5-480d-a1f3-dac794e57c05' } } as IGetProject);

      sinon
        .stub(SurveyService.prototype, 'getSurveyById')
        .resolves({ survey_details: { uuid: '69b506d1-3a50-4a39-b4c7-190bd0b34b9' } } as SurveyObject);

      // Build EML section
      sinon.stub(EmlService.prototype, '_buildEmlSection').returns({
        $: {
          packageId: 'urn:uuid:1116c94a-8cd5-480d-a1f3-dac794e57c05',
          system: '',
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      });

      // Build dataset EML section
      sinon.stub(EmlService.prototype, '_buildSurveyEmlDatasetSection').returns({
        $: {
          system: '',
          id: '1116c94a-8cd5-480d-a1f3-dac794e57c05'
        },
        title: 'Survey Name',
        creator: {
          individualName: {
            givenName: 'First Name',
            surName: 'Last Name'
          }
        },
        pubDate: '2023-03-13',
        language: 'English',
        contact: {
          individualName: {
            givenName: 'First Name',
            surName: 'Last Name'
          }
        }
      });

      // Build Project EML section
      sinon.stub(EmlService.prototype, '_buildSurveyEmlProjectSection').resolves({
        $: {
          id: '69b506d1-3a50-4a39-b4c7-190bd0b34b96',
          system: ''
        },
        title: 'Survey Name',
        personnel: [
          {
            individualName: {
              givenName: 'First Name',
              surName: 'Last Name'
            },
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [
            {
              title: 'Intended Outcomes',
              para: 'Habitat Assessment'
            },
            {
              title: 'Additional Details',
              para: 'Additional Details'
            }
          ]
        },
        studyAreaDescription: {
          coverage: {
            geographicCoverage: {
              geographicDescription: 'Survey Area Name',
              boundingCoordinates: {
                westBoundingCoordinate: -121.904297,
                eastBoundingCoordinate: -120.19043,
                northBoundingCoordinate: 51.971346,
                southBoundingCoordinate: 50.930738
              },
              datasetGPolygon: [
                {
                  datasetGPolygonOuterGRing: [
                    {
                      gRingPoint: [
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -121.904297
                        },
                        {
                          gRingLatitude: 51.971346,
                          gRingLongitude: -121.904297
                        },
                        {
                          gRingLatitude: 51.971346,
                          gRingLongitude: -120.19043
                        },
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -120.19043
                        },
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -121.904297
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            temporalCoverage: {
              rangeOfDates: {
                beginDate: {
                  calendarDate: '2023-01-02'
                },
                endDate: {
                  calendarDate: '2023-01-30'
                }
              }
            },
            taxonomicCoverage: {
              taxonomicClassification: [
                {
                  taxonRankName: 'SPECIES',
                  taxonRankValue: 'Alces americanus',
                  commonNames: 'Moose',
                  taxonId: {
                    $: {
                      provider: ''
                    },
                    _: '2065'
                  }
                }
              ]
            }
          }
        },
        designDescription: {
          description: {
            section: [
              {
                title: 'Field Method',
                para: 'Call Playback'
              },
              {
                title: 'Ecological Season',
                para: 'Spring'
              },
              {
                title: 'Vantage Codes',
                para: {
                  itemizedlist: {
                    listitem: [
                      {
                        para: 'Aerial'
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      });

      // Build Project additional metadata
      sinon.stub(EmlService.prototype, '_getProjectAdditionalMetadata').resolves([
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: { projectTypes: { projectType: 'Aquatic Habitat' } }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            projectActivities: {
              projectActivity: [{ name: 'Habitat Protection' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            IUCNConservationActions: {
              IUCNConservationAction: [
                {
                  IUCNConservationActionLevel1Classification: 'Awareness Raising',
                  IUCNConservationActionLevel2SubClassification: 'Outreach & Communications',
                  IUCNConservationActionLevel3SubClassification: 'Reported and social media'
                }
              ]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            stakeholderPartnerships: {
              stakeholderPartnership: [{ name: 'BC Hydro' }]
            }
          }
        },
        {
          describes: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          metadata: {
            firstNationPartnerships: {
              firstNationPartnership: [{ name: 'Acho Dene Koe First Nation' }]
            }
          }
        }
      ]);

      // Build survey additional metadata
      sinon.stub(EmlService.prototype, '_getSurveyAdditionalMetadata').resolves([]);

      // Build related project section
      sinon.stub(EmlService.prototype, '_buildProjectEmlProjectSection').returns({
        $: {
          id: '1116c94a-8cd5-480d-a1f3-dac794e57c05',
          system: ''
        },
        title: 'Project Name',
        personnel: [
          {
            individualName: {
              givenName: 'First Name',
              surName: 'Last Name'
            },
            organizationName: 'A Rocha Canada',
            electronicMailAddress: 'EMAIL@address.com',
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [
            {
              title: 'Objectives',
              para: 'Objectives'
            }
          ]
        },
        studyAreaDescription: {
          coverage: {
            geographicCoverage: {
              geographicDescription: 'Location Description',
              boundingCoordinates: {
                westBoundingCoordinate: -121.904297,
                eastBoundingCoordinate: -120.19043,
                northBoundingCoordinate: 51.971346,
                southBoundingCoordinate: 50.930738
              },
              datasetGPolygon: [
                {
                  datasetGPolygonOuterGRing: [
                    {
                      gRingPoint: [
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -121.904297
                        },
                        {
                          gRingLatitude: 51.971346,
                          gRingLongitude: -121.904297
                        },
                        {
                          gRingLatitude: 51.971346,
                          gRingLongitude: -120.19043
                        },
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -120.19043
                        },
                        {
                          gRingLatitude: 50.930738,
                          gRingLongitude: -121.904297
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            temporalCoverage: {
              rangeOfDates: {
                beginDate: {
                  calendarDate: '2023-01-01'
                },
                endDate: {
                  calendarDate: '2023-01-31'
                }
              }
            }
          }
        }
      });

      const emlPackage = await emlService.buildSurveyEmlPackage({ surveyId: 1 });
      expect(emlPackage.toString()).to.equal(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><eml:eml packageId="urn:uuid:1116c94a-8cd5-480d-a1f3-dac794e57c05" system="" xmlns:eml="https://eml.ecoinformatics.org/eml-2.2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:stmml="http://www.xml-cml.org/schema/schema24" xsi:schemaLocation="https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd"><dataset system="" id="1116c94a-8cd5-480d-a1f3-dac794e57c05"><title>Survey Name</title><creator><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName></creator><pubDate>2023-03-13</pubDate><language>English</language><contact><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName></contact><project id="69b506d1-3a50-4a39-b4c7-190bd0b34b96" system=""><title>Survey Name</title><personnel><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName><role>pointOfContact</role></personnel><abstract><section><title>Intended Outcomes</title><para>Habitat Assessment</para></section><section><title>Additional Details</title><para>Additional Details</para></section></abstract><funding><section><title>Agency Name</title><para>BC Hydro</para><section><title>Funding Agency Project ID</title><para>AGENCY PROJECT ID</para></section><section><title>Investment Action/Category</title><para>Not Applicable</para></section><section><title>Funding Amount</title><para>123456789</para></section><section><title>Funding Start Date</title><para>2023-01-02</para></section><section><title>Funding End Date</title><para>2023-01-30</para></section></section></funding><studyAreaDescription><coverage><geographicCoverage><geographicDescription>Survey Area Name</geographicDescription><boundingCoordinates><westBoundingCoordinate>-121.904297</westBoundingCoordinate><eastBoundingCoordinate>-120.19043</eastBoundingCoordinate><northBoundingCoordinate>51.971346</northBoundingCoordinate><southBoundingCoordinate>50.930738</southBoundingCoordinate></boundingCoordinates><datasetGPolygon><datasetGPolygonOuterGRing><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint></datasetGPolygonOuterGRing></datasetGPolygon></geographicCoverage><temporalCoverage><rangeOfDates><beginDate><calendarDate>2023-01-02</calendarDate></beginDate><endDate><calendarDate>2023-01-30</calendarDate></endDate></rangeOfDates></temporalCoverage><taxonomicCoverage><taxonomicClassification><taxonRankName>SPECIES</taxonRankName><taxonRankValue>Alces americanus</taxonRankValue><commonNames>Moose</commonNames><taxonId provider="">2065</taxonId></taxonomicClassification></taxonomicCoverage></coverage></studyAreaDescription><designDescription><description><section><title>Field Method</title><para>Call Playback</para></section><section><title>Ecological Season</title><para>Spring</para></section><section><title>Vantage Codes</title><para><itemizedlist><listitem><para>Aerial</para></listitem></itemizedlist></para></section></description></designDescription><relatedProject id="1116c94a-8cd5-480d-a1f3-dac794e57c05" system=""><title>Project Name</title><personnel><individualName><givenName>First Name</givenName><surName>Last Name</surName></individualName><organizationName>A Rocha Canada</organizationName><electronicMailAddress>EMAIL@address.com</electronicMailAddress><role>pointOfContact</role></personnel><abstract><section><title>Objectives</title><para>Objectives</para></section></abstract><funding><section><title>Agency Name</title><para>BC Hydro</para><section><title>Funding Agency Project ID</title><para>AGENCY PROJECT ID</para></section><section><title>Investment Action/Category</title><para>Not Applicable</para></section><section><title>Funding Amount</title><para>123456789</para></section><section><title>Funding Start Date</title><para>2023-01-02</para></section><section><title>Funding End Date</title><para>2023-01-30</para></section></section></funding><studyAreaDescription><coverage><geographicCoverage><geographicDescription>Location Description</geographicDescription><boundingCoordinates><westBoundingCoordinate>-121.904297</westBoundingCoordinate><eastBoundingCoordinate>-120.19043</eastBoundingCoordinate><northBoundingCoordinate>51.971346</northBoundingCoordinate><southBoundingCoordinate>50.930738</southBoundingCoordinate></boundingCoordinates><datasetGPolygon><datasetGPolygonOuterGRing><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>51.971346</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-120.19043</gRingLongitude></gRingPoint><gRingPoint><gRingLatitude>50.930738</gRingLatitude><gRingLongitude>-121.904297</gRingLongitude></gRingPoint></datasetGPolygonOuterGRing></datasetGPolygon></geographicCoverage><temporalCoverage><rangeOfDates><beginDate><calendarDate>2023-01-01</calendarDate></beginDate><endDate><calendarDate>2023-01-31</calendarDate></endDate></rangeOfDates></temporalCoverage></coverage></studyAreaDescription></relatedProject></project></dataset><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><projectTypes><projectType>Aquatic Habitat</projectType></projectTypes></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><projectActivities><projectActivity><name>Habitat Protection</name></projectActivity></projectActivities></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><IUCNConservationActions><IUCNConservationAction><IUCNConservationActionLevel1Classification>Awareness Raising</IUCNConservationActionLevel1Classification><IUCNConservationActionLevel2SubClassification>Outreach &amp; Communications</IUCNConservationActionLevel2SubClassification><IUCNConservationActionLevel3SubClassification>Reported and social media</IUCNConservationActionLevel3SubClassification></IUCNConservationAction></IUCNConservationActions></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><stakeholderPartnerships><stakeholderPartnership><name>BC Hydro</name></stakeholderPartnership></stakeholderPartnerships></metadata></additionalMetadata><additionalMetadata><describes>1116c94a-8cd5-480d-a1f3-dac794e57c05</describes><metadata><firstNationPartnerships><firstNationPartnership><name>Acho Dene Koe First Nation</name></firstNationPartnership></firstNationPartnerships></metadata></additionalMetadata></eml:eml>`
      );
    });
  });

  describe('codes', () => {
    const mockAllCodesResponse = {
      management_action_type: [],
      first_nations: [],
      agency: [],
      investment_action_category: [],
      type: [],
      program: [],
      proprietor_type: [],
      iucn_conservation_action_level_1_classification: [],
      iucn_conservation_action_level_2_subclassification: [],
      iucn_conservation_action_level_3_subclassification: [],
      system_roles: [],
      project_roles: [],
      administrative_activity_status_type: [],
      intended_outcomes: [],
      vantage_codes: [],
      site_selection_strategies: [],
      survey_jobs: [],
      sample_methods: [],
      survey_progress: [],
      method_response_metrics: []
    };

    it('should retrieve codes if _codes is undefined', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const codeStub = sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves(mockAllCodesResponse);

      const codes = await emlService.codes();

      expect(emlService._codes).to.eql(mockAllCodesResponse);
      expect(emlService._codes).to.eql(codes);
      expect(codeStub).to.be.calledOnce;
    });

    it('should return cached codes if _codes is not undefined', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      emlService._codes = mockAllCodesResponse;

      const codeStub = sinon.stub(CodeService.prototype, 'getAllCodeSets');

      const codes = await emlService.codes();

      expect(emlService._codes).to.eql(mockAllCodesResponse);
      expect(emlService._codes).to.eql(codes);
      expect(codeStub).not.to.be.called;
    });

    it('should return cached codes upon subsequent calls', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const codeStub = sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves(mockAllCodesResponse);

      const freshCodes = await emlService.codes();
      const cachedCodes = await emlService.codes();

      expect(freshCodes).to.eql(cachedCodes);
      expect(codeStub).to.be.calledOnce;
    });
  });

  describe('loadEmlDbConstants', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should yield Not Supplied constants if the database returns no rows', async () => {
      const mockQuery = sinon.stub();

      mockQuery.onCall(0).resolves({ rowCount: 0, rows: [] });
      mockQuery.onCall(1).resolves({ rowCount: 0, rows: [] });
      mockQuery.onCall(2).resolves({ rowCount: 0, rows: [] });
      mockQuery.onCall(3).resolves({ rowCount: 0, rows: [] });
      mockQuery.onCall(4).resolves({ rowCount: 0, rows: [] });
      mockQuery.onCall(5).resolves({ rowCount: 0, rows: [] });

      const mockDBConnection = {
        ...getMockDBConnection(),
        sql: mockQuery
      };

      const emlService = new EmlService(mockDBConnection);

      await emlService.loadEmlDbConstants();

      expect(emlService._constants).to.eql({
        EML_VERSION: '1.0.0',
        EML_PROVIDER_URL: 'Not Supplied',
        EML_SECURITY_PROVIDER_URL: 'Not Supplied',
        EML_ORGANIZATION_NAME: 'Not Supplied',
        EML_ORGANIZATION_URL: 'Not Supplied',
        EML_TAXONOMIC_PROVIDER_URL: 'Not Supplied',
        EML_INTELLECTUAL_RIGHTS: 'Not Supplied'
      });
    });

    it('should yield Not Supplied constants if the database returns null constants', async () => {
      const mockQuery = sinon.stub();

      mockQuery.onCall(0).resolves({ rowCount: 0, rows: [{ constant: null }] });
      mockQuery.onCall(1).resolves({ rowCount: 0, rows: [{ constant: null }] });
      mockQuery.onCall(2).resolves({ rowCount: 0, rows: [{ constant: null }] });
      mockQuery.onCall(3).resolves({ rowCount: 0, rows: [{ constant: null }] });
      mockQuery.onCall(4).resolves({ rowCount: 0, rows: [{ constant: null }] });
      mockQuery.onCall(5).resolves({ rowCount: 0, rows: [{ constant: null }] });

      const mockDBConnection = {
        ...getMockDBConnection(),
        sql: mockQuery
      };

      const emlService = new EmlService(mockDBConnection);

      await emlService.loadEmlDbConstants();

      expect(emlService._constants).to.eql({
        EML_VERSION: '1.0.0',
        EML_PROVIDER_URL: 'Not Supplied',
        EML_SECURITY_PROVIDER_URL: 'Not Supplied',
        EML_ORGANIZATION_NAME: 'Not Supplied',
        EML_ORGANIZATION_URL: 'Not Supplied',
        EML_TAXONOMIC_PROVIDER_URL: 'Not Supplied',
        EML_INTELLECTUAL_RIGHTS: 'Not Supplied'
      });
    });

    it('should fetch DB constants successfully', async () => {
      const mockQuery = sinon.stub();

      mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ constant: 'test-org-url' }] });
      mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ constant: 'test-org-name' }] });
      mockQuery.onCall(2).resolves({ rowCount: 1, rows: [{ constant: 'test-provider-url' }] });
      mockQuery.onCall(3).resolves({ rowCount: 1, rows: [{ constant: 'test-security-provider' }] });
      mockQuery.onCall(4).resolves({ rowCount: 1, rows: [{ constant: 'test-int-rights' }] });
      mockQuery.onCall(5).resolves({ rowCount: 1, rows: [{ constant: 'test-taxon-url' }] });

      const mockDBConnection = {
        ...getMockDBConnection(),
        sql: mockQuery
      };

      const emlService = new EmlService(mockDBConnection);

      await emlService.loadEmlDbConstants();

      expect(emlService._constants).to.eql({
        EML_VERSION: '1.0.0',
        EML_ORGANIZATION_URL: 'test-org-url',
        EML_ORGANIZATION_NAME: 'test-org-name',
        EML_PROVIDER_URL: 'test-provider-url',
        EML_SECURITY_PROVIDER_URL: 'test-security-provider',
        EML_INTELLECTUAL_RIGHTS: 'test-int-rights',
        EML_TAXONOMIC_PROVIDER_URL: 'test-taxon-url'
      });
    });
  });

  describe('_buildEmlSection', () => {
    it('should build an EML section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const response = emlService._buildEmlSection('aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii');
      expect(response).to.eql({
        $: {
          packageId: 'urn:uuid:aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii',
          system: '',
          'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:stmml': 'http://www.xml-cml.org/schema/schema24',
          'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
        }
      });
    });
  });

  describe('_buildProjectEmlDatasetSection', () => {
    it('should build an EML dataset section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockOrg = {
        organizationName: 'Test Organization',
        electronicMailAddress: 'EMAIL@address.com'
      };

      const mockPackageId = 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii';
      const mockProjectData = {
        project: {
          project_name: 'Test Project Name'
        }
      } as IGetProject;

      sinon.stub(EmlService.prototype, '_getProjectDatasetCreator').returns(mockOrg);

      sinon.stub(EmlService.prototype, '_makeEmlDateString').returns('2023-01-01');

      sinon.stub(EmlService.prototype, '_getProjectContact').returns({
        individualName: {
          givenName: 'First Name',
          surName: 'Last Name'
        },
        ...mockOrg
      });

      const response = emlService._buildProjectEmlDatasetSection(mockPackageId, mockProjectData);

      expect(response).to.eql({
        $: { system: '', id: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii' },
        title: 'Test Project Name',
        creator: {
          organizationName: 'Test Organization',
          electronicMailAddress: 'EMAIL@address.com'
        },
        pubDate: '2023-01-01',
        language: 'English',
        contact: {
          individualName: {
            givenName: 'First Name',
            surName: 'Last Name'
          },
          organizationName: 'Test Organization',
          electronicMailAddress: 'EMAIL@address.com'
        }
      });
    });
  });

  describe('_buildProjectEmlProjectSection', () => {
    it('should build a project EML Project section', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockProjectData = {
        project: {
          uuid: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii',
          project_name: 'Test Project Name'
        },
        objectives: {
          objectives: 'Project objectives.'
        }
      } as IGetProject;

      sinon.stub(EmlService.prototype, '_getProjectPersonnel').returns([
        {
          individualName: { givenName: 'First Name', surName: 'Last Name' },
          organizationName: 'A Rocha Canada',
          electronicMailAddress: 'EMAIL@address.com',
          role: 'pointOfContact'
        }
      ]);

      sinon.stub(EmlService.prototype, '_getProjectTemporalCoverage').returns({
        rangeOfDates: {
          beginDate: { calendarDate: '2023-01-01' },
          endDate: { calendarDate: '2023-01-31' }
        }
      });

      const response = emlService._buildProjectEmlProjectSection(mockProjectData, []);

      expect(response).to.eql({
        $: { id: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii', system: '' },
        title: 'Test Project Name',
        personnel: [
          {
            individualName: { givenName: 'First Name', surName: 'Last Name' },
            organizationName: 'A Rocha Canada',
            electronicMailAddress: 'EMAIL@address.com',
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [{ title: 'Objectives', para: 'Project objectives.' }]
        },
        studyAreaDescription: {
          coverage: {
            geographicCoverage: {
              geographicDescription: 'Location Description',
              boundingCoordinates: {
                westBoundingCoordinate: -121.904297,
                eastBoundingCoordinate: -120.19043,
                northBoundingCoordinate: 51.971346,
                southBoundingCoordinate: 50.930738
              },
              datasetGPolygon: [
                {
                  datasetGPolygonOuterGRing: [
                    {
                      gRingPoint: [
                        { gRingLatitude: 50.930738, gRingLongitude: -121.904297 },
                        { gRingLatitude: 51.971346, gRingLongitude: -121.904297 },
                        { gRingLatitude: 51.971346, gRingLongitude: -120.19043 },
                        { gRingLatitude: 50.930738, gRingLongitude: -120.19043 },
                        { gRingLatitude: 50.930738, gRingLongitude: -121.904297 }
                      ]
                    }
                  ]
                }
              ]
            },
            temporalCoverage: {
              rangeOfDates: {
                beginDate: { calendarDate: '2023-01-01' },
                endDate: { calendarDate: '2023-01-31' }
              }
            }
          }
        }
      });
    });

    it('should build if optional parameters are missing', () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockProjectData = {
        project: {
          uuid: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii',
          project_name: 'Test Project Name'
        },
        objectives: {
          objectives: 'Project objectives.'
        }
      } as IGetProject;

      sinon.stub(EmlService.prototype, '_getProjectPersonnel').returns([
        {
          individualName: { givenName: 'First Name', surName: 'Last Name' },
          organizationName: 'A Rocha Canada',
          electronicMailAddress: 'EMAIL@address.com',
          role: 'pointOfContact'
        }
      ]);

      sinon.stub(EmlService.prototype, '_getProjectTemporalCoverage').returns({
        rangeOfDates: {
          beginDate: { calendarDate: '2023-01-01' },
          endDate: { calendarDate: '2023-01-31' }
        }
      });

      const response = emlService._buildProjectEmlProjectSection(mockProjectData, []);

      expect(response).to.eql({
        $: { id: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhhiiii', system: '' },
        title: 'Test Project Name',
        personnel: [
          {
            individualName: { givenName: 'First Name', surName: 'Last Name' },
            organizationName: 'A Rocha Canada',
            electronicMailAddress: 'EMAIL@address.com',
            role: 'pointOfContact'
          }
        ],
        abstract: {
          section: [{ title: 'Objectives', para: 'Project objectives.' }]
        },
        studyAreaDescription: {
          coverage: {
            temporalCoverage: {
              rangeOfDates: {
                beginDate: { calendarDate: '2023-01-01' },
                endDate: { calendarDate: '2023-01-31' }
              }
            }
          }
        }
      });
    });
  });

  describe('_getSurveyAdditionalMetadata', async () => {
    it('should return an empty array, since there is (currently) no additional metadata for surveys', async () => {
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const additionalMeta = await emlService._getSurveyAdditionalMetadata([]);

      expect(additionalMeta).to.eql([]);
    });
  });

  describe('_getProjectAdditionalMetadata', () => {
    // TODO
  });

  describe('_getProjectDatasetCreator', () => {
    // TODO
  });

  describe('_getProjectContact', () => {
    // TODO
  });

  describe('_getProjectPersonnel', () => {
    // TODO
  });

  describe('_getSurveyPersonnel', () => {
    it('should return survey personnel', async () => {
      // TODO: Replace this test once SIMSBIOHUB-275 is merged.
      /*
      const mockDBConnection = getMockDBConnection();
      const emlService = new EmlService(mockDBConnection);

      const mockSurveyData = {
        survey_details: {
          biologist_first_name: 'biologist-fname',
          biologist_last_name: 'biologist-lname'
        }
      } as SurveyObject;

      const response = emlService._getSurveyPersonnel(mockSurveyData);

      expect(response).to.eql([
        {
          individualName: { givenName: 'biologist-fname', surName: 'biologist-lname' },
          role: 'pointOfContact'
        }
      ]);
      */
    });
  });

  describe('_getProjectTemporalCoverage', () => {
    //
  });

  describe('_getSurveyTemporalCoverage', () => {
    //
  });

  describe('_makeEmlDateString', () => {
    //
  });

  describe('_makePolygonFeatures', () => {
    //
  });

  describe('_makeDatasetGPolygons', () => {
    //
  });

  describe('_getProjectGeographicCoverage', () => {
    //
  });

  describe('_getSurveyGeographicCoverage', () => {
    //
  });

  describe('_getSurveyFocalTaxonomicCoverage', () => {
    //
  });

  describe('_getSurveyDesignDescription', () => {
    //
  });

  describe('_buildAllSurveyEmlProjectSections', () => {
    //
  });

  describe('_buildSurveyEmlProjectSection', () => {
    //
  });
});
