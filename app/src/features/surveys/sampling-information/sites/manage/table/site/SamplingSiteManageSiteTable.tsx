import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { SamplingSiteManageTable } from '../SamplingSiteManageTable';

// Define the row data interface
interface ISamplingSiteRowData {
  id: number;
  name: string;
  description: string;
}

// Define props interface without generics
interface ISamplingSiteManageSiteTableProps {
  sites: IGetSampleSiteResponse;
  handleRowSelection: (selection: GridRowSelectionModel) => void;
  rowSelectionModel: GridRowSelectionModel;
}

export const SamplingSiteManageSiteTable = (props: ISamplingSiteManageSiteTableProps) => {
  const { sites, handleRowSelection, rowSelectionModel } = props;

  // Map the sites data to rows
  const rows: ISamplingSiteRowData[] =
    sites?.sampleSites.map((site) => ({
      id: Number(site.survey_sample_site_id),
      name: site.name,
      description: site.description || '' // Ensure description is always a string
    })) || [];

  // Define columns with correct type
  const columns: GridColDef<ISamplingSiteRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: (params) => (
        <Box alignItems="flex-start">
          <Typography
            color="textSecondary"
            variant="body2"
            flex="0.4"
            sx={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
            {params.row.description}
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <SamplingSiteManageTable
      rows={rows}
      columns={columns}
      rowSelectionModel={rowSelectionModel}
      handleRowSelection={handleRowSelection}
      noRowsMessage="No Sites"
      noRowsOverlayTitle="Add Sampling Sites"
      noRowsOverlaySubtitle="Sampling Sites show where techniques were implemented"
      checkboxSelection
      sx={{
        '& .MuiDataGrid-columnHeaderDraggableContainer': {
          minWidth: '50px'
        }
      }}
    />
  );
};


// return (
//   <>
//     <Box display="flex" alignItems="center" px={2} ml={1} height={55}>
//       <FormGroup>
//         <FormControlLabel
//           label={
//             <Typography
//               variant="body2"
//               component="span"
//               color="textSecondary"
//               fontWeight={700}
//               sx={{ textTransform: 'uppercase' }}>
//               Select All
//             </Typography>
//           }
//           control={
//             <Checkbox
//               sx={{ mr: 0.75 }}
//               checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === samplingSiteCount}
//               indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < samplingSiteCount}
//               onClick={() => {
//                 if (checkboxSelectedIds.length === samplingSiteCount) {
//                   setCheckboxSelectedIds([]);
//                   return;
//                 }
//                 const sampleSiteIds = sampleSites.map((sampleSite) => sampleSite.survey_sample_site_id);
//                 setCheckboxSelectedIds(sampleSiteIds);
//               }}
//               inputProps={{ 'aria-label': 'controlled' }}
//             />
//           }
//         />
//       </FormGroup>
//     </Box>
//     <Divider flexItem />
//     <Stack flex="1 1 auto" gap={0} sx={{ background: grey[50], borderRadius: '4px' }}>
//       {sampleSites.map((sampleSite) => (
//         <SamplingSiteCard
//           sampleSite={sampleSite}
//           handleCheckboxChange={handleCheckboxChange}
//           handleMenuClick={(event) => {
//             setSampleSiteAnchorEl(event.currentTarget);
//             setSelectedSampleSiteId(sampleSite.survey_sample_site_id);
//           }}
//           key={sampleSite.survey_sample_site_id}
//         />
//       ))}
//     </Stack>
//   </>
// );
