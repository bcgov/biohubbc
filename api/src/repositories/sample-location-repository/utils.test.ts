import { expect } from 'chai';
import { Knex } from 'knex';
import { describe, it } from 'mocha';
import { getKnex } from '../../database/db';
import { getSamplingLocationBaseQuery } from './utils';

describe('getSamplingLocationBaseQuery', () => {
  let knex: Knex;

  before(() => {
    knex = getKnex();
  });

  it('should return a query builder object', async () => {
    const query = getSamplingLocationBaseQuery(knex);

    expect(query).to.be.an('object');
    expect(query.toString()).to.be.a('string');
  });

  it('should select survey sample site fields correctly', async () => {
    const query = getSamplingLocationBaseQuery(knex).toString();

    expect(query).to.include('select "sss"."survey_sample_site_id", "sss"."survey_id"');
    expect(query).to.include("COALESCE(wssm.sample_methods, '[]'::json)");
    expect(query).to.include("COALESCE(wssb.blocks, '[]'::json)");
    expect(query).to.include("COALESCE(wssst.stratums, '[]'::json)");
  });

  it('should join the correct tables', async () => {
    const query = getSamplingLocationBaseQuery(knex).toString();

    expect(query).to.include('left join "w_survey_sample_method" as "wssm"');
    expect(query).to.include('left join "w_survey_sample_block" as "wssb"');
    expect(query).to.include('left join "w_survey_sample_stratum" as "wssst"');
  });
});
