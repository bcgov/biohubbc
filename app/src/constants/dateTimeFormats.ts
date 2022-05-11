/**
 * Date formats.
 *
 * See BC Gov standards: https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/web-content-development-guides/writing-for-the-web/web-style-guide/numbers
 */
export enum DATE_FORMAT {
  ShortDateFormat = 'yyyy-MM-dd', //2020-01-05
  ShortDateFormatMonthFirst = 'MM/dd/yyyy', //01/05/2020
  ShortDateTimeFormat = 'yyyy-MM-dd, h:mm a', //2020-01-05, 3:30 pm
  ShortMediumDateFormat = 'MMM d, yyyy', //Jan 5, 2020
  /* Incorrect representation */
  ShortMediumDateFormat2 = 'MMMM dd, yyyy', //Jan 05, 2020
  ShortMediumDateTimeFormat = 'MMM d, yyyy, h:mm a', //Jan 5, 2020, 3:30 pm
  MediumDateFormat = 'MMMM d, yyyy', //January 5, 2020
  MediumDateFormat2 = 'MMMM-dd-yyyy', //January-5-2020
  MediumDateTimeFormat = 'MMMM d, yyyy, h:mm a', //January 5, 2020, 3:30 pm
  LongDateFormat = 'EEEE, MMMM d, yyyy, h:mm a', //Monday, January 5, 2020, 3:30 pm
  LongDateTimeFormat = 'EEEE, MMMM d, yyyy, h:mm a' //Monday, January 5, 2020, 3:30 pm
}

/**
 * Used to set the `min` and `max` values for `type="date"` fields.
 */
export enum DATE_LIMIT {
  min = '1900-01-01',
  max = '2100-12-31'
}

/**
 * Time formats.
 *
 */
export enum TIME_FORMAT {
  ShortTimeFormatAmPm = 'hh:mm A' //11:00 AM
}
