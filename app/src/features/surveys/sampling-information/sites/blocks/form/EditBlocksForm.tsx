import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CollapsibleCardList from 'components/card/CollapsibleCardList';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { EditBlockI18N } from 'constants/i18n';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { createRef, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ICreateSampleSiteFormData } from '../../create/CreateSamplingSitePage.interface';
import { SamplingBlockForm } from './sample-site/SamplingSiteBlockForm';

/**
 * Edit multiple survey blocks - map control
 *
 * @return {*}
 */
const EditBlocksForm = () => {
  const formikProps = useFormikContext<ICreateSampleSiteFormData>();

  const { handleSubmit, values, setFieldValue } = formikProps;
  const dialogContext = useDialogContext();

  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const drawRef = createRef<IDrawControlsRef>();

  // Handle importing new shapes
  const handleImport = (features: Feature[]) => {
    const feature = features[0];
    const assignment_id = v4();

    // Add the new block to the array
    setFieldValue('blocks', [
      ...values.blocks,
      {
        ...feature,
        assignment_id,
        geojson: { ...feature, id: assignment_id },
        name: shapeFileFeatureName(feature) ?? '',
        description: shapeFileFeatureDesc(feature) ?? null
      }
    ]);
  };

  // Display error dialog when import fails
  const handleImportFailure = () => {
    dialogContext.setErrorDialog({
      dialogTitle: EditBlockI18N.importErrorTitle,
      dialogText: EditBlockI18N.importErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      open: true
    });
  };

  // Handle adding a new shape
  const handleAdd = (feature: Feature, id: number) => {
    // Remove old map layers
    drawRef.current?.clearLayers();

    // Add a new block to the blocks array
    setFieldValue('blocks', [
      ...values.blocks,
      { geojson: { ...feature, id: v4() }, leaflet_id: id, assignment_id: v4() }
    ]);
  };

  // Handle editing existing shapes
  const handleEdit = (editedFeatures: Feature[]) => {
    const editedFeature = editedFeatures[0];
    const updatedBlocks = values.blocks.map((block) =>
      block.geojson?.id === editedFeature.id ? { ...block, geojson: editedFeature } : block
    );
    setFieldValue('blocks', updatedBlocks);
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

  const handleTooltip = (feature: Feature) => {
    const block = values.blocks.find((block) => block.geojson?.id === feature.id);
    const label = block?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  const features = values.blocks.map((block) => block.geojson).filter((block) => block !== undefined && block !== null);

  console.log('values', values);

  return (
    <form onSubmit={handleSubmit}>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <ImportDrawMapControl
          mapId="survey-block-map"
          label="Clusters"
          drawControlsRef={drawRef}
          features={features.length ? features : []}
          handleImport={handleImport}
          handleImportFailure={handleImportFailure}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          handleFeatureSelect={handleFeatureSelect}
          tooltip={handleTooltip}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Cluster"
        />
      </Paper>

      {values.blocks && values.blocks.length > 0 && (
        <Box mt={3}>
          <CollapsibleCardList
            items={values.blocks.map((block) => ({
              geojson: block.geojson ?? null,
              assignment_id: block.assignment_id ?? undefined,
              label: block.name ?? 'Block 1'
            }))}
            selectedItems={selectedFeatures.map((feature) => ({
              geojson: feature,
              assignment_id: values.blocks.find((block) => block.geojson?.id === feature.id)?.assignment_id ?? '',
              label: values.blocks.find((block) => block.geojson?.id === feature.id)?.name ?? ''
            }))}
            onSelectItem={(feature) => {
              feature.geojson && handleFeatureSelect(feature.geojson);
            }}
            onSelectAll={() => {}}
            hideToolbar
            renderCardContent={(block, index) => (
              <Stack gap={3}>
                <CustomTextField label="Name" name={`blocks[${index}].name`} />
                <Box mt={3}>
                  <CustomTextField
                    label="Description"
                    name={`blocks[${index}].description`}
                    other={{ rows: 2, multiline: true }}
                  />
                </Box>
                <Box mt={3}>
                  <SamplingBlockForm assignment_id={block.assignment_id} sites={values.survey_sample_sites} />
                </Box>
              </Stack>
            )}
          />
        </Box>
      )}
    </form>
  );
};

export default EditBlocksForm;
