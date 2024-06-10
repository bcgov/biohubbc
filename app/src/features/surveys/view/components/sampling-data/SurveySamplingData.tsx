import { mdiArrowTopRight, mdiAutoFix, mdiMapMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import datagridOverlayImage from 'assets/images/sample-site-overlay.png';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IGetTechnique } from 'interfaces/useTechniqueApi.interface';
import { useContext, useEffect, useState } from 'react';
import { getCodesName } from 'utils/Utils';
import SurveySamplingToolbar, { SurveySamplingViewEnum } from './SurveySamplingToolbar';

export const SurveySamplingData = <T extends IGetTechnique>() => {
  const [activeView, setActiveView] = useState<SurveySamplingViewEnum>(SurveySamplingViewEnum.TECHNIQUES);

  const surveyContext = useContext(SurveyContext);
  const codesContext = useCodesContext();
  const { projectId, surveyId } = useContext(SurveyContext);

  const biohubApi = useBiohubApi();

  const samplingSitesDataLoader = useDataLoader(() => biohubApi.samplingSite.getSampleSites(projectId, surveyId));

  useEffect(() => {
    samplingSitesDataLoader.load();
  }, []);

  const rows =
    surveyContext.techniqueDataLoader.data?.techniques.map((technique) => ({
      id: technique.method_technique_id,
      method_lookup_id: technique.method_lookup_id,
      name: getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? '',
      description: technique.description
    })) || [];

  const columns: GridColDef<T>[] = [
    { field: 'name', headerName: 'Name', flex: 0.3 },
    {
      field: 'method_lookup_id',
      flex: 0.3,
      headerName: 'Method',
      renderCell: (params) => (
        <Box>
          <ColouredRectangleChip
            label={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', params.row.method_lookup_id) ?? ''}
            colour={blueGrey}
          />
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: (params) => {
        return (
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
        );
      }
    }
  ];

  return (
    <Paper>
      <SurveySamplingToolbar
        activeView={activeView}
        views={[
          {
            label: `Techniques (${surveyContext.techniqueDataLoader.data?.count})`,
            value: SurveySamplingViewEnum.TECHNIQUES,
            icon: mdiAutoFix,
            isLoading: false
          },
          {
            label: `Sites (${samplingSitesDataLoader.data?.sampleSites.length})`,
            value: SurveySamplingViewEnum.SITES,
            icon: mdiMapMarker,
            isLoading: false
          }
        ]}
        updateDatasetView={setActiveView}
      />

      <Divider />

      {/* <Box component="img" src={datagridOverlayImage} position="absolute" zIndex={999} /> */}
      <Box p={2} position="relative">
        {activeView === SurveySamplingViewEnum.TECHNIQUES && (
          //   <>
          //     {surveyContext.techniqueDataLoader.data?.techniques.map((technique) => (
          //       <Box key={technique.method_technique_id}>
          //         <SamplingTechniqueCard
          //           technique={technique}
          //           method_lookup_name={
          //             getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? ''
          //           }
          //         />
          //       </Box>
          //     ))}
          //   </>
          <Box position="relative">
            <StyledDataGrid
              rowSelection={false}
              autoHeight
              getRowHeight={() => 'auto'}
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              noRowsOverlay={
                <GridOverlay>
                  <Box component="img" src={datagridOverlayImage} position="absolute" width="700px" />
                  <Box justifyContent="center" display="flex" flexDirection="column">
                    <Typography mb={1} variant="h4" color="textSecondary" textAlign="center">
                      Start by adding sampling information&nbsp;
                      <Icon path={mdiArrowTopRight} size={1} />
                    </Typography>
                    <Typography color="textSecondary" textAlign="center">
                      Add techniques, then apply your techniques to sampling sites
                    </Typography>
                  </Box>
                </GridOverlay>
              }
              sx={{
                '& .MuiDataGrid-virtualScroller': {
                  height: rows.length === 0 ? '250px' : 'unset',
                  overflowY: 'auto !important'
                },
                '& .MuiDataGrid-overlay': {
                  height: '250px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            />
          </Box>
        )}

        {activeView === SurveySamplingViewEnum.SITES && <></>}
      </Box>
    </Paper>
  );
};
