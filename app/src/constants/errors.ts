/**
 * This is a substring of the database's foreign key constraint error message, used to catch
 * foreign key constraint errors when trying to delete a record and displaying a more useful error message
 *
 * ie. While trying to delete a device:
 *
 * if (error.includes(FOREIGN_KEY_CONSTRAINT_ERROR)) {
 *  return "Delete the associated deployment before deleting the device"
 * }
 *
 */
export const FOREIGN_KEY_CONSTRAINT_ERROR = 'foreign key constraint';

/**
 * This is a substring of the database's unique constraint error message, used to catch
 * unique constraint errors when trying to insert a record
 *
 * ie. While trying to create a device:
 *
 * if (error.includes(UNIQUE_CONSTRAINT_ERROR)) {
 *  return "That device already eixsts in the Survey"
 * }
 *
 */
export const UNIQUE_CONSTRAINT_ERROR = 'already exists';
