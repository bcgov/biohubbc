import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { useEffect } from 'react';
import { SurveyTechniqueCard } from './components/SurveyTechniqueCard';

const pageSizeOptions = [10, 25, 50];

export interface ISurveyTechniquesCardContainerProps {
  techniques: IGetTechniqueResponse[];
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  rowCount: number;
}

export const SurveyTechniquesCardContainer = (props: ISurveyTechniquesCardContainerProps) => {
  const { techniques, paginationModel, setPaginationModel, rowCount } = props;

  const biohubApi = useBiohubApi();
  // Get method attributes for relevant method lookup ids
  const methodAttributeDataLoader = useDataLoader(() =>
    biohubApi.reference.getTechniqueAttributes(techniques.map((technique) => technique.method_lookup_id))
  );

  useEffect(() => {
    methodAttributeDataLoader.load();
  }, [methodAttributeDataLoader]);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // reset the page to 0 when changing the page size
    setPaginationModel((model) => ({ ...model, page: 0, pageSize: parseInt(event.target.value, 10) }));
  };

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPaginationModel((model) => ({ ...model, page: newPage }));
  };

  return (
    <>
      <Box flex="1 1 auto" overflow="auto">
        <Stack gap={1} direction="column" p={2}>
          {techniques.map((technique) => {
            const attributes = methodAttributeDataLoader.data?.find(
              (method) => method.method_lookup_id === technique.method_lookup_id
            );

            return (
              <SurveyTechniqueCard
                key={technique.method_technique_id}
                methodAttributes={{
                  quantitative: attributes?.quantitative_attributes ?? [],
                  qualitative: attributes?.qualitative_attributes ?? []
                }}
                technique={technique}
              />
            );
          })}
        </Stack>
      </Box>
      <Box flex="0 0 auto">
        <Divider flexItem />
        <TablePagination
          component="div"
          sx={{
            flex: 1,
            display: 'flex',
            '& .MuiTablePagination-toolbar': { width: '100%' },
            '& .MuiTablePagination-selectLabel': { flexShrink: 0 },
            '& .MuiTablePagination-select': {
              paddingRight: '24px',
              minWidth: '16px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            },
            '& .MuiTablePagination-displayedRows': { flexShrink: 0 },
            '& .MuiTablePagination-actions': { marginLeft: '20px', flexShrink: 0 }
          }}
          labelRowsPerPage="Rows per page:"
          rowsPerPage={paginationModel.pageSize}
          page={paginationModel.page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={pageSizeOptions}
          onRowsPerPageChange={handleChangeRowsPerPage}
          count={rowCount}
        />
      </Box>
    </>
  );
};
