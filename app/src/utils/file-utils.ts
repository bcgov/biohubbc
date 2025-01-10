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
