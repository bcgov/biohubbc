import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getTaxonFromRowState } from '../../../services/import-services/utils/row-state';
import { CaseInsensitiveMap } from '../../case-insensitive-map';
import { getTaxonRowValidator } from './taxon-row-validator';

chai.use(sinonChai);

describe.only('getTaxonRowValidator', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should handle undefined cell values', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns(undefined),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    const errors = rowValidator({} as any);

    expect(errors[0].error).to.contain('is required');
  });

  it('should return no errors', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns(1),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowMock = {};

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    const errors = rowValidator({ row: rowMock } as any);

    expect(errors).to.be.an('array').that.is.empty;
  });

  it('should update the row state and be retrievable with the getter', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns(1),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowMock = {};

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    rowValidator({ row: rowMock } as any);

    const state = getTaxonFromRowState(rowMock);

    expect(state.itis_tsn).to.equal(1);
    expect(state.itis_scientific_name).to.equal('Alces alces');
  });

  it('should return an error for an invalid TSN', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns(2),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    const errors = rowValidator({} as any);

    expect(errors[0].error).to.contain('Invalid ITIS TSN');
  });

  it('should return an error for an invalid scientific name', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns('Invalid'),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    const errors = rowValidator({} as any);

    expect(errors[0].error).to.contain('Invalid scientific name');
  });

  it('should return an error for an invalid cell type', () => {
    const taxonMapMock = new CaseInsensitiveMap([[1, { tsn: 1, scientificName: 'Alces alces' }]]);
    const utilsMock: any = {
      getCellValue: sinon.stub().returns(true),
      getWorksheetHeader: sinon.stub().returns('SPECIES')
    };

    const rowValidator = getTaxonRowValidator(taxonMapMock, utilsMock, 'SPECIES');

    const errors = rowValidator({} as any);

    expect(errors[0].error).to.contain('Invalid species');
  });
});
