/*
 * Date formats.
 *
 * See BC Gov standards: https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/web-content-development-guides/writing-for-the-web/web-style-guide/numbers
 */
export const DefaultDateFormat = 'YYYY-MM-DD'; // 2020-01-15

export const DefaultDateFormatReverse = 'DD-MM-YYYY'; // 15-01-2020

export const AltDateFormat = 'YYYY/MM/DD'; // 2020/01/15

export const AltDateFormatReverse = 'DD/MM/YYYY'; // 15/01/2020

export const USDefaultDateFormat = 'YYYY-DD-MM'; // 2020-15-01

export const USDefaultDateFormatReverse = 'MM-DD-YYYY'; // 01-15-2020

export const USAltDateFormat = 'MM/DD/YYYY'; // 01/15/2020

export const USAltDateFormatReverse = 'YYYY/DD/MM'; // 2020/15/01

/*
 * Time formats.
 */
export const DefaultTimeFormat = 'HH:mm:ss'; // 23:00:00

export const DefaultTimeFormatNoSeconds = 'HH:mm'; // 23:00

/*
 * Datetime formats.
 */
export const DefaultDateTimeFormat = `${DefaultDateFormat}T${DefaultTimeFormat}`; // 2020-01-05T23:00:00
