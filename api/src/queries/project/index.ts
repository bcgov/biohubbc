import draft from './draft';
import * as projectAttachments from './project-attachments-queries';
import * as projectCreate from './project-create-queries';
import * as projectDelete from './project-delete-queries';
import * as projectUpdate from './project-update-queries';
import * as projectView from './project-view-queries';

export default {
  ...projectAttachments,
  ...projectCreate,
  ...projectDelete,
  ...projectUpdate,
  ...projectView,
  draft
};
