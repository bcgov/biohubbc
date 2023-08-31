import { makeStyles } from '@mui/styles';
import { grey } from '@mui/material/colors';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { ICritterSimpleResponse } from 'hooks/cb_api/useCritterApi';
import SurveyAnimalsTableActions from './SurveyAnimalsTableActions';
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

interface ISurveyAnimalsTableEntry {
  critter_id: string; 
  animal_id: string;
  taxon: string;
}

interface ISurveyAnimalsTableProps {
  animalData: ICritterSimpleResponse[];
}

const noOpPlaceHolder = (critter_id: string) => { };

export const SurveyAnimalsTable = ({ animalData }: ISurveyAnimalsTableProps): JSX.Element => {
  const classes = useStyles();
  const columns: GridColDef<ISurveyAnimalsTableEntry>[] = [
    {
      field: 'critter_id',
      headerName: 'Critter ID',
      flex: 1,
      minWidth: 300
    },
    {
      field: 'animal_id',
      headerName: 'Animal ID',
      flex: 1,
    },
    {
      field: 'taxon',
      headerName: 'Taxon name',
      flex: 1
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      flex: 1,
      align: 'right',
      renderCell: (params) => (
        <SurveyAnimalsTableActions
          critter_id={params.row.critter_id}
          onAddDevice={noOpPlaceHolder}
          onRemoveDevice={noOpPlaceHolder}
          onEditCritter={noOpPlaceHolder}
          onEditDevice={noOpPlaceHolder}
        />
      )
    }
  ];

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={animalData}
      getRowId={(row) => `survey-critter-${row.critter_id}`}
      columns={columns}
      pageSizeOptions={[5]}
      rowSelection={false}
      checkboxSelection={false}
      hideFooter
      disableRowSelectionOnClick
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      sortingOrder={['asc', 'desc']}
      data-testid="survey-animal-table"
    />
  );
};
