/**
 * Extend the default yup type definitions to include the definitions of our custom validators
 * - See utils/YupSchema.ts
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DATE_FORMAT } from 'constants/dateFormats';
import yup from 'utils/YupSchema';

declare module 'yup' {
  export class StringSchema extends yup.StringSchema {
    /**
     * Determine if the string is a valid date string. Does nothing if the string is null.
     *
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message='Invalid Date' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isValidDateString(
      dateFormat?: DATE_FORMAT,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the end date string is after the start date string. Does nothing if either the end or start
     * date stings are null or invalid.
     *
     * @param {string} startDateName - name of the start date field
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message='Invalid Date' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isEndDateAfterStartDate(
      startDateName: string,
      dateFormat?: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;
  }
}
