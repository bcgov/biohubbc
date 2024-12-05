import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import blue from '@mui/material/colors/blue';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { createRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { ICreateBlockFormData } from '../../create/CreateBlocksPage';

export interface IBlockData {
  survey_block_id: number | null;
  name: string;
  description: string;
  geojson?: Feature;
  // This is an id meant for the front end only. This is is set if the geojson was drawn by the user (on the leaflet map) vs imported (file upload or region selector)
  // Locations drawn by the user should be editable in the leaflet map using the draw tools available
  // Any uploaded or selected regions should not be editable and be placed in the 'static' layer on the map
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}

export const SurveyBlockInitialValues = { blocks: [] };

export const SurveyLocationDetailsYupSchema = yup.object({
  name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
  description: yup.string().max(250, 'Description cannot exceed 250 characters').default('')
});

export const SurveyLocationYupSchema = yup.object({
  locations: yup
    .array(
      yup.object({
        name: yup.string().max(100, 'Name cannot exceed 100 characters').required('Name is Required'),
        description: yup.string().max(250, 'Description cannot exceed 250 characters').default(''),
        geojson: yup.array().min(1, 'A geometry is required').required('A geometry is required')
      })
    )
    .min(1, 'At least one feature or boundary is required for a survey study area.')
});

/**
 * Create blocks - map control
 *
 * @return {*}
 */
const BlocksMapForm = () => {
  const formikProps = useFormikContext<ICreateBlockFormData>();
  const { handleSubmit, values, setFieldValue } = formikProps;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [collapsedIndexes, setCollapsedIndexes] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setCollapsedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const drawRef = createRef<IDrawControlsRef>();

  const onDeleteAll = () => {
    // Use Draw Ref to remove editable layers from the map
    values.blocks.forEach((item) => {
      if (item.leaflet_id) {
        drawRef.current?.clearLayers();
      }
    });

    // set field to an empty array
    setFieldValue('blocks', []);
    setSelectedFeatures([]);
  };

  // Handle importing new shapes
  const handleImport = (features: Feature[]) => {
    setFieldValue('blocks', [
      ...values.blocks,
      ...features.map((feature) => {
        const uuid = v4();

        return {
          ...feature,
          uuid,
          geojson: { ...feature, id: uuid },
          name: shapeFileFeatureName(feature) ?? '',
          description: shapeFileFeatureDesc(feature) ?? ''
        };
      })
    ]);
  };

  // Handle failure during import
  const handleImportFailure = () => {};

  // Handle adding a new shape
  const handleAdd = (feature: Feature, id: number) => {
    // UUID is the key used to join map layers with their corresponding formik data
    const uuid = v4();

    setFieldValue('blocks', [
      ...values.blocks,
      { name: '', description: '', uuid, leaflet_id: id, geojson: { ...feature, id: uuid } }
    ]);
  };

  // Handle editing existing shapes
  const handleEdit = (editedFeatures: Feature[]) => {
    const filteredFeatures = values.blocks.filter((block) =>
      editedFeatures.some((del) => del.id !== block.survey_block_id)
    );

    setFieldValue('blocks', [...filteredFeatures, editedFeatures]);
  };

  const handleDelete = (deletedFeatures: Feature[]) => {
    // Remove deleted features from 'blocks' array
    const filteredBlocks = values.blocks.filter((block) => !deletedFeatures.some((del) => del.id === block.uuid));
    setFieldValue('blocks', filteredBlocks);

    // Use Draw Ref to remove editable layers from the map
    deletedFeatures.forEach((deletedFeature) => {
      const blockToDelete = values.blocks.find((block) => block.uuid === deletedFeature.id);
      if (blockToDelete?.leaflet_id) {
        drawRef.current?.deleteLayer(blockToDelete.leaflet_id);
      }
    });

    // Remove deleted features from selected features
    setSelectedFeatures((prevSelected) =>
      prevSelected.filter(
        (selected) => !deletedFeatures.some((del) => del.id === selected.id) // Remove selected features that are deleted
      )
    );
  };

  // Handle deleting shapes
  const handleDeleteAll = () => {
    setIsDeleteOpen(true);
  };

  const handleFeatureSelect = (feature: Feature) => {
    if (selectedFeatures.some((selectedFeature) => selectedFeature.id === feature.id)) {
      // Unselect the feature by filtering it out
      const filteredFeatures = selectedFeatures.filter((selectedFeature) => selectedFeature.id !== feature.id);
      setSelectedFeatures(filteredFeatures);
    } else {
      // Add the feature to the selected list
      setSelectedFeatures((prev) => [...prev, feature]);
    }
  };

  const handleFeatureSelectAll = () => {
    const allSelected = values.blocks.every(
      (block) => block.geojson && selectedFeatures.some((feature) => feature.id === block.uuid)
    );

    if (allSelected) {
      // Deselect all
      setSelectedFeatures([]);
    } else {
      // Select all
      setSelectedFeatures(values.blocks.filter((block) => block.geojson).map((block) => block.geojson!));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <YesNoDialog
        dialogTitle={`Remove all clusters?`}
        dialogText="Are you sure you want to remove all clusters?"
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Remove All'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={isDeleteOpen}
        onYes={() => {
          setIsDeleteOpen(false);
          onDeleteAll();
        }}
        onClose={() => setIsDeleteOpen(false)}
        onNo={() => setIsDeleteOpen(false)}
      />

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <ImportDrawMapControl
          mapId="survey-blocks-map"
          label="Clusters"
          drawControlsRef={drawRef}
          features={values.blocks.filter((block) => block.geojson).map((block) => block.geojson!)}
          handleImport={handleImport}
          handleImportFailure={handleImportFailure}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleDeleteAll={handleDeleteAll}
          handleFeatureSelect={handleFeatureSelect}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Blocks"
        />
      </Paper>

      {values.blocks.length > 0 && (
        <>
          {/* Action Buttons */}
          <Box
            display="flex"
            justifyContent="justifyContent"
            mb={2}
            mt={3}
            sx={{ '& .MuiButton-root': { bgcolor: grey[50], color: grey[700] } }}>
            <Box display="flex" alignItems="center" flex="1 1 auto">
              <Button variant="text" onClick={handleFeatureSelectAll}>
                <Checkbox
                  color="primary"
                  sx={{ p: 0, left: 0, mr: 1 }}
                  checked={
                    selectedFeatures.length === values.blocks.length
                      ? selectedFeatures.every((feature) => values.blocks.some((block) => feature.id === block.uuid))
                      : false
                  }
                />
                Select All
              </Button>
            </Box>
            <Stack gap={1} flexDirection="row">
              <Button variant="text" onClick={() => setCollapsedIndexes([])}>
                Expand All
              </Button>
              <Button variant="text" onClick={() => setCollapsedIndexes(values.blocks.map((_, idx) => idx))}>
                Collapse All
              </Button>
            </Stack>
          </Box>

          {/* List of Blocks */}
          <TransitionGroup>
            {values.blocks.map((block, index) => (
              <Collapse key={block.uuid} in>
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: selectedFeatures.some((feature) => feature.id === block.uuid) ? blue[50] : grey[50]
                  }}
                  variant="outlined">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => {
                      toggleExpand(index);
                    }}
                    sx={{ cursor: 'pointer' }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        color="primary"
                        checked={selectedFeatures.some((feature) => feature.id === block.uuid) || false}
                        onClick={(event) => {
                          if (block.geojson) {
                            handleFeatureSelect(block.geojson);
                          }
                          event.stopPropagation();
                        }}
                      />
                      <Typography fontWeight={700}>{block.name || `Cluster ${index + 1}`}</Typography>
                    </Box>

                    {/* Expand/Collapse and Delete */}
                    <Box>
                      <IconButton color="primary">
                        <Icon path={collapsedIndexes.includes(index) ? mdiChevronDown : mdiChevronUp} size={1} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expandable Section */}
                  <Collapse in={!collapsedIndexes.includes(index)} unmountOnExit>
                    <Box mt={3}>
                      <CustomTextField label="Name" name={`blocks[${index}].name`} />
                    </Box>
                    <Box mt={3}>
                      <CustomTextField
                        label="Description"
                        name={`blocks[${index}].description`}
                        other={{ rows: 2, multiline: true }}
                      />
                    </Box>
                  </Collapse>
                </Paper>
              </Collapse>
            ))}
          </TransitionGroup>
        </>
      )}
    </form>
  );
};

export default BlocksMapForm;
