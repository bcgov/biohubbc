export const ProjectSurveyHelpI18N = {
  infoTitle: 'Projects and Surveys',
  infoText:
    'Projects and Surveys let you organize and manage access to ecological data. You can think of Projects and Surveys as folders and subfolders, respectively.',
  projectInfoTitle: 'Projects',
  projectInfoText:
    'You can invite other users to a Project to give them access to information in the Project. All of the Projects you have created or been invited to will appear in your Projects list. If you need access to a Project created by your collaborator, your collaborator can invite you.',
  surveyInfoTitle: 'Surveys',
  surveyInfoText:
    'Surveys let you organize ecological data collected in the field. When you return from the field with new data, you can choose to create a new Survey or add the data to an existing Survey. If you do multiple fieldwork trips with a common goal, such as checking hair snares every three months, we recommend adding new data to the existing Survey representing why you are collecting hair.',
  accessInfoTitle: 'Access to Surveys',
  accessInfoText:
    'Surveys must belong to a Project, which determines who can access them. To give someone access to a Survey, you can invite them to the Project. To revoke access, you can remove them from the Project. The development team is working on providing more granular access to specific Surveys in a Project.'
};

export const SummaryDataHelpI18N = {
  infoTitle: 'Data',
  infoText:
    'This section lets you view all of the data that you have access to, combining data across surveys. When you add data to a Survey, those data will show up here. If you are looking for something specific, you can filter the data using search criteria.'
};

export const SamplingInformationHelpI18N = {
  infoTitle: 'Sampling Information',
  infoText: 'This section covers when, where, and how you collected data for this survey.',

  siteTitle: 'Sampling Sites',
  siteInfoText:
    'Sampling sites are the exact spots where you collected data. They can be points, lines, or areas, depending on your study design. If you’re unsure about what your sites are, use locations that best represent where you actually went, not the larger area you’re studying.',

  techniqueTitle: 'Sampling Techniques',
  techniqueInfoText:
    'Techniques are the methods you used to collect data. When you create a technique, you’ll pick a general sampling method that the technique represents, like camera trap, hair snare, or visual encounter. Next, you’ll add extra details about how you did that method, like the type of camera used and the number of images per trigger.',

  periodTitle: 'Sampling Periods',
  periodInfoText:
    'Sampling periods describe when you collected data at each site. They help explain your data: was the species not seen because it wasn’t there, or because sampling hadn’t started yet? Sampling periods are also valuable for providing information about sampling effort.'
};

export const SurveyDataHelpI18N = {
  infoTitle: 'Survey Data',
  infoText: 'This section includes the data collected during your survey.',
  observationsTitle: 'Observations',
  observationsInfoText:
    'Observations are sightings or counts of species. Observations can include the species, location, date, time, count, and any other information you recorded, such as temperature or life stage. Instead of formatting data into a fixed template, you are able to build your own template to match your data.',
  animalTitle: 'Animals',
  animalInfoText:
    'Animals represent individuals that you captured or marked during your survey. After creating an animal, you can add capture and mortality events. You can indicate any markings that you applied or measurements that you recorded during each event.',
  telemetryTitle: 'Telemetry',
  telemetryInfoText:
    'Telemetry data shows animal movements recorded by GPS devices. To add telemetry data, start by adding device deployments to animals in your survey.'
};

export const ProjectDetailsHelpI18N = {
  infoTitle: 'Project Details',
  infoText:
    'This section shows the objectives and members of the Project. You can edit this information by editing the Project using the settings button.',
  membersTitle: 'Team Members',
  membersInfoText:
    'Team members can access all information in the Project, but only members with the Coordinator and Collaborator role can edit and add new information. You can change the role of a team member when editing the Project.',
  coordinatorsInfoText:
    'Coordinators manage the Project, including inviting new team members, adding and editing data, and publishing Surveys to BiodiversityHub BC. A Project can have multiple Coordinators.',
  collaboratorsInfoText:
    'Collaborators can add and edit data, including create new Surveys, but they cannot invite team members or publish Surveys to BiodiversityHub BC.',
  observersInfoText:
    'Observers have view-only access to information. This role is ideal for those who need access without the need to contribute any new information.'
};

export const SurveyListHelpI18N = {
  infoTitle: 'Surveys',
  infoText:
    'This section shows Surveys in the Project. Surveys contain the actual data being managed, such as species observations. The value of Surveys is to help organize data.'
};

export const SurveyPageHelpI18N = {
  infoTitle: 'Survey Page',
  infoText: 'This page shows the details a specific Survey.',
  componentsInfoTitle: 'Components of a Survey',
  componentsInfoText: 'Surveys can include sampling information, data, attachments, and metadata.',
  samplingInfoText: 'Sampling information describes precisely where, when, and how data were collected.',
  dataInfoText: 'Survey data represents what was recorded while sampling, such as species observations.',
  attachmentsInfoText:
    'Attachments provide supplementary information not captured in the data, such as detailed maps of the study area.',
  metadata:
    'Metadata is the information entered when the Survey was created, such as the start and end dates and objectives. This provides important context for understanding the data.',
  editInfoTitle: 'Editing the Survey',
  editInfoText:
    'Project Coordinators and Collaborators can edit the Survey metadata using the Settings button. Coordinators and Collaborators can add and edit sampling information, survey data, and attachments in the sections below.',
  publishInfoTitle: 'Publishing',
  publishInfoText:
    'Coordinators can publish the Survey to BiodiversityHub BC to share information with a wider audience. If information changes after publishing, a new version can be published.'
};

export const TechniqueHelpI18N = {
  infoTitle: 'Techniques',
  infoText:
    'Techniques represent the sampling methods used to collect data at a sampling site. If you collected data in multiple ways, such as setting up camera traps and walking along transects, you should create multiple techniques. After creating techniques, you will be able to apply them to sampling sites.'
};

export const SamplingSiteHelpI18N = {
  infoTitle: 'Sampling Sites',
  infoText:
    'Sampling sites are the exact locations where you collected data. Sites can be points, lines, or areas on the map. For example, if you used transects, you could use lines to represent each transect. If you surveyed a large area, you could use polygons to represent each area.',
  determiningSitesInfoTitle: 'What is my Sampling Site?',
  determiningSitesInfoText:
    'Sampling sites represent where you had a chance to collect data. Entering precise site locations helps understand why data might not exist in a certain area. If there’s an area with no observations or sites, it’s safe to assume the area wasn’t sampled.',
  repeatSitesInfoTitle: 'Revisiting Sites from an Earlier Survey',
  repeatSitesInfoText:
    'If you’re collecting data at a site from a previous Survey, you’ll need to add a new site at the same location.  This allows you to make updates if the site has changed without affecting the original Survey. Each survey is also designed to be a standalone set of information. Adding a new site at the same location keeps the data organized and easy to manage. To know which sites are the same, you can look for sites with matching or similar locations.'
};

export const SurveyMetadataHelpI18N = {
  infoTitle: '',
  infoText: ''
};
