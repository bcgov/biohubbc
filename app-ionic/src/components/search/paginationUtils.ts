export interface IPaginationSettings {
  itemsPerPage?: number;
  totalPages?: number;
  currentPage?: number;
  totalItems?: number;
}

export const calculateTotalPages = (totalItems: number, itemsPerPage: number) => {
  return Math.max(Math.ceil(totalItems / itemsPerPage), 1);
};

/**
 * Creates the pagination control label.
 *
 * @param {number} currentPage the current page. starts at 1.
 * @param {number} itemsPerPage how many records to display per page.
 * @param {number} totalItems number of total items that would be returned by the search, if there were no
 * itemsPerPage `limit` constraint.
 * @return {string} pagination control label
 */
export const calculatePaginationLabel = (currentPage: number, itemsPerPage: number, totalItems: number): string => {
  if (!currentPage || !itemsPerPage || !totalItems) {
    return '';
  }

  const low = Math.max((currentPage - 1) * itemsPerPage + 1, 1);
  const high = Math.min(totalItems, currentPage * itemsPerPage);
  return `Displaying ${low} - ${high} of ${totalItems} results`;
};
