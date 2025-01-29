import { expect } from 'chai';
import sinon from 'sinon';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { getTaxonMap, getTsnsFromTaxonMap, TaxonMap } from './taxon';

describe('taxon', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTaxonMap', () => {
    it('should return a map of taxon identifiers to taxons', async () => {
      const taxonIdentifiers = [1, 'taxon'];
      const platformService: any = {
        getTaxonomyByTsns: sinon.stub().resolves([{ tsn: 1, scientificName: 'Alces alces' }]),
        getTaxonByScientificName: sinon.stub().resolves({ tsn: 2, scientificName: 'taxon' })
      };

      const taxonMap = await getTaxonMap(taxonIdentifiers, platformService);

      expect(taxonMap.get(1)).to.deep.equal({ tsn: 1, scientificName: 'Alces alces' });
      expect(taxonMap.get('TAXON')).to.deep.equal({ tsn: 2, scientificName: 'taxon' });
    });
  });

  describe('getTsnsFromTaxonMap', () => {
    it('should return a list of tsns from a taxon map', () => {
      const taxonMap: TaxonMap = new CaseInsensitiveMap([
        [1, { tsn: 1, scientificName: 'Alces alces' }],
        [2, { tsn: 2, scientificName: 'taxon' }]
      ]);

      const tsns = getTsnsFromTaxonMap(taxonMap);

      expect(tsns).to.deep.equal([1, 2]);
    });
  });
});
