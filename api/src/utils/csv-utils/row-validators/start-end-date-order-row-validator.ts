import dayjs from 'dayjs';
import { isDateString } from '../../date-time-utils';
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
    endDate: StaticHeaderType;
    startTime?: StaticHeaderType;
    endTime?: StaticHeaderType;
  }
): CSVRowValidator => {
  return (params) => {
    let startTimeStamp = String(utils.getCellValue(staticHeaders.startDate, params.row));
    let endTimeStamp = String(utils.getCellValue(staticHeaders.endDate, params.row));

    // Casting as string to make the type more clear ie: `string | undefined` vs `CSVCell`
    const startTime = staticHeaders.startTime && (utils.getCellValue(staticHeaders.startTime, params.row) as string);
    const endTime = staticHeaders.endTime && (utils.getCellValue(staticHeaders.endTime, params.row) as string);

    // Append the time to the date if it exists
    if (startTime) {
      startTimeStamp += ` ${startTime}`;
    }

    if (endTime) {
      endTimeStamp += ` ${endTime}`;
    }

    const timestampsAreInvalid = !isDateString(startTimeStamp) || !isDateString(endTimeStamp);

    // INVALID: Timestamps must be valid date-time strings
    if (timestampsAreInvalid) {
      return [
        {
          error: 'Unable to parse date and time values',
          solution: 'Please ensure date and time values are formatted correctly',
          cell: null,
          header: null
        }
      ];
    }

    const startDateIsAfterEndDate = dayjs(startTimeStamp).isAfter(dayjs(endTimeStamp));

    // INVALID: Start dates must be before end dates
    if (startDateIsAfterEndDate) {
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
