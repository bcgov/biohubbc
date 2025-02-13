import { expect } from 'chai';
import { getTsnFromMeasurementRow } from './measurement-utils';

describe('getTsnFromMeasurementRow', () => {
  it('should return a function that returns the ITIS TSN from the row', () => {
    const surveyAliasMap = new Map<string, any>();
    surveyAliasMap.set('carl', { itis_tsn: 1234 });

    const getTsn = getTsnFromMeasurementRow(surveyAliasMap, { getCellValue: () => 'Carl' } as any);

    expect(getTsn({} as any)).to.be.equal(1234);
  });
});
