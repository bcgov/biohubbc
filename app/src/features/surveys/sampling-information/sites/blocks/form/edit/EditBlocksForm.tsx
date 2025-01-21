import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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
import { IEditBlockFormData } from '../../edit/EditBlockPage';

/**
 * Edit a single survey block - map control
 *
 * @return {*}
 */
const EditBlocksForm = () => {
  const formikProps = useFormikContext<IEditBlockFormData>();

  const { handleSubmit, values, setFieldValue } = formikProps;
  const dialogContext = useDialogContext();

  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  const drawRef = createRef<IDrawControlsRef>();

  // Handle importing new shapes
  const handleImport = (features: Feature[]) => {
    const feature = features[0];
    const uuid = v4();

    setFieldValue('block', {
      ...feature,
      uuid,
      geojson: { ...feature, id: uuid },
      name: shapeFileFeatureName(feature) ?? '',
      description: shapeFileFeatureDesc(feature) ?? null
    });
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

    // When editing a block and a new geometry is drawn, only update the geojson and leaflet_id
    // to not overwrite the name and survey_block_id
    setFieldValue('block', { ...values.block, geojson: { ...feature, id: v4() }, leaflet_id: id });
  };

  // Handle editing existing shapes
  const handleEdit = (editedFeatures: Feature[]) => {
    const editedFeature = editedFeatures[0];
    setFieldValue('block', {
      ...values.block,
      geojson: editedFeature
    });
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
    const label = values.block?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <ImportDrawMapControl
          mapId="survey-block-map"
          label="Cluster"
          drawControlsRef={drawRef}
          features={values.block?.geojson ? [values.block.geojson] : []}
          handleImport={handleImport}
          handleImportFailure={handleImportFailure}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          handleFeatureSelect={handleFeatureSelect}
          tooltip={handleTooltip}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Block"
        />
      </Paper>

      {values.block && (
        <Box mt={3}>
          <CollapsibleCardList
            items={[
              {
                geojson: values.block.geojson ?? null,
                uuid: values.block.uuid ?? undefined,
                label: values.block.name
              }
            ]}
            selectedItems={selectedFeatures.map((feature) => ({
              geojson: feature,
              uuid: values.block.geojson?.id === feature.id ? values.block.uuid : undefined,
              label: values.block.name ?? ''
            }))}
            onSelectItem={(feature) => {
              feature.geojson && handleFeatureSelect(feature.geojson);
            }}
            onSelectAll={() => {}}
            hideToolbar
            renderCardContent={() => (
              <>
                <CustomTextField label="Name" name={`block.name`} />
                <Box mt={3}>
                  <CustomTextField
                    label="Description"
                    name={`block.description`}
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

export default EditBlocksForm;
