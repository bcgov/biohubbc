import { pluralize as p } from 'utils/Utils';

export const CreateProjectI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Project',
  createErrorText:
    'An error has occurred while attempting to create your project, please try again. If the error persists, please contact your system administrator.'
};

export const EditProjectI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Editing Project',
  createErrorText:
    'An error has occurred while attempting to edit your project, please try again. If the error persists, please contact your system administrator.'
};

export const ListProjectsI18N = {
  listProjectsErrorDialogTitle: 'Failed to load projects list data',
  listProjectsErrorDialogText:
    'An error occurred while retrieving your list of projects. Please try again. If the error persists, please contact your system administrator.'
};

export const ViewProjectI18N = {
  viewProjectErrorDialogTitle: 'Failed to load project data',
  viewProjectErrorDialogText:
    'The data for this project could not be retrieved. Please try again. If the error persists, please contact your system administrator.'
};

export const CreateSurveyI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Survey',
  createErrorText:
    'An error has occurred while attempting to create your survey, please try again. If the error persists, please contact your system administrator.'
};

export const EditSurveyI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Editing Survey',
  createErrorText:
    'An error has occurred while attempting to edit your survey, please try again. If the error persists, please contact your system administrator.'
};

export const CancelDialogI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?'
};

export const AttachmentsI18N = {
  cancelTitle: 'Cancel Upload',
  cancelText: 'Are you sure you want to cancel?',
  uploadErrorTitle: 'Error Uploading Attachments',
  uploadErrorText:
    'An error has occurred while attempting to upload attachments, please try again. If the error persists, please contact your system administrator.',
  deleteErrorTitle: 'Error Deleting Attachment',
  deleteErrorText:
    'An error has occurred while attempting to delete attachments, please try again. If the error persists, please contact your system administrator.',
  downloadErrorTitle: 'Error Downloading Attachment',
  downloadErrorText:
    'An error has occurred while attempting to download an attachment, please try again. If the error persists, please contact your system administrator.'
};

export const AccessRequestI18N = {
  requestTitle: 'Access Request',
  requestText: 'Error requesting access',
  requestErrorText:
    'An error has occurred while attempting to make an access request, please try again. If the error persists, please contact your system administrator.'
};

export const AccessApprovalDispatchI18N = {
  reviewErrorTitle: 'Error dispatching granted access notification',
  reviewErrorText:
    'The access request was approved successfully, but an error occurred while attempting to notify the user. Please contact your system administrator.'
};

export const AccessDenialDispatchI18N = {
  reviewErrorTitle: 'Error dispatching denied access notification',
  reviewErrorText:
    'The access request was denied successfully, but an error occurred while attempting to notify the user. Please contact your system administrator.'
};

export const ReviewAccessRequestI18N = {
  reviewErrorTitle: 'Error reviewing access request',
  reviewErrorText:
    'An error has occurred while attempting to review this access request. Please try again. If the error persists, please contact a system administrator.'
};

export const DeleteProjectI18N = {
  deleteTitle: 'Delete Project?',
  deleteText: 'Deleting this project will remove all attachments and related surveys. This action cannot be undone.',
  deleteErrorTitle: 'Error Deleting Project',
  deleteErrorText:
    'An error has occurred while attempting to delete this project. Please try again. If the error persists, please contact your system administrator.'
};

export const DeleteSurveyI18N = {
  deleteTitle: 'Delete Survey?',
  deleteText:
    'Are you sure you want to delete this survey? This will remove all attachments, observations, and other related data. This action cannot be undone.',
  deleteErrorTitle: 'Error Deleting Survey',
  deleteErrorText:
    'An error has occurred while attempting to delete this survey. If the error persists, please contact your system administrator.'
};

export const AddSystemUserI18N = {
  addUserErrorTitle: 'Error Adding System User',
  addUserErrorText:
    'An error has occurred while attempting to add the system user. This user has already been granted this role. If the error persists, please contact your system administrator.'
};

export const UpdateSystemUserI18N = {
  updateUserErrorTitle: 'Error Updating System User',
  updateUserErrorText:
    'An error has occurred while attempting to update the system user. If the error persists, please contact your system administrator.'
};

export const DeleteSystemUserI18N = {
  deleteUserErrorTitle: 'Error Deleting System User',
  deleteUserErrorText:
    'An error has occurred while attempting to delete the system user. If the error persists, please contact your system administrator.'
};

