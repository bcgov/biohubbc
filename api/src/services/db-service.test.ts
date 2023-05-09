import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { DBService } from './db-service';

chai.use(sinonChai);

describe('DB service', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const dbService = new DBService(dbConnectionObj);

    expect(dbService).to.be.instanceof(DBService);
  });
});
