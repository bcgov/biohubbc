import { IgcNotifyGenericMessage } from '../models/gcnotify';

//admin email template for new access requests
export const ACCESS_REQUEST_ADMIN_EMAIL: IgcNotifyGenericMessage = {
  subject: 'SIMS: A request for access has been received.',
  header: 'A request for access to the Species Inventory Management System has been submitted.',
  body1: `To review the request,`,
  body2: 'This is an automated message from the BioHub Species Inventory Management System',
  footer: ''
};

//admin email template for approval of access requests
export const ACCESS_REQUEST_APPROVAL_ADMIN_EMAIL: IgcNotifyGenericMessage = {
  subject: 'SIMS: Your request for access has been approved.',
  header: 'Your request for access to the Species Inventory Management System has been approved.',
  body1: `To access the site, `,
  body2: 'This is an automated message from the BioHub Species Inventory Management System',
  footer: ''
};
