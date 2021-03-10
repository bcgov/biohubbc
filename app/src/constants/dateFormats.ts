// See BC Gov standards: https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/web-content-development-guides/writing-for-the-web/web-style-guide/numbers
export enum DATE_FORMAT {
  ShortDateFormat = 'YYYY-MM-DD', //2020-01-05
  ShortDateTimeFormat = 'YYYY-MM-DD, H:mm a', //2020-01-05, 3:30 pm
  ShortMediumDateFormat = 'MMM D, YYYY', //Jan 5, 2020
  ShortMediumDateTimeFormat = 'MMM D, YYYY, H:mm a', //Jan 5, 2020, 3:30 pm
  MediumDateFormat = 'MMMM D, YYYY', //January 5, 2020
  MediumDateTimeFormat = 'MMMM D, YYYY, H:mm a', //January 5, 2020, 3:30 pm
  LongDateFormat = 'dddd, MMMM D, YYYY, H:mm a', //Monday, January 5, 2020, 3:30 pm
  LongDateTimeFormat = 'dddd, MMMM D, YYYY, H:mm a' //Monday, January 5, 2020, 3:30 pm
}
