import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AlertBar from 'components/alert/AlertBar';
import CollapsibleCardList from 'components/card/CollapsibleCardList';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { createRef, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ICreateBlockFormData } from '../../create/CreateBlockPage';

/**
 * Edit blocks - map control
 *
 * @return {*}
 */
const EditBlocksMapForm = () => {
  const formikProps = useFormikContext<ICreateBlockFormData>();
  const { handleSubmit, values, setFieldValue, errors } = formikProps;

  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  const drawRef = createRef<IDrawControlsRef>();

  // Handle importing new shapes
  const handleImport = (features: Feature[]) => {
    const feature = features[0];
    const uuid = v4();

    setFieldValue('blocks', [
      {
        ...feature,
        uuid,
        geojson: { ...feature, id: uuid },
        name: shapeFileFeatureName(feature) ?? '',
        description: shapeFileFeatureDesc(feature) ?? null
      }
    ]);
  };

  // Handle failure during import
  const handleImportFailure = () => {};

  // Handle adding a new shape
  const handleAdd = (feature: Feature, id: number) => {
    // Remove old map layers
    drawRef.current?.clearLayers();

    // When editing a block and a new geometry is drawn, only update the geojson and leaflet_id
    // to not overwrite the name and survey_block_id
    setFieldValue('blocks', [{ ...values.blocks[0], geojson: { ...feature, id: v4() }, leaflet_id: id }]);
  };

  // Handle editing existing shapes
  const handleEdit = (editedFeatures: Feature[]) => {
    const filteredFeatures = values.blocks.filter((block) =>
      editedFeatures.some((del) => del.id !== block.survey_block_id)
    );

    setFieldValue('blocks', [...filteredFeatures, editedFeatures]);
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

  const handleTooltip = (feature: Feature) => {
    const label = values.blocks.find((block) => block.uuid === feature.id)?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  return (
    <form onSubmit={handleSubmit}>
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
          handleFeatureSelect={handleFeatureSelect}
          tooltip={handleTooltip}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Blocks"
        />
      </Paper>

      {errors?.blocks && !Array.isArray(errors?.blocks) && (
        <AlertBar sx={{ mt: 3 }} severity="error" title={errors.blocks} variant="outlined" />
      )}

      {values.blocks.length > 0 && (
        <Box mt={3}>
          <CollapsibleCardList
            items={values.blocks.map((block) => ({
              geojson: block.geojson ?? null,
              uuid: block.uuid ?? undefined,
              label: block.name
            }))}
            selectedItems={selectedFeatures.map((feature) => ({
              geojson: feature,
              uuid: values.blocks.find((block) => block.geojson?.id === feature.id)?.uuid ?? undefined,
              label: values.blocks.find((block) => block.geojson?.id === feature.id)?.name ?? ''
            }))}
            onSelectItem={(feature) => {
              feature.geojson && handleFeatureSelect(feature.geojson);
            }}
            onSelectAll={handleFeatureSelectAll}
            hideToolbar
            renderCardContent={(_, index) => (
              <>
                <CustomTextField label="Name" name={`blocks[${index}].name`} />
                <Box mt={3}>
                  <CustomTextField
                    label="Description"
                    name={`blocks[${index}].description`}
                    other={{ rows: 2, multiline: true }}
                  />
                </Box>
              </>
            )}
          />
        </Box>
      )}
    </form>
  );
};

export default EditBlocksMapForm;
