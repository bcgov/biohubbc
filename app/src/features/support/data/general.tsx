import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types'; // Adjust the import paths as necessary

const general = [
  {
    label: 'Relic System: Species Inventory (SPI)',
    description: [
      <Typography variant="body1" gutterBottom>
        Species Inventory Management System (SIMS) is a space to collaboratively manage fish and wildlife data with
        project partners across organizations. SIMS acts as a planning, data management, and data submission tool, in a
        shared workspace that is private to your project team.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        The primary objective of SIMS is to act as a data management tool as opposed to exclusively a data submissions
        platform. Please think of SIMS as a digital notebook, shared only within your team. SIMS is not used as an
        interface for data sharing or publication; any information loaded into your private project by a project team
        will remain private and secure. Data only becomes accessible to others outside your team once you press the
        publish button on your survey to send your information to BiodiversityHub BC (BioHub), which is the interface
        for data sharing and security management.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>Appropriate Use of SIMS</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        SIMS is best used by individuals and/or collaborators who are conducting data-generating studies. SIMS is not
        appropriate for individuals who are not part of project teams but are instead hoping to look at others’ data.
        Unless invited to a project and granted explicit permission within the system to view project content, users
        will not have access to any data, including any list of projects in SIMS.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Data is best accessed through BioHUB once a project team has decided to publish their data, and property data
        security has been applied.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>Data Structure in SIMS</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Data in SIMS is organized in a project-survey hierarchy. Projects can be thought of as the shared workspace of
        your study team. You may create as many projects as you would like.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Nested within projects are surveys. Surveys contain data that have a more clearly defined purpose than your
        project/workspace shell. Generally, it is thought that a discrete study is parceled as a survey, and repeated
        studies may be managed as separate surveys within one project umbrella. It is up to the discretion of the
        project team on the best use of the project-survey hierarchy for their study structure. Please note that
        projects are not published, if you would like to publish your data to BiodiversityHub for data sharing and
        security management, publication is only achieved at the survey level. However, publishing multiple surveys from
        the same project to BiodiversityHub will create a clear link between them, allowing for better integration and
        context across related datasets.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>SIMS Roles</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        When initially signing up for SIMS, the system will prompt you to select a permissions role. Most users will be
        creators, the role which allows for the creation of projects and surveys, and the data management capacity
        within that project-survey framework. Creators will not be able to see any projects or surveys that they have
        not created themselves or otherwise been invited to participate in.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        The other roles in SIMS are data administrators and system administrators. These roles are limited to a select
        group of government staff to help with site upkeep such as allowing users into SIMS and assisting teams with
        their data if help should be requested.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.GENERAL]?.[0] || MarkdownTypeSupportNameEnum.SPI
  },
  {
    label: 'FAQ',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>FAQ</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>Will my data end up in the BC Geographic Warehouse (BCGW)?</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        SIMS does not push data directly into BCGW, the pipeline for getting any data onto other platforms from SIMS
        would be to first publish data to BioHub. Data will then undergo a security assessment to determine
        accessibility. If you have any accessibility or security concerns with your dataset you can make these known at
        the time of your publication. You can also publish your survey more than once if you have additional information
        (data or considerations) that you would like available in BioHub. Depending on the type of data and the security
        clearance, these data can then be loaded into the Wildlife Species Inventory (WSI) layers in the BCGW.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>
          Someone has requested access to data I am managing in SIMS, what is the most appropriate way to grant them
          access?
        </strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        If a project collaborator, or a partner in co-management, is hoping for access to your project, please feel
        welcome to grant them access through SIMS. For other scenarios or to your comfort, it may be best to direct them
        to BioHub to access data once it has been published. Please contact our team for any clarification or advice on
        specific scenarios.
      </Typography>
    ]
  }
];

export default general;
