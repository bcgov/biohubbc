import dayjs from 'dayjs';
import { isDateTimeString } from '../../date-time-utils';
import { CSVConfigUtils } from '../csv-config-utils';
import { CSVRowValidator } from '../csv-config-validation.interface';

/**
 * Get a row validator that checks if the start date is before the end date.
 *
 * Rules:
 *  1. Start date and time must be before end date and time.
 *
 * @template StaticHeaderType
 * @param {CSVConfigUtils} utils - CSV config utils
 * @param {Record<string, string>} staticHeaders - Static headers
 * @returns {CSVRowValidator} - Row validator
 */
export const getStartDateIsBeforeEndDateRowValidator = <StaticHeaderType extends Uppercase<string> = Uppercase<string>>(
  utils: CSVConfigUtils<StaticHeaderType>,
  staticHeaders: {
    startDate: StaticHeaderType;
    startTime: StaticHeaderType | undefined;
    endDate: StaticHeaderType;
    endTime: StaticHeaderType | undefined;
  }
): CSVRowValidator => {
  return (params) => {
    let startTimeStamp = utils.getCellValue(staticHeaders.startDate, params.row) as string;
    let endTimeStamp = utils.getCellValue(staticHeaders.endDate, params.row) as string;

    if (staticHeaders.startTime) {
      startTimeStamp += ` ${utils.getCellValue(staticHeaders.startTime, params.row)}`;
    }

    if (staticHeaders.endTime) {
      endTimeStamp += ` ${utils.getCellValue(staticHeaders.endTime, params.row)}`;
    }

    // INVALID: If either timestamp is invalid
    if (!isDateTimeString(startTimeStamp) || !isDateTimeString(endTimeStamp)) {
      return [
        {
          error: 'Unable to parse date and time values',
          solution: 'Please ensure date and time values are formatted correctly',
          cell: null,
          header: null
        }
      ];
    }

    // INVALID: If the start date is AFTER the end date
    if (dayjs(startTimeStamp).isAfter(dayjs(endTimeStamp))) {
      return [
        {
          error: 'Start date is after end date',
          solution: 'Please ensure the start date is before the end date',
          cell: null,
          header: null
        }
      ];
    }

    return [];
  };
};
