import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import NoRowsOverlay from 'features/funding-sources/list/FundingSourcesTableNoRowsOverlay';
import { useCallback } from 'react';
const useStyles = makeStyles(() => ({
  projectsTable: {
    tableLayout: 'fixed'
  },
  linkButton: {
    textAlign: 'left',
    fontWeight: 700
  },
  noDataText: {
    fontFamily: 'inherit !important',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  dataGrid: {
    border: 'none !important',
    fontFamily: 'inherit !important',
    '& .MuiDataGrid-columnHeaderTitle': {
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: grey[600]
    },
    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeader:focus-within':
      {
        outline: 'none !important'
      },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'transparent !important'
    }
  }
}));
export const StyledDataGrid = (props: DataGridProps) => {
  const classes = useStyles();
  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);
  return <DataGrid {...props} className={classes.dataGrid} slots={{ noRowsOverlay: NoRowsOverlayStyled }} />;
};
