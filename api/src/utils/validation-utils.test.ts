import { expect } from 'chai';
import { describe } from 'mocha';
import { filterRecords } from './validation-utils';

describe('filterRecords', () => {
	it('should filter records', async () => {
		interface ISpeciesTemplateRecord {
			intended_outcome: number | null;
			species: number | null;
			field_method: number | null;
			ecological_season: number | null;
		}

		const records: ISpeciesTemplateRecord[] = [
			{
				intended_outcome: 1,
				species: 2,
				field_method: 3,
				ecological_season: null
			},
			{
				intended_outcome: 1,
				species: 2,
				field_method: null,
				ecological_season: 4
			},
			{
				intended_outcome: 1,
				species: 2,
				field_method: 3,
				ecological_season: 4
			},
			{
				intended_outcome: 1,
				species: null,
				field_method: 3,
				ecological_season: 4
			},
			{
				intended_outcome: null,
				species: 2,
				field_method: null,
				ecological_season: 4
			},
			{
				intended_outcome: null,
				species: null,
				field_method: null,
				ecological_season: null
			}
		];

		const search = { 'intended_outcome': null, 'species': 2, 'field_method': 3, 'ecological_season': 4 };
		const filtered = filterRecords(records, search)

		expect(filtered.length).to.equal(2)
		expect(filtered[0]).to.equal({
			intended_outcome: null,
			species: 2,
			field_method: null,
			ecological_season: 4
		})
		expect(filtered[1]).to.equal({
			intended_outcome: null,
			species: null,
			field_method: null,
			ecological_season: null
		})
	})
})
