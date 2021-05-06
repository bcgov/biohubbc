export const handleChangePage = (event: unknown, newPage: number, setPage: (page: number) => void) => {
  setPage(newPage);
};

export const handleChangeRowsPerPage = (
  event: React.ChangeEvent<HTMLInputElement>,
  setPage: (page: number) => void,
  setRowsPerPage: (rowsPerPage: number) => void
) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};
