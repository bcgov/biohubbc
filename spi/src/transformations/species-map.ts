import axios from 'axios';
import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';
import { getItisSolrTermSearchUrl, ISpiSpeciesObject, readCsvToJson } from '../utils/species-map';
// Define constants for chunking and testing
const NUMBER_OF_SPECIES_FOR_TESTING = 0; // Set a limit for testing, if needed
const NUMBER_OF_SPECIES_PER_REQUEST = 25; // Size of chunks for processing ITIS requests

/**
 * Generic response type for ITIS Solr service
 */
type ItisSolrResponseBase<T> = {
  response: {
    docs: T;
  };
};

/**
 * Type definition for species mapping data
 */
interface ISpeciesMapData {
  itis: ItisSolrSearchResponse | null;
  spi: ISpiSpeciesObject;
}

/**
 * Type definition for ITIS Solr search response
 */
export type ItisSolrSearchResponse = {
  tsn: string;
  nameWInd: string;
  nameWOInd: string;
  unit1: string;
  usage: string;
  rank: string;
};

/**
 * Main function to insert SPI species ITIS TSN mappings
 * @param filepath - Path to the CSV file containing SPI codes
 * @param connection - Database connection object
 */
export const insertMappedSpecies = async (filepath: string, connection: IDBConnection): Promise<void> => {
  // Read SPI codes from the CSV file
  let spiCodes = readCsvToJson(filepath);

  // Optionally limit the number of species for testing
  if (NUMBER_OF_SPECIES_FOR_TESTING) {
    spiCodes = spiCodes.slice(0, NUMBER_OF_SPECIES_FOR_TESTING);
  }

  // Create the mapping table if it does not yet exist, and then truncate the table in case it does exist
  // NOTE: This can be removed when migrate_spi_species is added via a migration
  await connection.sql(SQL`
    CREATE TABLE IF NOT EXISTS public.migrate_spi_species (
        id                      integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        spi_species_id          INTEGER NOT NULL,
        spi_species_code        VARCHAR(128),
        spi_scientific_name     VARCHAR(128),
        spi_rank                VARCHAR(24),
        itis_tsn                VARCHAR(16),
        itis_scientific_name    VARCHAR(128),
        itis_rank               VARCHAR(24),
        CONSTRAINT itis_tsn_uk UNIQUE (itis_tsn),
        CONSTRAINT spi_species_id_uk UNIQUE (spi_species_id)
    );
    
    TRUNCATE TABLE public.migrate_spi_species;
    
    SET search_path = biohub, public;
  `);

  // Fetch ITIS TSNs for the SPI species
  const speciesMap = await _fetchItisTsns(spiCodes);

  // Chunk the map for database inserts. Chunks are used to limit the number of records being inserted at a time
  const chunks = _chunkArray(Array.from(speciesMap), 300);

  const promises = [];

  // Insert each chunk of species into the database
  for (const chunk of chunks) {
    if (chunk.length) {
      promises.push(_insertItisRecords(new Map(chunk), connection));
    }
  }

  await Promise.all(promises);

  console.log('Successfully inserted species');
};

/**
 * Inserts ITIS records into the database
 * @param objectsForInsert - Map of species data to be inserted
 * @param connection - Database connection object
 * @returns The result of the database operation
 */