export const ProjectParticipantsI18N = {
  getParticipantsErrorTitle: 'Error Fetching Project Team Members',
  getParticipantsErrorText:
    'An error has occurred while attempting to fetch project team members, please try again. If the error persists, please contact your system administrator.',
  addParticipantsErrorTitle: 'Error Adding Project Team Members',
  addParticipantsErrorText:
    'An error has occurred while attempting to add project team members, please try again. If the error persists, please contact your system administrator.',
  removeParticipantTitle: 'Remove team member?',
  removeParticipantErrorTitle: 'Error Removing Project Team Member',
  removeParticipantErrorText:
    'An error has occurred while attempting to remove the project team member, please try again. If the error persists, please contact your system administrator.',
  updateParticipantRoleErrorTitle: 'Error Updating Project Role',
  updateParticipantRoleErrorText:
    "An error has occurred while attempting to update the user's project role, please try again. If the error persists, please contact your system administrator."
};

export const SystemUserI18N = {
  deleteProjectLeadErrorTitle: 'Error Deleting Coordinator',
  deleteProjectLeadErrorText:
    'An error has occurred while attempting to delete the coordinator, please assign a different coordinator before removing. Please try again, if the error persists please contact your system administrator.',
  updateProjectLeadRoleErrorTitle: 'Error Updating Coordinator Role',
  updateProjectLeadRoleErrorText:
    "An error has occurred while attempting to update the user's coordinator role, please assign a different coordinator before changing. Please try again, if the error persists please contact your system administrator.",
  removeSystemUserTitle: 'Remove system user?',
  removeUserFromProject: 'Remove user from project?',
  removeUserErrorTitle: 'Error Removing User From Team',
  removeUserErrorText:
    'An error has occurred while attempting to remove the user from the team, please try again. If the error persists, please contact your system administrator.'
};

export const SubmitBiohubI18N = {
  submitBiohubErrorTitle: 'An error has occurred',
  submitBiohubErrorText: 'An error has occurred while attempting to submit your information. Please try again later.',
  noInformationDialogTitle: 'No Information to Submit',
  noInformationDialogText: 'No information has been uploaded to Biohub for submission.'
};

export const SubmitProjectBiohubI18N = {
  submitProjectBiohubDialogTitle: 'Submit Project Information',
  submitProjectBiohubSuccessDialogTitle: 'Project documents submitted',
  submitProjectBiohubSuccessDialogText: 'Thank you for submitting your project data to Biohub.',
  submitProjectBiohubNoSubmissionDataDialogTitle: 'No documents to submit',
  submitProjectBiohubNoSubmissionDataDialogText: 'No new documents have been added to this project to submit.'
};

export const SubmitSurveyBiohubI18N = {
  submitSurveyBiohubDialogTitle: 'Publish Survey to BioHub BC',
  submitSurveyBiohubSuccessDialogTitle: 'Survey published',
  submitSurveyBiohubSuccessDialogText: 'Your survey has successfully been published to BioHub BC.',
  submitSurveyBiohubNoSubmissionDataDialogTitle: 'No survey data to submit',
  submitSurveyBiohubNoSubmissionDataDialogText: 'No new data or information has been added to this survey to submit.'
};

export const CreateAnimalI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Animal',
  createErrorText:
    'An error has occurred while attempting to create your animal, please try again. If the error persists, please contact your system administrator.'
};

export const EditAnimalI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Editing Animal',
  createErrorText:
    'An error has occurred while attempting to edit your animal, please try again. If the error persists, please contact your system administrator.'
};

export const CreateCaptureI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Capture',
  createErrorText:
    'An error has occurred while attempting to create your capture, please try again. If the error persists, please contact your system administrator.'
};

export const EditCaptureI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Editing Capture',
  createErrorText:
    'An error has occurred while attempting to edit your capture, please try again. If the error persists, please contact your system administrator.'
};

export const CreateMortalityI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Mortality',
  createErrorText:
    'An error has occurred while attempting to create your mortality, please try again. If the error persists, please contact your system administrator.'
};

export const EditMortalityI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  editErrorTitle: 'Error Editing Mortality',
  editErrorText:
    'An error has occurred while attempting to edit your mortality, please try again. If the error persists, please contact your system administrator.'
};

