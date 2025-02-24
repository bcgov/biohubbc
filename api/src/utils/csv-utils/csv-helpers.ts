/**
 * Given a list of aliases, return a list of all possible alias
 * combinations using spaces and underscores as separators.
 *
 * Note: This will return no duplicates
 *
 * @example
 *  getAllAliases(['HEADER A', 'HEADER_B', 'HEADERC']) =>
 *    [['HEADER A', 'HEADER_A', 'HEADER B', 'HEADER B', 'HEADERC']]
 *
 * @param {Uppercase<string>[]} headers
 * @returns {Uppercase<string>[]} All possible header combinations
 */
export const getAllAliases = (headers: Uppercase<string>[]): Uppercase<string>[] => {
  // If there are no headers, return an empty array
  if (!headers.length) {
    return [];
  }

  // Initialize a new set with the original headers
  const newHeaders = new Set<string>(headers);

  for (const header of headers) {
    // If the header contains a space, add the underscore version ie: 'HEADER A' -> 'HEADER_A'
    if (header.includes(' ')) {
      const headerParts = header.split(' ');

      newHeaders.add(headerParts.join('_'));
    }

    // If the header contains an underscore, add the space version ie: 'HEADER_A' -> 'HEADER A'
    if (header.includes('_')) {
      const headerParts = header.split('_');

      newHeaders.add(headerParts.join(' '));
    }
  }

  // Return the new headers as an array of uppercase strings
  // Note: The `toUpperCase` is not necessary but is included for safety
  return Array.from(newHeaders).map((header) => header.toUpperCase()) as Uppercase<string>[];
};
