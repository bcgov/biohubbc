import { mdiShapePolygonPlus, mdiViewGridPlus } from '@mdi/js';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import ToggleButtonToolbar, { IToggleButtonView } from 'components/toolbar/ToggleButtonToolbar';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { DrawEvents } from 'leaflet';
import { createRef, useState } from 'react';
import { v4 } from 'uuid';
import { ISurveyBlock } from './blocks/form/SurveyBlocksForm';
import { SurveyBlocksList } from './blocks/view/SurveyBlocksList';
import { ISurveyBound } from './bounds/form/SurveyBoundsForm';
import { SurveyBoundsList } from './bounds/view/SurveyBoundsList';
import { SurveyAreaMapControl } from './map/SurveyAreaMapControl';

enum StudyAreaViewEnum {
  BOUNDS = 'BOUNDS',
  BLOCKS = 'BLOCKS'
}

export interface ISurveyLocationForm {
  bounds: ISurveyBound[];
  blocks: ISurveyBlock[];
}

export const SurveyLocationInitialValues = {
  bounds: [],
  blocks: []
};

const SurveyAreaFormContainer = () => {
  const formikProps = useFormikContext<ISurveyLocationForm>();
  const { errors, setFieldValue, values } = formikProps;

  // Map ref
  const drawRef = createRef<IDrawControlsRef>();

  // Dialog states
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  // Active view state
  const [activeView, setActiveView] = useState<StudyAreaViewEnum>(StudyAreaViewEnum.BOUNDS);

  const views: IToggleButtonView<StudyAreaViewEnum>[] = [
    { label: 'Bounds', count: values.bounds.length, value: StudyAreaViewEnum.BOUNDS, icon: mdiShapePolygonPlus },
    { label: 'Blocks', count: values.blocks.length, value: StudyAreaViewEnum.BLOCKS, icon: mdiViewGridPlus }
  ];

  const handleDeleteAll = () => {
    // Close the dialog
    setIsDeleteAllOpen(false);

    // Use Draw Ref to remove editable layers from the map
    values.bounds.forEach((item) => {
      if (item.leaflet_id) {
        drawRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    // set field to an empty array
    setFieldValue('bounds', []);
    setFieldValue('blocks', []);
  };

  const handleDeleteBlock = (currentIndex: number) => {
    const updatedBlocks = values.blocks.filter((_, index) => index !== currentIndex);
    console.log('updated', updatedBlocks);
    setFieldValue('blocks', updatedBlocks);
  };

  const handleDeleteBoundary = (currentIndex: number) => {
    const updatedBounds = values.bounds.filter((_, index) => index !== currentIndex);
    setFieldValue('bounds', updatedBounds);
  };

  return (
    <form onSubmit={formikProps.handleSubmit}>
      {/* Formik errors */}
      {errors.bounds && !Array.isArray(errors?.bounds) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Missing study area</AlertTitle>
          {errors.bounds}
        </Alert>
      )}

      <Stack gap={3}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Divider />
          {/* Leaflet map */}
          <SurveyAreaMapControl
            map_id={'study_area_map'}
            formik_props={formikProps}
            draw_controls_ref={drawRef}
            toggle_delete_dialog={setIsDeleteAllOpen}
            label="Survey Area"
            onLayerAdd={(event: DrawEvents.Created, id: number) => {
              const feature: Feature = event.layer.toGeoJSON();
              if (feature.properties) {
                feature.properties.layer_id = id;
              }

              const label = activeView === StudyAreaViewEnum.BLOCKS ? 'Block' : 'Bound';

              const newFeature: ISurveyBound | ISurveyBlock = {
                name: `Drawn ${label} ${id}`,
                description: '',
                geojson: [feature],
                revision_count: 0,
                leaflet_id: id,
                uuid: v4()
              };

              // ADD LAYER TO BOUNDS IF BOUNDS IS SELECTED
              if (activeView === StudyAreaViewEnum.BOUNDS) {
                setFieldValue('bounds', [...values.bounds, newFeature]);
              }
              // ADD LAYER TO BLOCKS IF BLOCKS IS SELECTED
              if (activeView === StudyAreaViewEnum.BLOCKS) {
                setFieldValue('blocks', [...values.blocks, newFeature]);
              }
            }}
            onSelectGeometry={(geo: Feature, layerName: string) => {
              const region: ISurveyBound = {
                name: layerName,
                description: '',
                geojson: [geo],
                revision_count: 0,
                uuid: v4()
              };
              // ADD LAYER TO BOUNDS IF BOUNDS IS SELECTED
              if (activeView === StudyAreaViewEnum.BOUNDS) {
                setFieldValue('bounds', [...values.bounds, region]);
              }
              // ADD LAYER TO BLOCKS IF BLOCKS IS SELECTED
              if (activeView === StudyAreaViewEnum.BLOCKS) {
                setFieldValue('blocks', [...values.blocks, region]);
              }
            }}
          />

          {/* Toggle buttons for views */}
          <Box p={2}>
            <ToggleButtonToolbar
              activeView={activeView}
              views={views}
              updateDatasetView={(view) => setActiveView(view)}
            />
          </Box>

          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {/* Existing bounds */}
            {activeView === StudyAreaViewEnum.BOUNDS && values.bounds.length > 0 && (
              <>
                <Divider />
                <SurveyBoundsList handleDelete={handleDeleteBoundary} />
              </>
            )}

            {/* Existing blocks */}
            {activeView === StudyAreaViewEnum.BLOCKS && values.blocks.length > 0 && (
              <>
                <Divider />
                <SurveyBlocksList handleDelete={handleDeleteBlock} />
              </>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Confirmation dialog for deleting bounds */}
      <YesNoDialog
        dialogTitle={`Remove all bounds and blocks?`}
        dialogText="Are you sure you want to remove all bounds?"
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Remove All'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={isDeleteAllOpen}
        onYes={handleDeleteAll}
        onClose={() => setIsDeleteAllOpen(false)}
        onNo={() => setIsDeleteAllOpen(false)}
      />
    </form>
  );
};

export default SurveyAreaFormContainer;
