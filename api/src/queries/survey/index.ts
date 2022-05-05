import * as surveyAttachments from './survey-attachments-queries';
import * as surveyCreate from './survey-create-queries';
import * as surveyDelete from './survey-delete-queries';
import * as surveyOccurrence from './survey-occurrence-queries';
import * as surveySummary from './survey-summary-queries';
import * as surveyUpdate from './survey-update-queries';
import * as surveyView from './survey-view-queries';
import * as surveyViewUpdate from './survey-view-update-queries';

export default {
  ...surveyAttachments,
  ...surveyCreate,
  ...surveyDelete,
  ...surveyOccurrence,
  ...surveySummary,
  ...surveyUpdate,
  ...surveyView,
  ...surveyViewUpdate
};
