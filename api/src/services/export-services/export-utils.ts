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
export function getCsvTransformStream(
  transformFunction: TransformFunction,
  header: string,
  measurementsMap?: Map<string, string>
): Transform {
  // Function to get either option_label or measurement_name by id
  const getLabelById = (id: string): string | undefined => {
    return measurementsMap ? measurementsMap.get(id) : undefined;
  };

  let headerStreamed = false;
  const transformStream = new Transform({
    objectMode: true, // Expects objects
    transform(chunk, _encoding, callback) {
      if (header && !headerStreamed) {
        // This block is executed only once
        const envHeaders: string[] = chunk.env_data ? chunk.env_data.map((envItem: { eh: string }) => envItem.eh) : [];
        const measHeaders: string[] = chunk.meas_data
          ? chunk.meas_data.map((measItem: { mh: string }) => getLabelById(measItem.mh))
          : [];

        // Push the headers into stream
        this.push([header, ...envHeaders, ...measHeaders].join(',') + '\r\n');
        headerStreamed = true;
      }

      // check if there are any uuids for the qulitative measurments values 'mv' and get the label from map
      if (chunk.meas_data) {
        // Note: using indexed for loop as it is the fastest
        for (let i = 0; i < chunk.meas_data.length; i++) {
          const measItem = chunk.meas_data[i];
          if (!isUUID(measItem.mv)) {
            continue;
          }
          measItem.mv = getLabelById(measItem.mv);
        }
      }

      // push it to the next stream
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

/**
 * Check if a value is a uuid or not.
 * Optimized for performance
 *
 * @param {string} uuid
 * @returns {boolean} true if it is a uuid
 */
export const isUUID = (uuid: string): boolean => {
  // UUID must not be null length must be 36 characters
  if (!uuid || uuid.length !== 36) {
    return false;
  }

  // Check fixed positions for hyphens and uuid version 4
  if (uuid[8] !== '-' || uuid[13] !== '-' || uuid[14] !== '4' || uuid[18] !== '-' || uuid[23] !== '-') {
    return false;
  }

  // Check if the remaining characters are valid hexadecimal digits
  // Note: using indexed for loop as it is the fastest
  uuid = uuid.split('-').join('').toLowerCase();
  const hexChars = new Set('0123456789abcdef');
  for (let i = 0; i < uuid.length; i++) {
    if (!hexChars.has(uuid[i])) {
      return false;
    }
  }

  return true;
};
