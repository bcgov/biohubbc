/**
 * Generic notfication messages
 *
 * @export
 * @enum {number}
 */
export enum ACCESS_REQUEST_MESSAGE {
  HEADER = 'Attention: System access request received.',
  BODY_1 = `There is a new access request for 'Species Inventory Management System' application.`,
  BODY_2 = 'ADDITIONAL INFO',
  FOOTER = 'Please contact your system administrator for additional details.'
}
