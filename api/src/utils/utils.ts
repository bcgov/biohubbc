/**
 * Returns a comparator function that sorts objects in ascending order.
 *
 * @param {string[]} fields An array of ordered field names to sort on.
 * If the the fields[0] comparison results in a tie, then the fields[1] comparison will run, etc.
 * @return {*}
 */
export function getAscObjectSorter(fields: string[]) {
  return (a: object, b: object) => {
    for (const field of fields) {
      if (a[field] < b[field]) {
        return -1;
      }

      if (a[field] > b[field]) {
        return 1;
      }
    }

    return 0;
  };
}
