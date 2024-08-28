/**
 * Get CSV template from a list of column headers.
 *
 * @param {string[]} headers - CSV column headers
 * @returns {string}
 */
export const getCSVTemplate = (headers: string[]) => {
  return 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
};

/**
 * Download a file client side.
 *
 * @param {string} fileContents - String representing the file contents
 * @param {string} fileName - The name of the file to download
 */
export const downloadFile = (fileContents: string, fileName: string) => {
  const encodedUri = encodeURI(fileContents);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
};
