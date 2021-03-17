import moment from 'moment';
import * as yup from 'yup';

const getBaseDateStringValidator = () => {
  return yup.string().test('is-valid-date', 'Invalid date', (value) => {
    if (!value) {
      return true;
    }

    return moment(value, 'YYYY-MM-DD', true).isValid();
  });
};

export const getStartDateStringValidator = () => {
  return getBaseDateStringValidator();
};

export const getEndDateStringValidator = (startDateName: string) => {
  return getBaseDateStringValidator().test(
    'is-end-date-after-start-date',
    'End Date is before Start Date',
    function (value) {
      if (!value) {
        // end date is null, no validation required
        return true;
      }

      if (!moment(this.parent[startDateName], 'YYYY-MM-DD', true).isValid()) {
        // cant validate end_date if start_date is invalid
        return true;
      }

      // compare valid start and end dates
      return moment(this.parent.start_date, 'YYYY-MM-DD').isBefore(moment(value, 'YYYY-MM-DD'));
    }
  );
};
