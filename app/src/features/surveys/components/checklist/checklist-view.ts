export enum SurveyChecklistAPI {
  'Telemetry' = 'paths/project/{projectId}/survey/{surveyId}/deployments/telemetry/index',
  'Species observations' = '/api/project/{projectId}/survey/{surveyId}/observation',
  'Animal captures' = '/api/project/{projectId}/survey/{surveyId}/critters/?type=capture', // Add query parameter
  'Animal mortalities' = '/api/project/{projectId}/survey/{surveyId}/critters/?type=mortality', // Add query parameter
  'Habitat features' = 'placeholder'
}
