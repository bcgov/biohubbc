import { expect } from 'chai';
import { describe } from 'mocha';
import SQL, { SQLStatement } from 'sql-template-strings';
import { appendSQLColumns, appendSQLColumnsEqualValues, appendSQLValues } from './sql-utils';

describe('test', () => {
	it('tests', async () => {
		const records = [
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
			{ // Expect this one
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
	})
})
