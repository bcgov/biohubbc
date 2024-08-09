/**
 * Make sure to add the type definition for any new methods added here to the `types/yup.d.ts` types file.
 * - See types/yup.d.ts
 */

import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { isValidCoordinates } from 'utils/spatial-utils';
import * as yup from 'yup';

yup.addMethod(yup.array, 'isUniqueIUCNClassificationDetail', function (message: string) {
  return this.test('is-unique-iucn-classification-detail', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const hasDuplicates = values
      .map((iucn: any) => {
        return iucn.classification + iucn.subClassification1 + iucn.subClassification2;
      })
      .some((iucn, _, array) => {
        return array.indexOf(iucn) !== array.lastIndexOf(iucn);
      });

    return !hasDuplicates;
  });
});

yup.addMethod(
  yup.string,
  'isValidDateString',
  function (dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat, message = 'Invalid date') {
    return this.test('is-valid-date', message, (value) => {
      if (!value) {
        // don't validate date string if it is null
        return true;
      }
      return dayjs(value, dateFormat, true).isValid();
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndTimeAfterStartTime',
  function (startTimeName: string, message = 'End time must be after start time') {
    return this.test('is-end-time-after-start-time', message, function (value) {
      if (!value) {
        // don't validate end_time if it is null
        return true;
      }

      const endDateTime = dayjs(`2020-10-20 ${this.parent.end_time}`, DATE_FORMAT.ShortDateTimeFormat);
      const startDateTime = dayjs(`2020-10-20 ${this.parent[startTimeName]}`, DATE_FORMAT.ShortDateTimeFormat);

      // compare valid start and end times
      return startDateTime.isBefore(endDateTime);
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndDateAfterStartDate',
  function (
    startDateName: string,
    dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
    message = 'End date must be after start date'
  ) {
    return this.test('is-end-date-after-start-date', message, function (value) {
      if (!value) {
        // don't validate end_date if it is null
        return true;
      }

      if (!dayjs(this.parent[startDateName], dateFormat, true).isValid()) {
        // don't validate start_date if it is invalid
        return true;
      }

      // compare valid start and end dates
      return dayjs(this.parent[startDateName], dateFormat, true).isBefore(dayjs(value, dateFormat, true));
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndDateSameOrAfterStartDate',
  function (
    startDateName: string,
    dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
    message = 'Cannot precede start date'
  ) {
    return this.test('is-end-date-same-or-after-start-date', message, function (value) {
      if (!value) {
        // don't validate end_date if it is null
        return true;
      }

      if (!dayjs(this.parent[startDateName], dateFormat, true).isValid()) {
        // don't validate start_date if it is invalid
        return true;
      }

      // compare valid start and end dates
      return (
        dayjs(this.parent[startDateName], dateFormat, true).isSame(dayjs(value, dateFormat, true)) ||
        dayjs(this.parent[startDateName], dateFormat, true).isBefore(dayjs(value, dateFormat, true))
      );
    });
  }
);

yup.addMethod(
  yup.string,
  'isBeforeDate',
  function (maxDate: string | undefined, dateFormat: DATE_FORMAT, message: string) {
    return this.test('is-before-date', message, function (value) {
      if (!value || !maxDate) {
        // don't validate date if it is null
        return true;
      }

      if (dayjs(value, dateFormat).isAfter(dayjs(maxDate))) {
        return false;
      }

      return true;
    });
  }
);

yup.addMethod(
  yup.string,
  'isAfterDate',
  function (minDate: string | undefined, dateFormat: DATE_FORMAT, message: string) {
    return this.test('is-after-date', message, function (value) {
      if (!value || !minDate) {
        // don't validate date if it is null
        return true;
      }

      if (dayjs(value, dateFormat).isBefore(dayjs(minDate))) {
        return false;
      }

      return true;
    });
  }
);

yup.addMethod(yup.array, 'isUniqueAuthor', function (message: string) {
  return this.test('is-unique-author', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((author) => {
      const authorName = `${author.first_name?.trim()} ${author.last_name?.trim()}`;
      return seen.size === seen.add(authorName).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(yup.array, 'hasAtLeastOneValue', function (message: string, key: string, valueToFind: any) {
  return this.test('has-at-least-one-value', message, (values) => {
    if (!values || !values.length) {
      return true;
    }
    const found = values.filter((item) => item[key][0] === valueToFind);
    return found.length > 0 || false;
  });
});

yup.addMethod(yup.array, 'hasUniqueDateRanges', function (message: string, startKey: string, endKey: string) {
  return this.test('has-unique-date-ranges', message, (values) => {
    // no need to validate empty or single item arrays
    if (!values || !values.length || values.length === 1) {
      return true;
    }

    // convert values to object of timestamps
    // sort based on start date
    const sortedValues = values
      .map((item) => ({ start: dayjs(item[startKey]).unix(), end: dayjs(item[endKey]).unix() }))
      .sort((a, b) => a.start - b.start);

    // loop through sorted values
    for (let i = 0; i < sortedValues.length; i++) {
      // collect two dates to check
      const currentRange = sortedValues[i];
      let newRange;

      if (i + 1 <= sortedValues.length) {
        newRange = sortedValues[i + 1];
      }

      // compare if the 2nd start date is smaller than the current dates end date
      // if so the dates overlap and data is invalid
      if (newRange) {
        if (currentRange.end > newRange.start) {
          return false;
        }
      }
    }

    return true;
  });
});

yup.addMethod(yup.array, 'isValidPointCoordinates', function (message: string) {
  return this.test('has-at-least-one-value', message, (value) => {
    if (!value || !value.length) {
      return false;
    }
    return isValidCoordinates(value[1], value[0]);
  });
});

export default yup;