export const SurveyAnimalsI18N = {
  animalIndividualsHelp:
    'Animals are animals that have been captured, marked, measured, or have died, generating data that applies to one specific individual.',
  animalDialogTitle: 'Invidividual Animals',
  animalDialogAddNew: 'Add New Individual',
  animalSectionComment: (section: string) => `Add comment about this ${section}`,
  animalGeneralTitle: 'General',
  animalGeneralHelp: 'General information about this animal.',
  animalCaptureTitle: 'Capture Events',
  animalCaptureTitle2: 'Capture Event',
  animalCaptureHelp:
    'Capture Events are when animals have been deliberately handled or immobilized. All capture events should be reported by adding a Capture Event to a new or existing individual.',
  animalCaptureAddBtn: 'Add Capture Event',
  animalCaptureReleaseRadio: 'This individual was released at a different location',
  animalMarkingTitle: 'Markings',
  animalMarkingTitle2: 'Animal Marking',
  animalMarkingHelp:
    'Physical or chemical characteristics of an animal, or electronic tags that uniquely identify an individual.',
  animalMarkingAddBtn: 'Add Marking',
  animalMeasurementTitle: 'Measurements',
  animalMeasurementTitle2: 'Animal Measurement',
  animalMeasurementHelp:
    'Quantitative or categorical attributes, such as body mass or body condition, that describe an individual.',
  animalMeasurementAddBtn: 'Add Measurement',
  animalFamilyTitle: 'Family',
  animalFamilyTitle2: 'Animal Relationship',
  animalFamilyHelp:
    'Family Relationships describe how multiple individuals are related to one another. You must add an individual before it can be referenced as a parent or child of another individual.',
  animalFamilyAddBtn: 'Add Relationship',
  animalMortalityTitle: 'Mortality Events',
  animalMortalityTitle2: 'Mortality Event',
  animalMortalityHelp:
    "Mortality Events describe an individual's death, including the suspected location, date, and cause of death. An individual can only have one Mortality Event.",
  animalMortalityAddBtn: 'Add Mortality',
  animalCollectionUnitTitle: 'Ecological Units',
  animalCollectionUnitTitle2: 'Ecological Unit',
  animalCollectionUnitHelp:
    'Ecological units are groups such as population units, herds, and packs. Different species may have different units and unit names.',
  animalCollectionUnitAddBtn: 'Add Unit',
  // Input help strings
  taxonHelp:
    'The species or taxon of the animal. If the species is unknown, select the lowest-ranking known taxon, such as the genus or family.',
  taxonLabelHelp: 'A unique name for you to recognize this individual.',
  wlhIdHelp: 'An ID used to identify animals in the BC Wildlife Health Program',
  sexHelp: 'The sex of this critter. Leave as Unknown if unsure.',
  telemetryDeviceHelp:
    'Devices transmit telemetry data while they are attached to an animal during a deployment. Animals may have multiple devices and deployments, however a single device may not have overlapping deployments.',
  // Animal CSV import strings
  importRecordsSuccessSnackbarMessage: 'Animals imported successfully.',
  importRecordsErrorDialogTitle: 'Error Importing Animal Records',
  importRecordsErrorDialogText: 'An error occurred while importing animal records.'
} as const;

export const FundingSourceI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  // CREATE FUNDING SOURCE
  createFundingSourceDialogTitle: 'Create Funding Source',
  createFundingSourceDialogText: 'Specify the name, description and effective dates for this funding source.',
  createErrorTitle: 'Error Creating Funding Source',
  createErrorText:
    'An error has occurred while attempting to create your funding source, please try again. If the error persists, please contact your system administrator.',
  // EDIT FUNDING SOURCE
  updateFundingSourceDialogTitle: 'Edit Funding Source Details',
  updateFundingSourceDialogText: 'Edit the name, description and effective dates for this funding source.',
  updateErrorTitle: 'Error Updating Funding Source',
  updateErrorText:
    'An error has occurred while attempting to update your Funding Source, please try again. If the error persists, please contact your system administrator.',
  // DELETE FUNDING SOURCE
  deleteFundingSourceErrorTitle: 'Error Deleting a Funding Source',
  deleteFundingSourceErrorText:
    'An error has occurred while attempting to delete the Funding Sources, please try again. If the error persists, please contact your system administrator.',

  deleteFundingSourceDialogTitle: 'Delete Funding Source?',
  deleteFundingSourceDialogText:
    'Are you sure you want to permanently delete this funding source? This action cannot be undone.',

  cannotDeleteFundingSourceTitle: "You can't delete this funding source",
  cannotDeleteFundingSourceText:
    'This funding source has been referenced by one or more surveys. To delete this record, you will first have to remove it from all related surveys.',

  // FETCH FUNDING SOURCE
  fetchFundingSourcesErrorTitle: 'Error Fetching Funding Sources',
  fetchFundingSourcesErrorText:
    'An error has occurred while attempting to fetch the Funding Sources, please try again. If the error persists, please contact your system administrator.',
  fetchFundingSourceErrorTitle: 'Error Fetching Funding Source',
  fetchFundingSourceErrorText:
    'An error has occurred while attempting to fetch the Funding Source, please try again. If the error persists, please contact your system administrator.'
};

