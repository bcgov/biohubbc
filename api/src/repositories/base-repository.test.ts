import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { BaseRepository } from './base-repository';

chai.use(sinonChai);

describe('BaseRepository', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const dbService = new BaseRepository(dbConnectionObj);

    expect(dbService).to.be.instanceof(BaseRepository);
  });
});
