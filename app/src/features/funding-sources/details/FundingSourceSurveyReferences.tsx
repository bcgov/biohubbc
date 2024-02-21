import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { IGetFundingSourceResponse } from 'interfaces/useFundingSourceApi.interface';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedAmount } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  filtersBox: {},
  noDataText: {
    fontFamily: 'inherit !important'
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

export interface IFundingSourceSurveyReferencesProps {
  fundingSourceSurveyReferences: IGetFundingSourceResponse['funding_source_survey_references'];
}

interface IFundingSourceSurveyReferencesTableEntry {
  project_id: number;
  survey_id: number;
  survey_name: string;
  amount: number;
}

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary">
      No surveys have referenced this funding source
    </Typography>
  </GridOverlay>
);

const FundingSourceSurveyReferences = (props: IFundingSourceSurveyReferencesProps) => {
  const [fundingSourceSurveyReferences, setFundingSourceSurveyReferences] = useState(
    props.fundingSourceSurveyReferences
  );

  const classes = useStyles();

  const columns: GridColDef<IFundingSourceSurveyReferencesTableEntry>[] = [
    {
      field: 'survey_name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          data-testid={params.row.survey_name}
          underline="always"
          title={params.row.survey_name}
          component={RouterLink}
          to={`/admin/projects/${params.row.project_id}/surveys/${params.row.survey_id}`}
          children={params.row.survey_name}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueGetter: (params) => {
        return getFormattedAmount(params.value, { maximumFractionDigits: 2 });
      }
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  const onSearch = useMemo(
    () =>
      debounce((searchString: string) => {
        const regex = new RegExp(searchString, 'i');
        setFundingSourceSurveyReferences(
          props.fundingSourceSurveyReferences.filter((item) => regex.test(item.survey_name))
        );
      }, 300),
    [props.fundingSourceSurveyReferences]
  );

  return (
    <>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
          Surveys &zwnj;
          <Typography component="span" variant="inherit" color="textSecondary">
            ({Number(fundingSourceSurveyReferences.length ?? 0).toLocaleString()})
          </Typography>
        </Typography>
      </Box>

      <Box mt={2}>
        <Box mb={1}>
          <TextField
            name={'funding-source-survey-references-search'}
            id={'funding-source-survey-references-search'}
            aria-label="Search Referenced Surveys"
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon path={mdiMagnify} size={1} />
                </InputAdornment>
              )
            }}
            inputProps={{
              'data-testid': 'funding-source-survey-references-search'
            }}
            className={classes.filtersBox}
            onChange={(event) => {
              onSearch(event.target.value);
            }}
            variant="outlined"
            fullWidth={true}
          />
        </Box>
        {fundingSourceSurveyReferences.length === 0 ? (
          <Box>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                padding: '24px',
                textAlign: 'center',
                background: grey[100]
              }}>
              <Typography variant="body1" color="textSecondary">
                No surveys found
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Paper elevation={0} variant="outlined">
            <Box>
              <DataGrid
                className={classes.dataGrid}
                autoHeight
                rows={fundingSourceSurveyReferences}
                getRowId={(row) => `funding-source-survey-reference-${row.survey_id}`}
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
                slots={{
                  noRowsOverlay: NoRowsOverlayStyled
                }}
              />
            </Box>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default FundingSourceSurveyReferences;
