import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SummaryRepository } from './summary-repository';

chai.use(sinonChai);

describe('SummaryRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('findSummarySubmissionById', () => {
    afterEach(() => {
      sinon.restore();
    });

  });

});
