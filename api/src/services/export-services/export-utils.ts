import archiver from 'archiver';
import { Knex } from 'knex';
import QueryStream from 'pg-query-stream';
import { SQLStatement } from 'sql-template-strings';
import { Readable, Transform } from 'stream';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('export-utils.ts');

export function getArchiveStream(): archiver.Archiver {
  const archiveStream = archiver('zip', {
    zlib: {
      level: 9 // Compression level
    }
  });

  return archiveStream;
}

/**
 * Get a query stream from a SQLStatement or Knex.QueryBuilder.
 *
 * @export
 * @param {(SQLStatement | Knex.QueryBuilder)} query
 * @return {*}
 */
export function getQueryStream(query: SQLStatement | Knex.QueryBuilder) {
  const { text, values } = getQueryParams(query);

  const queryStream = new QueryStream(text, values);

  return queryStream;
}

/**
 * Get the query text and values from a SQLStatement or Knex.QueryBuilder.
 *
 * @param {(SQLStatement | Knex.QueryBuilder)} query
 * @return {*}  {{ text: string; values: unknown[] }}
 * @memberof ExportService
 */
export function getQueryParams(query: SQLStatement | Knex.QueryBuilder): { text: string; values: unknown[] } {
  let queryText = '';
  let queryValues = [];

  if (query instanceof SQLStatement) {
    queryText = query.text;
    queryValues = query.values;
  } else {
    queryText = query.toSQL().toNative().sql;
    queryValues = query.toSQL().toNative().bindings as unknown[];
  }

  return { text: queryText, values: queryValues };
}

/**
 * Get a JSON Stringify transform stream, that expects objects and outputs stringified JSON.
 *
 * Note: The incoming data stream must yield objects, or this will throw an error.
 *
 * @export
 * @return {*}
 */
export function getJsonStringifyTransformStream(): Transform {
  const transformStream = new Transform({
    objectMode: true, // Expects objects
    transform(chunk, _encoding, callback) {
      // Stringify the chunk and push it to the next stream
      callback(null, JSON.stringify(chunk));
    }
  });

  return transformStream;
}

/**
 * Adds error handling to a stream to prevent memory leaks.
 *
 * Registers an 'error' event handler on the stream that emits am 'end' event and destroys the stream, if not already
 * destroyed.
 *
 * @export
 * @param {Readable} stream
 * @return {*}  {Readable}
 */
export function registerStreamErrorHandler(stream: Readable): Readable {
  stream.on('error', (error) => {
    defaultLog.debug({ label: 'handleStreamEvents', message: 'error', error, stream: stream.constructor.name });

    // Emit end to close the stream
    stream.emit('end');

    if (!stream.destroyed) {
      // Destroy the stream to prevent memory leaks
      stream.destroy();
    }
  });

  return stream;
}
