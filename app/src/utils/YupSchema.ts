/**
 * Make sure to add the type definition for any new methods added here to the `types/yup.d.ts` types file.
 * - See types/yup.d.ts
 */

import { DATE_FORMAT } from 'constants/dateTimeFormats';
import moment from 'moment';
import * as yup from 'yup';

yup.addMethod(yup.array, 'isUniquePermitNumber', function (message: string) {
  return this.test('is-unique-permit-number', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((permit) => {
      return seen.size === seen.add(permit.permit_number).size;
    });

    return !hasDuplicates;
  });
});

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

yup.addMethod(yup.array, 'isUniqueFocalAncillarySpecies', function (message: string) {
  return this.test('is-unique-focal-ancillary-species', message, function (values) {
    if (!values || !values.length) {
      return true;
    }

    let hasDuplicates = false;

    this.parent.focal_species.forEach((species: number) => {
      if (values.includes(species)) {
        hasDuplicates = true;
      }
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

      return moment(value, dateFormat, true).isValid();
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

      const endDateTime = moment(`2020-10-20 ${this.parent.end_time}`, DATE_FORMAT.ShortDateTimeFormat);
      const startDateTime = moment(`2020-10-20 ${this.parent[startTimeName]}`, DATE_FORMAT.ShortDateTimeFormat);

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

      if (!moment(this.parent[startDateName], dateFormat, true).isValid()) {
        // don't validate start_date if it is invalid
        return true;
      }

      // compare valid start and end dates
      return moment(this.parent.start_date, dateFormat, true).isBefore(moment(value, dateFormat, true));
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

      if (moment(value, dateFormat).isAfter(moment(maxDate))) {
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

      if (moment(value, dateFormat).isBefore(moment(minDate))) {
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

export default yup;
