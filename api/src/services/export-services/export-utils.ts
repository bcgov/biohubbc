import archiver from 'archiver';
import { Knex } from 'knex';
import QueryStream from 'pg-query-stream';
import { SQLStatement } from 'sql-template-strings';
import { Readable, Transform } from 'stream';
import { getLogger } from '../../utils/logger';
import { TransformFunction } from './export-strategy';

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
 * Get a query data record transform stream, that expects objects and outputs csv.
 *
 * Note: The incoming data stream must yield objects, or this will throw an error.
 *
 * @export
 * @returns {Transform}
 */
export function getCsvTransformStream(transformFunction: TransformFunction, header: string): Transform {
  let headerStreamed = false;
  const transformStream = new Transform({
    objectMode: true, // Expects objects
    transform(chunk, _encoding, callback) {
      if (header && !headerStreamed) {
        const envHeaders = [];
        for (let i = 0; i < chunk.env_data.length; i++) {
          const envItem = chunk.env_data[i];
          envHeaders.push(envItem.env_header);
        }

        // Push the headers into stream only once
        this.push(header + ',' + envHeaders.join(',') + '\r\n');
        headerStreamed = true;
      }
      // the chunk and push it to the next stream
      callback(null, transformFunction(chunk) + '\r\n');
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

/**
 * Format date and time into timestamp string.
 *
 * @param {string} date - Date string
 * @param {string} [time] - Time string
 * @returns {string} Formatted date and time string
 */

/**
 * Parse date and time strings from timestamp
 *
 * @param {string} timestamp
 * @returns {{ dateStr: string; timeStr: string }}
 */
export const parseTimestampString = (timestamp: string): { dateStr: string; timeStr: string } => {
  const date = new Date(timestamp);
  const dateStr = new Intl.DateTimeFormat('en-CA').format(date);

  // Format the time part (HH:mm:ss) with Canada PST timezone
  const timeStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver', // Use Canada PST timezone
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short' // Include timezone abbreviation
  }).format(date);

  return { dateStr, timeStr };
};
