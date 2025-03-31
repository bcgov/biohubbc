import chai, { expect } from 'chai';
import knex from 'knex';
import { describe } from 'mocha';
import QueryStream from 'pg-query-stream';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL, { SQLStatement } from 'sql-template-strings';
import { Readable, Transform } from 'stream';
import { getKnex } from '../../database/db';
import {
  getArchiveStream,
  getCsvTransformStream,
  getQueryParams,
  getQueryStream,
  getStreamCsvTransformStream,
  isUUID,
  parseTimestampString,
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

describe('getStreamCsvTransformStream', () => {
  it('returns a transform stream', async () => {
    const jsonTransform = getStreamCsvTransformStream('', ['test']);

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

describe('getCsvTransformStream', () => {
  it('should transform data and push correct headers and transformed data to the stream', (done) => {
    // Sample data
    const mockTransformFunction = (chunk: any) => {
      return JSON.stringify(chunk); // Mock transform function for simplicity
    };

    const header = 'Header1,Header2';
    const measurementsMap = new Map([
      ['uuid1', 'Label1'],
      ['uuid2', 'Label2']
    ]);

    const chunk = {
      attrib_data: [{ ah: 'Attribute1' }],
      vantage_data: [{ vh: 'Vantage1' }],
      env_data: [{ eh: 'Env1' }],
      meas_data: [
        { mh: 'uuid1', mv: 'uuid1' }, // This will be replaced with 'Label1'
        { mh: 'uuid2', mv: 'uuid2' } // This will be replaced with 'Label2'
      ]
    };

    // Create the transform stream
    const transformStream = getCsvTransformStream(mockTransformFunction, header, measurementsMap);

    const result: string[] = [];

    transformStream.on('data', (data) => {
      result.push(data);
    });

    transformStream.on('end', () => {
      // Assert that the headers were pushed correctly
      const expectedHeader = `${header},Env1,Label1,Label2,Attribute1,Vantage1\r\n`;
      expect(result[0]).to.equal(expectedHeader);

      // Assert that the transformed data is correct
      const expectedTransformedData =
        JSON.stringify({
          attrib_data: [{ ah: 'Attribute1' }],
          vantage_data: [{ vh: 'Vantage1' }],
          env_data: [{ eh: 'Env1' }],
          meas_data: [
            { mh: 'uuid1', mv: 'Label1' }, // Label replaced
            { mh: 'uuid2', mv: 'Label2' } // Label replaced
          ]
        }) + '\r\n';

      expect(result[1]).to.equal(expectedTransformedData);
      done();
    });

    // Push the sample chunk to the transform stream
    transformStream.write(chunk);
    transformStream.end();
  });

  it('should transform data and handle missing measurementsMap gracefully', (done) => {
    // Sample data with no measurementsMap (missing map)
    const mockTransformFunction = (chunk: any) => {
      return JSON.stringify(chunk); // Mock transform function for simplicity
    };

    const header = 'Header1';

    const chunk = {
      attrib_data: [{ ah: 'Attribute1' }],
      vantage_data: [{ vh: 'Vantage1' }],
      env_data: [{ eh: 'Env1' }]
    };

    // Create the transform stream with no measurementsMap
    const transformStream = getCsvTransformStream(mockTransformFunction, header);

    const result: string[] = [];

    transformStream.on('data', (data) => {
      result.push(data);
    });

    transformStream.on('end', () => {
      // Assert that the headers were pushed correctly
      const expectedHeader = `${header},Env1,Attribute1,Vantage1\r\n`; // No Label replacement
      expect(result[0]).to.equal(expectedHeader);

      // Assert that the transformed data is correct (no label replacement)
      const expectedTransformedData =
        JSON.stringify({
          attrib_data: [{ ah: 'Attribute1' }],
          vantage_data: [{ vh: 'Vantage1' }],
          env_data: [{ eh: 'Env1' }]
        }) + '\r\n';

      expect(result[1]).to.equal(expectedTransformedData);
      done();
    });

    // Push the sample chunk to the transform stream
    transformStream.write(chunk);
    transformStream.end();
  });

  it('should handle missing meas_data gracefully', (done) => {
    const mockTransformFunction = (chunk: any) => {
      return JSON.stringify(chunk); // Mock transform function for simplicity
    };

    const header = 'Header1';
    const chunk = {
      attrib_data: [{ ah: 'Attribute1' }],
      vantage_data: [{ vh: 'Vantage1' }],
      env_data: [{ eh: 'Env1' }],
      meas_data: undefined // Simulate missing meas_data
    };

    const transformStream = getCsvTransformStream(mockTransformFunction, header);

    const result: string[] = [];

    transformStream.on('data', (data) => {
      result.push(data);
    });

    transformStream.on('end', () => {
      const expectedHeader = `${header},Env1,Attribute1,Vantage1\r\n`;
      expect(result[0]).to.equal(expectedHeader);

      const expectedTransformedData =
        JSON.stringify({
          attrib_data: [{ ah: 'Attribute1' }],
          vantage_data: [{ vh: 'Vantage1' }],
          env_data: [{ eh: 'Env1' }],
          meas_data: undefined
        }) + '\r\n';

      expect(result[1]).to.equal(expectedTransformedData);
      done();
    });

    transformStream.write(chunk);
    transformStream.end();
  });
});

describe('parseTimestampString', () => {
  it('should correctly parse a timestamp into date and time strings in PST timezone', () => {
    // Test case: a timestamp string (ISO 8601 format)
    const timestamp = '2025-03-28T15:30:00Z'; // UTC time
    const result = parseTimestampString(timestamp);

    // Expected results for the provided timestamp
    const expectedDateStr = '2025-03-28'; // Format: yyyy-MM-dd
    const expectedTimeStr = '08:30:00 PDT'; // Time in PST (America/Vancouver)

    // Check that the parsed date and time strings are correct
    expect(result.dateStr).to.equal(expectedDateStr);
    expect(result.timeStr).to.equal(expectedTimeStr);
  });

  it('should handle a timestamp with a different time zone correctly', () => {
    // Test case: a timestamp string (ISO 8601 format)
    const timestamp = '2025-03-28T15:30:00+02:00'; // UTC+2 time
    const result = parseTimestampString(timestamp);

    // Expected results for the provided timestamp (converted to PST)
    const expectedDateStr = '2025-03-28'; // Format: yyyy-MM-dd
    const expectedTimeStr = '06:30:00 PDT'; // Time in PST (America/Vancouver)

    // Check that the parsed date and time strings are correct
    expect(result.dateStr).to.equal(expectedDateStr);
    expect(result.timeStr).to.equal(expectedTimeStr);
  });

  it('should correctly parse a timestamp with no timezone (local time)', () => {
    // Test case: a timestamp string (ISO 8601 format)
    const timestamp = '2025-03-28T15:30:00'; // Local time
    const result = parseTimestampString(timestamp);

    // Expected results for the provided timestamp (converted to PST)
    const expectedDateStr = '2025-03-28'; // Format: yyyy-MM-dd
    const expectedTimeStr = '15:30:00 PDT'; // Time in PST (America/Vancouver)

    // Check that the parsed date and time strings are correct
    expect(result.dateStr).to.equal(expectedDateStr);
    expect(result.timeStr).to.equal(expectedTimeStr);
  });

  it('should return the correct date and time for a timestamp on the edge of a timezone', () => {
    // Test case: a timestamp string at the edge of timezones (UTC+12)
    const timestamp = '2025-03-28T15:30:00+12:00'; // UTC+12 time
    const result = parseTimestampString(timestamp);

    // Expected results for the provided timestamp (converted to PST)
    const expectedDateStr = '2025-03-27'; // Format: yyyy-MM-dd
    const expectedTimeStr = '20:30:00 PDT'; // Time in PST (America/Vancouver)

    // Check that the parsed date and time strings are correct
    expect(result.dateStr).to.equal(expectedDateStr);
    expect(result.timeStr).to.equal(expectedTimeStr);
  });
});

describe('getStreamCsvTransformStream', () => {
  it('should correctly stream with header and collectionCategories', (done) => {
    const header = 'ID,Name,Age';
    const collectionCategories = ['Category1', 'Category2'];

    const transformStream = getStreamCsvTransformStream(header, collectionCategories);

    const chunks: string[] = [];

    // Handle the data pushed into the stream
    transformStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Handle end of stream
    transformStream.on('end', () => {
      // Check if header is correct and only pushed once
      expect(chunks[0]).to.equal('ID,Name,Age,Category1,Category2\r\n');
      expect(chunks[1]).to.equal('data chunk 1\r\n');
      expect(chunks[2]).to.equal('data chunk 2\r\n');
      done();
    });

    // Push data into the stream
    transformStream.write('data chunk 1');
    transformStream.write('data chunk 2');
    transformStream.end();
  });

  it('should correctly stream with header but without collectionCategories', (done) => {
    const header = 'ID,Name,Age';

    const transformStream = getStreamCsvTransformStream(header);

    const chunks: string[] = [];

    transformStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    transformStream.on('end', () => {
      // Check if header is correct and only pushed once
      expect(chunks[0]).to.equal('ID,Name,Age\r\n');
      expect(chunks[1]).to.equal('data chunk 1\r\n');
      done();
    });

    transformStream.write('data chunk 1');
    transformStream.end();
  });

  it('should not push header if no header is provided', (done) => {
    const transformStream = getStreamCsvTransformStream('');

    const chunks: string[] = [];

    transformStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    transformStream.on('end', () => {
      // No header is added, only data chunk should be present
      expect(chunks[0]).to.equal('data chunk 1\r\n');
      done();
    });

    transformStream.write('data chunk 1');
    transformStream.end();
  });

  it('should handle empty chunks correctly (null or undefined)', (done) => {
    const header = 'ID,Name,Age';
    const transformStream = getStreamCsvTransformStream(header);

    const chunks: string[] = [];

    transformStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    transformStream.on('end', () => {
      // Check that empty chunks are correctly handled
      expect(chunks[0]).to.equal('ID,Name,Age\r\n');
      expect(chunks[1]).to.equal('');
      done();
    });

    transformStream.write('');
    transformStream.end();
  });

  it('should emit the header only once, even for multiple chunks', (done) => {
    const header: string = 'name,age';
    const collectionCategories: string[] = ['category1', 'category2'];

    const transformStream: Transform = getStreamCsvTransformStream(header, collectionCategories);

    const inputStream: Readable = Readable.from(['data1', 'data2', 'data3']);
    const outputStream: Transform = inputStream.pipe(transformStream);

    const outputChunks: string[] = [];
    outputStream.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk.toString());
    });

    outputStream.on('end', () => {
      // Check that the header is emitted only once
      const expectedHeader: string = `${header},category1,category2\r\n`;
      expect(outputChunks[0]).to.equal(expectedHeader); // header should appear only once
      expect(outputChunks[1]).to.equal('data1\r\n');
      expect(outputChunks[2]).to.equal('data2\r\n');
      expect(outputChunks[3]).to.equal('data3\r\n');
      done();
    });
  });

  it('should handle falsy chunks correctly', (done) => {
    const header: string = 'name,age';
    const transformStream: Transform = getStreamCsvTransformStream(header);

    // Filter out null or undefined chunks before passing to the stream
    const inputChunks = [null, '', 'data1', 'data2'].filter((chunk) => chunk !== null && chunk !== undefined);

    // Create a Readable stream from the filtered chunks
    const inputStream: Readable = Readable.from(inputChunks);
    const outputStream: Transform = inputStream.pipe(transformStream);

    const outputChunks: string[] = [];
    outputStream.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk.toString());
    });

    outputStream.on('end', () => {
      // The first chunk was null, so it's filtered out, and the second is an empty string.
      const expectedHeader: string = `${header}\r\n`;
      const expectedData: string[] = [
        expectedHeader, // The header
        '', // The empty chunk should result in just a line break
        'data1\r\n', // Normal data chunk
        'data2\r\n' // Normal data chunk
      ];

      // Check if the output matches the expected output
      expect(outputChunks).to.deep.equal(expectedData);
      done();
    });
  });
});

