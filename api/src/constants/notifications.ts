import { IgcNotifyGenericMessage } from '../services/gcnotify-service';

// Email template for an admin, informing them that a new access request has been submitted that requires their attention.
export const ACCESS_REQUEST_ADMIN_NOTIFICATION_EMAIL: IgcNotifyGenericMessage = {
  subject: 'SIMS: A request for access has been received.',
  header: 'A request for access to the Species Inventory Management System has been submitted.',
  body1: `To review the request,`,
  body2: 'This is an automated message from the BioHub Species Inventory Management System',
  footer: ''
};

// Email template for an access request submitter, informing them that their access request has been approved.
export const ACCESS_REQUEST_SUBMITTER_APPROVAL_EMAIL: IgcNotifyGenericMessage = {
  subject: 'SIMS: Your request for access has been approved.',
  header: 'Your request for access to the Species Inventory Management System has been approved.',
  body1: `To access the site, `,
  body2: 'This is an automated message from the BioHub Species Inventory Management System',
  footer: ''
};
