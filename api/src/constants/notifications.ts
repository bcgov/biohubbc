import { IgcNotifyGenericMessage } from '../services/gcnotify-service';

// Email template for an admin, informing them that a new access request has been submitted that requires their attention.
export const ACCESS_REQUEST_ADMIN_NOTIFICATION_EMAIL: IgcNotifyGenericMessage = {
  subject: 'SIMS: A request for access has been received.',
  header: 'A request for access to the Species Inventory Management System has been submitted.',
  main_body1: `To review the request,`,
  main_body2: 'This is an automated message from the BioHub Species Inventory Management System',
  footer: ''
};
