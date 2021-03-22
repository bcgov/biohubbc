/**
 * Make sure to add the type definition for any new methods added here to the `types/yup.d.ts` types file.
 * - See types/yup.d.ts
 */

import { DATE_FORMAT } from 'constants/dateFormats';
import moment from 'moment';
import * as yup from 'yup';

yup.addMethod(
  yup.string,
  'isValidDateString',
  function (dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat, message: string = 'Invalid date') {
    return this.test('is-valid-date', message, (value) => {
      if (!value) {
        // don't validate date string if it is null
        return true;
      }

      return moment(value, dateFormat, true).isValid();
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndDateAfterStartDate',
  function (
    startDateName: string,
    dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
    message: string = 'End date must be after start date'
  ) {
    return this.test('is-end-date-after-start-date', message, function (value) {
      if (!value) {
        // don't validate end_date if it is null
        return true;
      }

      if (!moment(this.parent[startDateName], dateFormat, true).isValid()) {
        // don't validate start_date if it is invalid
        return true;
      }

      // compare valid start and end dates
      return moment(this.parent.start_date, dateFormat, true).isBefore(moment(value, dateFormat, true));
    });
  }
);

export default yup;
