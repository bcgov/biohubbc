import dayjs from 'dayjs';
import { SampleLocationRecord } from '../../repositories/sample-location-repository';
import { getColumnCellValue } from '../../services/observation-service';

interface ISamplingPeriodRowData {
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
}
export interface ISamplingDataToValidate {
  siteName: string;
  methods: {
    techniqueName: string;
    periods: ISamplingPeriodRowData[];
  }[];
}

export interface ISamplingDataFromRow {
  sampleSiteId: number;
  methods: { methodTechniqueId: number; samplePeriodId: number }[];
}

interface IObservationDateTime {
  date: string | null;
  time: string | null;
}

/**
 * Validates the incoming sampling data against the survey sampling data.
 * Ensures that all sampling sites, methods, and periods exist within the survey.
 *
 * @export
 * @param {ISamplingDataToValidate[]} samplingDataToValidate - The sampling data to validate.
 * @param {SampleLocationRecord[]} surveySamplingData - The survey sampling data against which to validate.
 * @return {boolean} Returns true if all sampling data is valid, otherwise false.
 */
export function validateSamplingData(
  samplingDataToValidate: ISamplingDataToValidate[],
  surveySamplingData: SampleLocationRecord[]
): boolean {
  return samplingDataToValidate.every((rowSite) => {
    if (!rowSite.siteName) {
      // An empty site name is valid
      return true;
    }

    // Find matching site in survey sampling data
    const matchingSurveySite = surveySamplingData.find(
      (surveySite) => surveySite.name.toLowerCase() === rowSite.siteName.toLowerCase()
    );

    if (!matchingSurveySite) {
      // Site in sampling data does not exist in survey sampling data
      return false;
    }

    // Validate methods for this site
    return rowSite.methods.every((rowMethod) => {
      const matchingMethod = matchingSurveySite.sample_methods.find(
        (surveyMethod) => surveyMethod.technique.name.toLowerCase() === rowMethod.techniqueName.toLowerCase()
      );

      if (!matchingMethod) {
        // Method in sampling data does not exist in survey data
        return false;
      }

      // Validate periods
      return rowMethod.periods.every((rowPeriod) => {
        return matchingMethod.sample_periods.some((surveyPeriod) => {
          return (
            surveyPeriod.start_date == rowPeriod.startDate &&
            surveyPeriod.end_date == rowPeriod.endDate &&
            surveyPeriod.start_time == rowPeriod.startTime &&
            surveyPeriod.end_time == rowPeriod.endTime
          );
        });
      });
    });
  });
}

/**
 * Builds the sampling data to be validated from the worksheet row objects.
 *
 * @param {IRowObject[]} worksheetRowObjects - The worksheet row objects containing raw CSV data.
 * @return {ISamplingDataToValidate[]} Returns the sampling data formatted for validation.
 */
export function buildSamplingDataToValidate(worksheetRowObjects: Record<string, any>[]): ISamplingDataToValidate[] {
  const samplingDataMap: Map<string, Map<string, ISamplingPeriodRowData[]>> = new Map();

  worksheetRowObjects.forEach((row) => {
    // Convert cell object to string
    const siteName = getColumnCellValue(row, 'SAMPLING_SITE').cell as string | null;
    const methodName = getColumnCellValue(row, 'SAMPLING_METHOD').cell as string | null;
    const period = getColumnCellValue(row, 'SAMPLING_PERIOD').cell as string | null;
    const observationDate = getColumnCellValue(row, 'DATE').cell as string | null;
    const observationTime = getColumnCellValue(row, 'TIME').cell as string | null;

    const observationData: IObservationDateTime = {
      date: dayjs(observationDate).format('YYYY-MM-DD'),
      time: observationTime ? dayjs(observationTime).format('HH:mm:ss') : null
    };

    // If there is no sampling information for the row, return early
    if (!siteName || !methodName || (!period && (!observationDate || !observationTime))) {
      return;
    }

    // Split the sampling period string into separate start date and end date
    let samplingPeriodObject = null: ISamplingPeriodRowData;
    if (period) {
      const splitPeriod = period.split('-');
      samplingPeriodObject = {
        startDate: dayjs(splitPeriod[0]).format('YYYY-MM-DD'),
        endDate: dayjs(splitPeriod[1]).format('YYYY-MM-DD'),
        // If the value includes a colon, assume time is present
        startTime: splitPeriod[1].includes(':') ? dayjs(splitPeriod[0]).format('HH:mm:ss') : null,
        endTime: splitPeriod[1].includes(':') ? dayjs(splitPeriod[1]).format('HH:mm:ss') : null
      };
    }

    // Ensure site exists in the map
    if (!samplingDataMap.has(siteName)) {
      samplingDataMap.set(siteName, new Map());
    }

    const siteMethods = samplingDataMap.get(siteName);

    // Ensure method exists for the site
    if (!siteMethods?.has(methodName)) {
      siteMethods?.set(methodName, []);
    }

    // Add the period to the method
    siteMethods?.get(methodName)?.push(samplingPeriodObject);
  });

  const samplingDataToValidate: ISamplingDataToValidate[] = Array.from(samplingDataMap.entries()).map(
    ([siteName, methodsMap]) => ({
      siteName,
      methods: Array.from(methodsMap.entries()).map(([techniqueName, periods]) => ({
        techniqueName,
        periods
      }))
    })
  );

  return samplingDataToValidate;
}
