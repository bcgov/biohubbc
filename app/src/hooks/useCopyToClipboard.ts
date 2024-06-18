/**
 * Returns a hook that can be used to copy text to the clipboard.
 *
 * @return {*}
 */
export const useCopyToClipboard = () => {
  const copyToClipboard = (text: string, onCopy?: (text: string) => void) => {
    return navigator.clipboard.writeText(text).then(() => {
      onCopy?.(text);
    });
  };

  return {
    /**
     * Copies the provided text to the clipboard.
     *
     * Accepts an optional callback that is fired after the text is copied successfully.
     *
     * @param {string} text
     * @param {(text: string) => void} [onCopy]
     * @return {Promise<void>}
     */
    copyToClipboard
  };
};