describe('getQueryParams', () => {
  it('should return the correct params for SQLStatement', () => {
    const sqlStatementMock: SQLStatement = SQL`SELECT * FROM users WHERE id = ${1}`;

    const result = getQueryParams(sqlStatementMock);

    expect(result.text).to.equal('SELECT * FROM users WHERE id = $1');
    expect(result.values).to.deep.equal([1]);
  });

  it('should return the correct params for Knex.QueryBuilder', () => {
    const knexMock = knex({ client: 'pg' });

    // Mocking a Knex QueryBuilder
    const queryBuilderMock = knexMock.select('*').from('users').where('id', 1);

    // Correctly mock toSQL method to return an object with sql, bindings, toNative, and other required fields
    queryBuilderMock.toSQL = () => ({
      method: 'select', // The method used in the query
      sql: 'select * from "users" where "id" = ?', // The SQL string
      bindings: [1], // The array of bindings (parameterized values)
      options: {}, // Empty options
      toNative: () => ({ sql: 'select * from "users" where "id" = ?', bindings: [1] }) // Mock the toNative method
    });

    const result = getQueryParams(queryBuilderMock);

    expect(result.text).to.equal('select * from "users" where "id" = ?');
    expect(result.values).to.deep.equal([1]);
  });
});

describe('isUUID', () => {
  it('should return true for a valid UUIDv4', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000'; // Example of a valid UUIDv4
    const result = isUUID(validUUID);
    expect(result).to.be.true;
  });

  it('should return false for a UUID with invalid length', () => {
    const invalidUUID = '550e8400-e29b-41d4-a716-44665544'; // UUID is too short
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for a UUID that is too long', () => {
    const invalidUUID = '550e8400-e29b-41d4-a716-4466554400000'; // UUID is too long
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for a UUID with incorrect hyphen placement', () => {
    const invalidUUID = '550e8400e29b-41d4-a716-446655440000'; // Hyphen placement is wrong
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for a UUID with an invalid version', () => {
    const invalidUUID = '550e8400-e29b-51d4-a716-446655440000'; // Version is 5, not 4
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for a UUID with invalid characters', () => {
    const invalidUUID = '550e8400-e29b-41d4-a716-44665544zzzz'; // Invalid hex characters
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for an empty string', () => {
    const invalidUUID = ''; // Empty string
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });

  it('should return false for a null value', () => {
    const invalidUUID = null; // Null value
    const result = isUUID(invalidUUID);
    expect(result).to.be.false;
  });
});
