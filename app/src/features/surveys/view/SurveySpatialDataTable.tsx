import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { v4 as uuid } from 'uuid';

interface ISurveySpatialDataTableProps {
  tableHeaders: string[];
  tableRows: string[][];
}

const SurveySpatialDataTable = (props: ISurveySpatialDataTableProps) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {props.tableHeaders.map((header) => (
                <TableCell key={uuid()} align="left">
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.tableRows.map((items: string[]) => (
              <TableRow key={uuid()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {items.map((value: string) => (
                  <TableCell key={uuid()}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SurveySpatialDataTable;
