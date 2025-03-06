import chai, { expect } from 'chai';
import { describe } from 'mocha';
import QueryStream from 'pg-query-stream';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { Readable, Transform } from 'stream';
import { getKnex } from '../../database/db';
import {
  getArchiveStream,
  getJsonStringifyTransformStream,
  getQueryStream,
  registerStreamErrorHandler
} from './export-utils';

chai.use(sinonChai);

describe('getArchiveStream', () => {
  it('returns a new instance of archive stream', async () => {
    const archiveStream = getArchiveStream();

    expect(archiveStream).not.to.be.undefined;
  });
});

describe('getQueryStream', () => {
  it('returns a new instance of query stream when given a sql statement', async () => {
    const sqlStatement = SQL`
      select 1;
    `;

    const queryStream = getQueryStream(sqlStatement);

    expect(queryStream).to.be.instanceOf(QueryStream);
  });

  it('returns a new instance of query stream when given a knex query builder', async () => {
    const queryBuilder = getKnex()('table').select('*');

    const queryStream = getQueryStream(queryBuilder);

    expect(queryStream).to.be.instanceOf(QueryStream);
  });
});

describe('getJsonStringifyTransformStream', () => {
  it('returns a transform stream', async () => {
    const jsonTransform = getJsonStringifyTransformStream();

    expect(jsonTransform).to.be.instanceOf(Transform);
  });
});

describe('registerStreamErrorHandler', () => {
  it('adds error event handler to the stream', async () => {
    const readStub = sinon.stub();
    const destroyStub = sinon.stub();

    const stream1 = new Readable({
      read: readStub,
      destroy: destroyStub
    });

    registerStreamErrorHandler(stream1);

    stream1.read();
    stream1.emit('error', new Error('test error')); // Emit an error to trigger the error handler

    expect(readStub).to.have.been.calledOnce;
    expect(destroyStub).to.have.been.calledOnce;
  });
});
