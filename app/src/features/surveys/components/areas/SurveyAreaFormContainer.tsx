import { mdiArrowTopRight, mdiShapePolygonPlus, mdiTrashCanOutline, mdiViewGridPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import ToggleButtonToolbar, { IToggleButtonView } from 'components/toolbar/ToggleButtonToolbar';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { useFormikContext } from 'formik';
import { Feature, FeatureCollection } from 'geojson';
import L, { DrawEvents } from 'leaflet';
import { createRef, useState } from 'react';
import { v4 } from 'uuid';
import { ISurveyBlock } from './blocks/form/SurveyBlocksForm';
import { SurveyBlocksList } from './blocks/view/SurveyBlocksList';
import { ISurveyLocation } from './locations/form/SurveyLocationsForm';
import SurveyLocationsList from './locations/view/SurveyLocationsList';
import { SurveyAreaMapControl } from './map/SurveyAreaMapControl';

enum StudyAreaViewEnum {
  BOUNDS = 'BOUNDS',
  BLOCKS = 'BLOCKS'
}

export interface ISurveyLocationForm {
  locations: ISurveyLocation[];
  blocks: ISurveyBlock[];
}

export const SurveyLocationInitialValues = {
  locations: [],
  blocks: []
};

const SurveyAreaFormContainer = () => {
  const formikProps = useFormikContext<ISurveyLocationForm>();
  const { errors, setFieldValue, values } = formikProps;

  // Map ref
  const drawBoundsRef = createRef<IDrawControlsRef>();
  const drawBlocksRef = createRef<IDrawControlsRef>();

  // Dialog states
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false);

  // Active view state
  const [activeView, setActiveView] = useState<StudyAreaViewEnum>(StudyAreaViewEnum.BOUNDS);

  const [checkboxSelectedBlockIds, setCheckboxSelectedBlockIds] = useState<number[]>([]);
  const [checkboxSelectedLocationIds, setCheckboxSelectedLocationIds] = useState<number[]>([]);

  const views: IToggleButtonView<StudyAreaViewEnum>[] = [
    { label: 'Bounds', count: values.locations.length, value: StudyAreaViewEnum.BOUNDS, icon: mdiShapePolygonPlus },
    { label: 'Blocks', count: values.blocks.length, value: StudyAreaViewEnum.BLOCKS, icon: mdiViewGridPlus }
  ];

  const handleDeleteAll = () => {
    // Close the dialog
    setIsDeleteAllOpen(false);


    // Use Draw Ref to remove editable layers from the map
    values.locations.forEach((item) => {
      console.log(item.leaflet_id)
      if (item.leaflet_id) {
        drawBoundsRef.current?.deleteLayer(item.leaflet_id);
      }
    });
    // Use Draw Ref to remove editable layers from the map
    values.blocks.forEach((item) => {
      if (item.leaflet_id) {
        drawBlocksRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    setFieldValue('locations', []);
    setFieldValue('blocks', []);
  };

  const handleDeleteBlock = (currentIndex: number) => {
    const updatedBlocks = values.blocks.filter((_, index) => index !== currentIndex);
    const blockData = values.blocks.splice(currentIndex, 1);

    // Use Draw Ref to remove editable layer from the map
    blockData.forEach((item) => {
      if (item.leaflet_id) {
        drawBlocksRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    setFieldValue('blocks', updatedBlocks);
  };

  const handleDeleteBoundary = (currentIndex: number) => {
    const updatedBounds = values.locations.filter((_, index) => index !== currentIndex);
    const boundData = values.locations.splice(currentIndex, 1);

    // Use Draw Ref to remove editable layer from the map
    boundData.forEach((item) => {
      if (item.leaflet_id) {
        drawBoundsRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    setFieldValue('locations', updatedBounds);
  };

  const handleDeleteSelected = () => {
    setIsDeleteSelectedOpen(false);

    const updatedBounds = values.locations.filter((_, index) => !checkboxSelectedLocationIds.includes(index));
    const updatedBlocks = values.locations.filter((_, index) => !checkboxSelectedBlockIds.includes(index));

    // Combine the selected locations and blocks for deletion
    const selectedLocationsForDeletion = values.locations.filter((_, index) =>
      checkboxSelectedLocationIds.includes(index)
    );
    const selectedBlocksForDeletion = values.blocks.filter((_, index) => checkboxSelectedBlockIds.includes(index));

    // Use Draw Ref to remove editable layers from the map
    selectedLocationsForDeletion.forEach((item) => {
      if (item.leaflet_id) {
        drawBoundsRef.current?.deleteLayer(item.leaflet_id);
      }
    });
    // Use Draw Ref to remove editable layers from the map
    selectedBlocksForDeletion.forEach((item) => {
      if (item.leaflet_id) {
        drawBlocksRef.current?.deleteLayer(item.leaflet_id);
      }
    });

    // Update formik values
    setFieldValue('locations', updatedBounds);
    setFieldValue('blocks', updatedBlocks);

    // Clear state
    setCheckboxSelectedBlockIds([]);
    setCheckboxSelectedLocationIds([]);
  };

  // Separate handler functions for blocks and locations
  const onLayerAddBlock = (event: DrawEvents.Created, id: number) => {
    const feature: Feature = event.layer.toGeoJSON();
    if (feature.properties) {
      feature.properties.layer_id = id;
    }

    const newBlock: ISurveyBlock = {
      name: `Block ${id}`,
      description: '',
      geojson: [feature],
      revision_count: 0,
      leaflet_id: id,
      uuid: v4()
    };

    setFieldValue('blocks', [...values.blocks, newBlock]);
  };

  const onLayerAddLocation = (event: DrawEvents.Created, id: number) => {
    const feature: Feature = event.layer.toGeoJSON();
    if (feature.properties) {
      feature.properties.layer_id = id;
    }

    const newLocation: ISurveyLocation = {
      name: `Survey Area ${id}`,
      description: '',
      geojson: [feature],
      revision_count: 0,
      leaflet_id: id,
      uuid: v4()
    };

    setFieldValue('locations', [...values.locations, newLocation]);
  };

  const onLayerEditBlock = (event: DrawEvents.Edited) => {
    event.layers.getLayers().forEach((item) => {
      const layer_id = L.stamp(item);
      const featureCollection = L.layerGroup([item]).toGeoJSON() as FeatureCollection;

      const updatedBlocks = values.blocks.map((block) => {
        if (block.leaflet_id === layer_id) {
          block.geojson = [...featureCollection.features];
        }
        return block;
      });

      setFieldValue('blocks', updatedBlocks);
    });
  };

  const onLayerEditLocation = (event: DrawEvents.Edited) => {
    event.layers.getLayers().forEach((item) => {
      const layer_id = L.stamp(item);
      const featureCollection = L.layerGroup([item]).toGeoJSON() as FeatureCollection;

      const updatedLocations = values.locations.map((location) => {
        if (location.leaflet_id === layer_id) {
          location.geojson = [...featureCollection.features];
        }
        return location;
      });

      setFieldValue('locations', updatedLocations);
    });
  };

  const onLayerDeleteBlock = (event: DrawEvents.Deleted) => {
    let updatedBlocks = values.blocks;
    event.layers.getLayers().forEach((item) => {
      const layer_id = L.stamp(item);
      updatedBlocks = updatedBlocks.filter((block) => block.leaflet_id !== layer_id);
    });
    setFieldValue('blocks', updatedBlocks);
  };

  const onLayerDeleteLocation = (event: DrawEvents.Deleted) => {
    let updatedLocations = values.locations;
    event.layers.getLayers().forEach((item) => {
      const layer_id = L.stamp(item);
      updatedLocations = updatedLocations.filter((location) => location.leaflet_id !== layer_id);
    });
    setFieldValue('locations', updatedLocations);
  };

  return (
    <form onSubmit={formikProps.handleSubmit}>
      {/* Formik errors */}
      {errors.locations && !Array.isArray(errors?.locations) && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>Missing survey area</AlertTitle>
          {errors.locations}
        </Alert>
      )}

      <Stack gap={3}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {/* Leaflet map */}
          <SurveyAreaMapControl
            map_id={'study_area_map'}
            formik_props={formikProps}
            draw_controls_bounds_ref={drawBoundsRef}
            draw_controls_blocks_ref={drawBlocksRef}
            toggle_delete_dialog={setIsDeleteAllOpen}
            onLayerAdd={(event: DrawEvents.Created, id: number) => {
              if (activeView === StudyAreaViewEnum.BOUNDS) {
                onLayerAddLocation(event, id);
              } else if (activeView === StudyAreaViewEnum.BLOCKS) {
                onLayerAddBlock(event, id);
              }
            }}
            onLayerEdit={(event: DrawEvents.Edited) => {
              if (activeView === StudyAreaViewEnum.BOUNDS) {
                onLayerEditLocation(event);
              } else if (activeView === StudyAreaViewEnum.BLOCKS) {
                onLayerEditBlock(event);
              }
            }}
            onLayerDelete={(event: DrawEvents.Deleted) => {
              if (activeView === StudyAreaViewEnum.BOUNDS) {
                onLayerDeleteLocation(event);
              } else if (activeView === StudyAreaViewEnum.BLOCKS) {
                onLayerDeleteBlock(event);
              }
            }}
            onSelectGeometry={(geo: Feature, layerName: string) => {
              const region: ISurveyLocation = {
                name: layerName,
                description: '',
                geojson: [geo],
                revision_count: 0,
                uuid: v4()
              };

              if (activeView === StudyAreaViewEnum.BOUNDS) {
                setFieldValue('locations', [...values.locations, region]);
              } else if (activeView === StudyAreaViewEnum.BLOCKS) {
                setFieldValue('blocks', [...values.blocks, region]);
              }
            }}
            drawStyle={{
              blocks: {
                fillColor: SURVEY_MAP_LAYER_COLOURS.BLOCKS_COLOUR,
                color: SURVEY_MAP_LAYER_COLOURS.BLOCKS_COLOUR
              },
              bounds: {
                fillColor: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
                color: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR
              }
            }}
          />

          {/* Toggle buttons for views */}
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <ToggleButtonToolbar
              activeView={activeView}
              views={views}
              updateDatasetView={(view) => setActiveView(view)}
            />
            <Box ml={1}>
              <Button
                color="primary"
                variant="outlined"
                data-testid="boundary_remove-all"
                disabled={
                  (activeView === StudyAreaViewEnum.BLOCKS && checkboxSelectedBlockIds.length === 0) ||
                  (activeView === StudyAreaViewEnum.BOUNDS && checkboxSelectedLocationIds.length === 0)
                }
                startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                onClick={() => {
                  setIsDeleteSelectedOpen(true);
                }}
                aria-label="Remove all survey areas">
                Remove Selected
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Existing bounds and blocks*/}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {activeView === StudyAreaViewEnum.BOUNDS && (
              <>
                {values.locations.length > 0 ? (
                  <SurveyLocationsList
                    handleDelete={handleDeleteBoundary}
                    handleCheckboxChange={(indices: number[]) => {
                      setCheckboxSelectedLocationIds((prev) => {
                        const updatedSelection = new Set(prev);

                        indices.forEach((index) => {
                          if (updatedSelection.has(index)) {
                            updatedSelection.delete(index); // Remove if already selected
                          } else {
                            updatedSelection.add(index); // Add if not selected
                          }
                        });

                        return Array.from(updatedSelection); // Convert back to array
                      });
                    }}
                    checkboxSelectedIds={checkboxSelectedLocationIds}
                  />
                ) : (
                  <Box minHeight="150px" display="flex" alignItems="center" justifyContent="center">
                    <NoDataOverlay
                      title="Add Bounds"
                      subtitle="Add bounds showing your area of interest"
                      icon={mdiArrowTopRight}
                    />
                  </Box>
                )}
              </>
            )}

            {activeView === StudyAreaViewEnum.BLOCKS && (
              <>
                {values.blocks.length > 0 ? (
                  <SurveyBlocksList
                    handleDelete={handleDeleteBlock}
                    handleCheckboxChange={(indices: number[]) => {
                      setCheckboxSelectedBlockIds((prev) => {
                        const updatedSelection = new Set(prev);

                        indices.forEach((index) => {
                          if (updatedSelection.has(index)) {
                            updatedSelection.delete(index); // Remove if already selected
                          } else {
                            updatedSelection.add(index); // Add if not selected
                          }
                        });

                        return Array.from(updatedSelection); // Convert back to array
                      });
                    }}
                    checkboxSelectedIds={checkboxSelectedBlockIds}
                  />
                ) : (
                  <Box minHeight="150px" display="flex" alignItems="center" justifyContent="center">
                    <NoDataOverlay
                      title="Add Blocks"
                      subtitle="Add spatial blocks that were sampled"
                      icon={mdiArrowTopRight}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Confirmation dialog for deleting all bounds and blocks */}
      <YesNoDialog
        dialogTitle={`Remove all bounds and blocks?`}
        dialogText="Are you sure you want to remove all bounds? This will remove any associations to sampling sites."
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Remove All'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={isDeleteAllOpen}
        onYes={handleDeleteAll}
        onClose={() => setIsDeleteAllOpen(false)}
        onNo={() => setIsDeleteAllOpen(false)}
      />

      {/* Confirmation dialog for deleting selected bounds and blocks */}
      <YesNoDialog
        dialogTitle={`Remove selected ${activeView.toLowerCase()}?`}
        dialogText={`Are you sure you want to remove selected ${activeView.toLowerCase()}? This will remove any associations to sampling sites.`}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Remove Selected'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={isDeleteSelectedOpen}
        onYes={handleDeleteSelected}
        onClose={() => setIsDeleteSelectedOpen(false)}
        onNo={() => setIsDeleteSelectedOpen(false)}
      />
    </form>
  );
};

export default SurveyAreaFormContainer;
