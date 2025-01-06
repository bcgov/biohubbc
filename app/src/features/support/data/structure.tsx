import { Typography } from '@mui/material';
import { EnumMarkdownTypes, SupportPageView } from './types';

const structure = [
  {
    label: 'Role-Based Security',
    description: [
      <Typography variant="body1" gutterBottom>
        This section will further clarify the basis of the data structure in SIMS: the project-survey hierarchy.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Projects are the structures that allow for role-based security. There are three roles in SIMS that facilitate
        role-based security within a project, each project member must have one designated role of the following: a
        coordinator role, a collaborator role, or an observer role.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.STRUCTURE]?.[0]
  },
  {
    label: 'Project Components',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Projects</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Projects are loosely defined and can be used for whichever best suits the needs of the study team. The main
        advantage and function of a project is that they allow for role-based security within the system.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Projects contain surveys, and act as an umbrella that unifies individual studies. It is up to the discretion of
        the project team what the basis of this unification is. For example, a project team may choose to use the
        project as a structure under which to group like studies. They may have conducted the same study 10 times over a
        number of years, and group all those within a project. Other teams may group studies together that monitor the
        same species over multiple regions or do the inverse and group studies that monitor multiple species in a single
        region. Some project teams may choose to group studies based on the fact that the same team conducted them all.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        There is no limit to the number of projects that a SIMS user, or a collaborative team, can create. One caveat to
        keep in mind is that as you begin to publish surveys to BioHub, there will be a record of the project name from
        which the surveys were published, so that these studies can be easily associated with one another. This feature
        ensures that data requestors are able to locate and relate like studies together.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.STRUCTURE]?.[1]
  },
  {
    label: 'Survey Metadata',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Surveys</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
       Surveys describe and house data for individual studies. A survey is the combination of the metadata describing the study, and the data that is loaded into it. The metadata defines the parameters through which the study was conducted and creates a shell to which the study data is loaded. The survey shell lays the foundation for the remaining topics in this support manual.  
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Creating a survey will prompt the user to submit metadata defining their project. Study data cannot be submitted until these metadata have been defined. These survey metadata can be edited at any time after creation. 
      </Typography>       
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.STRUCTURE]?.[2]
  },
  {
    label: 'Survey Data',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Survey Data</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        TEXT
      </Typography>
    ]
  },
  {
    label: 'Survey Attachments',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Survey Attachments</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Text
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.STRUCTURE]?.[3]
  },
  {
    label: 'Publishing to BioHub',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Publishing to BioHub</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        TEXT
      </Typography>
    ]
  },
  {
    label: 'FAQ',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>FAQ</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>
          I have a report that contains data from multiple surveys within one project that I would like to make
          available. If I attach this report at the project level will I be able to publish it to BioHub?
        </strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Currently, only surveys and the data within them have the capability to be published to BioHub. The best place
        for reports or data that you would like to make accessible are at the survey level. If your study team is using
        the project to store any files associated with the planning and execution of your study, or other files that are
        not meant to be made accessible to others, the files will not be published from the project.
      </Typography>
    ]
  }
];

export default structure;