export const CreateSamplingSiteI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Sampling Site(s)',
  createErrorText:
    'An error has occurred while attempting to create your sampling site(s). Please try again. If the error persists, please contact your system administrator.'
};

export const CreateTechniqueI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Technique',
  createErrorText:
    'An error has occurred while attempting to create your technique. Please try again. If the error persists, please contact your system administrator.'
};

export const EditTechniqueI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Editing Technique',
  createErrorText:
    'An error has occurred while attempting to edit your technique. Please try again. If the error persists, please contact your system administrator.'
};

export const DeleteTechniqueI18N = {
  deleteTitle: 'Delete Technique?',
  deleteText: 'Are you sure you want to delete this technique?',
  yesButtonLabel: 'Delete Technique',
  noButtonLabel: 'Cancel'
};

export const DeleteTechniquesBulkI18N = {
  deleteTitle: 'Delete Techniques?',
  deleteText: 'Are you sure you want to delete these techniques?',
  yesButtonLabel: 'Delete Techniques',
  noButtonLabel: 'Cancel'
};

export const ObservationsTableI18N = {
  removeAllDialogTitle: 'Discard changes?',
  removeAllDialogText: 'Are you sure you want to discard all your changes? This action cannot be undone.',

  // Delete observation records (rows)
  removeSingleRecordDialogTitle: 'Delete record?',
  removeSingleRecordDialogText: 'Are you sure you want to delete this record? This action cannot be undone.',
  removeSingleRecordButtonText: 'Delete Record',
  removeMultipleRecordsDialogTitle: (count: number) => `Delete ${count} ${p(count, 'record')}?`,
  removeMultipleRecordsDialogText: 'Are you sure you want to delete these records? This action cannot be undone.',
  removeMultipleRecordsButtonText: 'Delete Records',

  // Delete measurement columns
  removeSingleMeasurementColumnDialogTitle: 'Delete measurement column?',
  removeSingleMeasurementColumnDialogText:
    'Are you sure you want to delete this measurement column? This action cannot be undone.',
  removeSingleMeasurementColumnButtonText: 'Delete Columns',
  removeMultipleMeasurementColumnsDialogTitle: (count: number) => `Delete ${count} ${p(count, 'column')}?`,
  removeMultipleMeasurementColumnsDialogText:
    'Are you sure you want to delete these columns? This action cannot be undone.',
  removeMultipleMeasurementColumnsButtonText: 'Delete Columns',

  // Delete environment columns
  removeSingleEnvironmentColumnDialogTitle: 'Delete environment column?',
  removeSingleEnvironmentColumnDialogText:
    'Are you sure you want to delete this environment column? This action cannot be undone.',
  removeSingleEnvironmentColumnButtonText: 'Delete Columns',
  removeMultipleEnvironmentColumnsDialogTitle: (count: number) => `Delete ${count} ${p(count, 'column')}?`,
  removeMultipleEnvironmentColumnsDialogText:
    'Are you sure you want to delete these columns? This action cannot be undone.',
  removeMultipleEnvironmentColumnsButtonText: 'Delete Columns',

  // Save observation records success
  saveRecordsSuccessSnackbarMessage: 'Observations updated successfully.',
  // Save observation records error
  submitRecordsErrorDialogTitle: 'Error Updating Observation Records',
  submitRecordsErrorDialogText:
    'An error has occurred while attempting to update the observation records for this survey. Please try again. If the error persists, please contact your system administrator.',

  // Delete observation records success
  deleteSingleRecordSuccessSnackbarMessage: 'Deleted observation record successfully.',
  // Delete observation records error
  removeRecordsErrorDialogTitle: 'Error Deleting Observation Records',
  removeRecordsErrorDialogText:
    'An error has occurred while attempting to delete observation records for this survey. Please try again. If the error persists, please contact your system administrator.',
  deleteMultipleRecordSuccessSnackbarMessage: (count: number) =>
    `Deleted ${count} observation ${p(count, 'record')} successfully.`,

  // Delete measurement columns success
  deleteSingleMeasurementColumnSuccessSnackbarMessage: 'Deleted measurement column successfully.',
  // Delete measurement columns error
  removeMeasurementColumnsErrorDialogTitle: 'Error Deleting Measurement Columns',
  removeMeasurementColumnsErrorDialogText:
    'An error has occurred while attempting to delete measurement columns for this survey. Please try again. If the error persists, please contact your system administrator.',
  deleteMultipleMeasurementColumnSuccessSnackbarMessage: (count: number) =>
    `Deleted ${count} measurement ${p(count, 'column')} successfully.`,

  // Delete environment columns success
  deleteSingleEnvironmentColumnSuccessSnackbarMessage: 'Deleted environment column successfully.',
  // Delete environment columns error
  removeEnvironmentColumnsErrorDialogTitle: 'Error Deleting Environment Columns',
  removeEnvironmentColumnsErrorDialogText:
    'An error has occurred while attempting to delete environment columns for this survey. Please try again. If the error persists, please contact your system administrator.',
  deleteMultipleEnvironmentColumnSuccessSnackbarMessage: (count: number) =>
    `Deleted ${count} environment ${p(count, 'column')} successfully.`,

  // Import observation records
  importRecordsSuccessSnackbarMessage: 'Observations imported successfully.',
  importRecordsErrorDialogTitle: 'Error Importing Observation Records',
  importRecordsErrorDialogText: 'An error occurred while importing observation records.',

  // Fetching TSN Measurements from CritterBase error
  fetchingTSNMeasurementErrorDialogTitle: 'Error fetching measurement validation',
  fetchingTSNMeasurementErrorDialogText:
    'An error occurred while fetching measurement data from Critterbase. The selected taxon may not be supported. Please try again. If the error persists, please contact your system administrator.'
};