async function _insertItisRecords(objectsForInsert: Map<number, ISpeciesMapData>, connection: IDBConnection) {
  // Initialize an empty array to hold SQL value parts
  const sqlParts: string[] = [];

  // Build the values part of the SQL statement
  for (const [key, item] of objectsForInsert) {
    // Combine species unit names
    const builtScientificName =
      _buildScientificName([item.spi.UNIT_NAME1, item.spi.UNIT_NAME2, item.spi.UNIT_NAME3]) || null;

    // Prepare values for insertion
    const spiCode = item.spi?.CODE?.trim() || null;
    const phyloSortSequence = item.spi?.PHYLO_SORT_SEQUENCE || null;
    const itisTsn = item.itis?.tsn || null;
    const itisNameWInd = item.itis?.nameWInd || null;
    const itisRank = item.itis?.rank || null;

    // Construct SQL values string with proper SQL NULL handling
    const sqlValues = `
      (${key},
      ${_formatStringOrNull(spiCode)},
        ${_formatStringOrNull(builtScientificName)},
          ${phyloSortSequence},
            ${_formatStringOrNull(itisTsn)},
              ${_formatStringOrNull(itisNameWInd)},
                ${_formatStringOrNull(itisRank)})`;

    // Add the constructed values to the SQL parts array
    sqlParts.push(sqlValues);
  }

  let sql = SQL``;

  // Only build the insert SQL if there are values to insert
  if (sqlParts.length > 0) {
    // Initialize SQL statement
    const insertSql = SQL`
  INSERT INTO public.migrate_spi_species (
    spi_species_id,
    spi_species_code,
    spi_scientific_name,
    spi_rank,
    itis_tsn,
    itis_scientific_name,
    itis_rank
  ) VALUES `;

    // Append all values to the insert statement
    insertSql.append(sqlParts.join(', '));

    // TODO: Remove the need for ON CONFLICT.
    // Do nothing on conflicts, which happens when an ITIS TSN has already been inserted.
    insertSql.append(' ON CONFLICT DO NOTHING;');

    // Append the insert statement to the main SQL
    sql.append(insertSql);
  }

  // Execute the SQL statement
  try {
    const response = await connection.sql(sql);
    return response.rows;
  } catch (error) {
    console.error('Error during insert operation:', error);
    throw error;
  }
}

/**
 * Fetches ITIS TSNs for a list of SPI species
 * @param spiCodes - List of SPI species objects
 * @returns A map of species ID to species data with ITIS TSNs
 */
async function _fetchItisTsns(spiCodes: ISpiSpeciesObject[]) {
  // Chunk the SPI codes array
  const chunks = _chunkArray(spiCodes, NUMBER_OF_SPECIES_PER_REQUEST);

  let results: ItisSolrResponseBase<ItisSolrSearchResponse[]>[] = [];

  // Fetch ITIS data for each chunk
  for (const chunk of chunks) {
    try {
      // Construct the search URL
      const url = getItisSolrTermSearchUrl(
        chunk
          .map((species) => _buildScientificName([species.UNIT_NAME1, species.UNIT_NAME2, species.UNIT_NAME3]))
          .filter(Boolean)
      );

      // Fetch data from ITIS Solr API
      const { data } = await axios.get<ItisSolrResponseBase<ItisSolrSearchResponse[]>>(url, {});

      results = [...results, data];
    } catch (error) {
      console.error('Error fetching ITIS TSNs:', error);
    }
  }

  // Flatten and map the ITIS results
  const flattenedItisResult = results.filter((result) => result.response).flatMap((result) => result.response.docs);

  // Map SPI codes to ITIS data
  const speciesMap = new Map<number, ISpeciesMapData>();

  for (const spiCode of spiCodes) {
    speciesMap.set(spiCode.ID, {
      itis:
        flattenedItisResult.find(
          (itisResult) =>
            itisResult.nameWOInd.toLowerCase() ===
            _buildScientificName([spiCode.UNIT_NAME1, spiCode.UNIT_NAME2, spiCode.UNIT_NAME3]).toLowerCase()
        ) ?? null,
      spi: spiCode
    });
  }
  return speciesMap;
}

/**
 * Splits an array into smaller chunks
 * @param array - The array to be split
 * @param chunkSize - The size of each chunk
 * @returns An array of chunks
 */
function _chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * Splits an array into smaller chunks
 * @param array - The array to be split
 * @param chunkSize - The size of each chunk
 * @returns An array of chunks
 */
function _buildScientificName(names: string[]): string {
  return names.filter(Boolean).join(' ').trim();
}

/**
 * Formats a value for SQL insertion.
 * If the value is null or undefined, returns 'NULL'.
 * Otherwise, returns the value wrapped in single quotes.
 *
 * @param value - The value to be formatted.
 * @returns A formatted string suitable for SQL insertion.
 */
function _formatStringOrNull(value: string | null): string {
  return value ? `'${value}'` : 'NULL';
}
