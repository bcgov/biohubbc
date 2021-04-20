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

  export class ArraySchema extends yup.ArraySchema {
    /**
     * Determine if the array of permits has duplicate permit numbers
     *
     * @param {string} message='Permit numbers must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniquePermitNumber(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of permits has at least one permit with sampling conducted
     *
     * @param {string} message='Permit numbers must be unique and you must have at least one permit with sampling conducted' - error message if this check fails
     * @return {*} {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniquePermitsAndAtLeastOneSamplingConducted(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of classification details has duplicates
     *
     * @param {string} message='IUCN Classifications must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueIUCNClassificationDetail(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the object of focal and ancillary species has duplicates
     *
     * @param {string} message='Focal and Ancillary species must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueFocalAncillarySpecies(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;
  }
}