export const TelemetryTableI18N = {
  removeAllDialogTitle: 'Discard changes?',
  removeAllDialogText: 'Are you sure you want to discard all your changes? This action cannot be undone.',
  removeSingleRecordDialogTitle: 'Delete record?',
  removeSingleRecordDialogText: 'Are you sure you want to delete this record? This action cannot be undone.',
  removeSingleRecordButtonText: 'Delete Record',
  removeMultipleRecordsDialogTitle: (count: number) => `Delete ${count} ${p(count, 'record')}?`,
  removeMultipleRecordsDialogText: 'Are you sure you want to delete these records? This action cannot be undone.',
  removeMultipleRecordsButtonText: 'Delete Records',
  submitRecordsErrorDialogTitle: 'Error Updating Telemetry Records',
  submitRecordsErrorDialogText:
    'An error has occurred while attempting to update the telemetry records for this survey. Please try again. If the error persists, please contact your system administrator.',
  removeRecordsErrorDialogTitle: 'Error Deleting Telemetry Records',
  removeRecordsErrorDialogText:
    'An error has occurred while attempting to delete telemetry records for this survey. Please try again. If the error persists, please contact your system administrator.',
  saveRecordsSuccessSnackbarMessage: 'Telemetry updated successfully.',
  deleteSingleRecordSuccessSnackbarMessage: 'Deleted telemetry record successfully.',
  deleteMultipleRecordSuccessSnackbarMessage: (count: number) =>
    `Deleted ${count} telemetry ${p(count, 'record')} successfully.`
};

export const TelemetryDeviceKeyFileI18N = {
  uploadErrorTitle: 'Error Uploading Telemetry Device Key File',
  uploadErrorText:
    'An error has occurred while attempting to upload the device key file, please try again. If the error persists, please contact your system administrator.',
  downloadErrorTitle: 'Error Downloading Telemetry Device Key File',
  downloadErrorText:
    'An error has occurred while attempting to download the device key file, please try again. If the error persists, please contact your system administrator.'
};

export const CreateAnimalDeploymentI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Deployment',
  createErrorText:
    'An error has occurred while attempting to create your deployment. Please try again. If the error persists, please contact your system administrator.'
};

export const EditAnimalDeploymentI18N = {
  cancelTitle: 'Discard changes and exit?',
  cancelText: 'Any changes you have made will not be saved. Do you want to proceed?',
  createErrorTitle: 'Error Creating Deployment',
  createErrorText:
    'An error has occurred while attempting to create your deployment. Please try again. If the error persists, please contact your system administrator.'
};

export const SurveyExportI18N = {
  exportErrorTitle: 'Error Exporting Survey Data',
  exportErrorText:
    'An error has occurred while attempting to export survey data. Please try again. If the error persists, please contact your system administrator.'
};
