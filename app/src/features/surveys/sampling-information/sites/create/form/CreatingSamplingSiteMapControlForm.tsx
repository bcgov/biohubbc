import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/system/Stack';
import AlertBar from 'components/alert/AlertBar';
import CollapsibleCardList from 'components/card/CollapsibleCardList';
import YesNoDialog from 'components/dialog/YesNoDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { CreateBlockI18N } from 'constants/i18n';
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/components/site-groupings/SamplingBlockForm';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { createRef, useMemo, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ICreateSampleSiteFormData } from '../CreateSamplingSitePage';

interface ICreateSamplingSiteMapControlFormProps {
  /**
   * The number of sites in the survey, used for generating unique names of new sites
   * eg. If the survey has 10 sites, the next site name will default to "Cluster 11".
   */
  siteCount?: number;
}

export const SamplingSiteInitialValues = { survey_sample_sites: [] };

/**
 * Create survey_sample_sites - map control
 *
 * @return {*}
 */
const CreateSamplingSiteMapControlForm = (props: ICreateSamplingSiteMapControlFormProps) => {
  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const dialogContext = useDialogContext();

  const { handleSubmit, values, setFieldValue, errors, setFieldError } = formikProps;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  const drawRef = createRef<IDrawControlsRef>();

  const onDeleteAll = () => {
    // Use Draw Ref to remove editable layers from the map
    values.survey_sample_sites.forEach((item) => {
      if (item.leaflet_id) {
        drawRef.current?.clearLayers();
      }
    });

    // set field to an empty array
    setFieldValue('survey_sample_sites', []);
    setSelectedFeatures([]);
    setFieldError('survey_sample_sites', undefined);
  };

  // Handle importing new shapes
  const handleImport = (features: Feature[]) => {
    setFieldValue('survey_sample_sites', [
      ...values.survey_sample_sites,
      ...features.map((feature) => {
        const uuid = v4();

        return {
          ...feature,
          uuid,
          geojson: { ...feature, id: uuid },
          name: shapeFileFeatureName(feature) ?? '',
          description: shapeFileFeatureDesc(feature) ?? null
        };
      })
    ]);
  };

  // Display error dialog when import fails
  const handleImportFailure = () => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateBlockI18N.importErrorTitle,
      dialogText: CreateBlockI18N.importErrorText,
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
    const uuid = v4();

    // Generate the site number, ensuring uniqueness
    let siteNumber = values.survey_sample_sites.length + 1;
    if (props.siteCount) {
      siteNumber += props.siteCount;
    }

    const newSite = {
      name: `Site ${siteNumber}`,
      description: null,
      uuid,
      leaflet_id: id,
      geojson: { ...feature, id: uuid },
      blocks: [],
      stratums: []
    };

    // Only add the new site and preserve existing sites
    setFieldValue('survey_sample_sites', [...values.survey_sample_sites, newSite]);
  };

  // Handle editing existing shapes
  const handleEdit = (editedFeatures: Feature[]) => {
    const filteredFeatures = values.survey_sample_sites.filter((block) =>
      editedFeatures.some((del) => del.id !== block.uuid)
    );

    setFieldValue('survey_sample_sites', [...filteredFeatures, editedFeatures]);
  };

  const handleDelete = (deletedFeatures: Feature[]) => {
    // Remove deleted features from 'survey_sample_sites' array
    const filteredBlocks = values.survey_sample_sites.filter(
      (block) => !deletedFeatures.some((del) => del.id === block.uuid)
    );
    setFieldValue('survey_sample_sites', filteredBlocks);
    setFieldError('survey_sample_sites', undefined);

    // Use Draw Ref to remove editable layers from the map
    deletedFeatures.forEach((deletedFeature) => {
      const blockToDelete = values.survey_sample_sites.find((block) => block.uuid === deletedFeature.id);
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
    const allSelected = values.survey_sample_sites.every(
      (block) => block.geojson && selectedFeatures.some((feature) => feature.id === block.uuid)
    );

    if (allSelected) {
      // Deselect all
      setSelectedFeatures([]);
    } else {
      // Select all
      setSelectedFeatures(values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!));
    }
  };

  const handleTooltip = (feature: Feature) => {
    const label = values.survey_sample_sites.find((block) => block.uuid === feature.id)?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  // useMemo to prevent map zoom from changing when a feature is selected
  const features = useMemo(
    () => values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!),
    [values.survey_sample_sites]
  );

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
          mapId="survey-survey_sample_sites-map"
          label="Sites"
          drawControlsRef={drawRef}
          features={features}
          handleImport={handleImport}
          handleImportFailure={handleImportFailure}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleFeatureSelect={handleFeatureSelect}
          tooltip={handleTooltip}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Sites"
        />
      </Paper>

      {errors?.survey_sample_sites && !Array.isArray(errors?.survey_sample_sites) && (
        <AlertBar
          sx={{ mt: 3 }}
          severity="error"
          title={errors.survey_sample_sites}
          variant="outlined"
          text={errors.survey_sample_sites}
        />
      )}

      <Box mt={3}>
        <CollapsibleCardList
          items={values.survey_sample_sites.map((block) => ({
            geojson: block.geojson ?? null,
            uuid: block.uuid ?? undefined,
            label: block.name
          }))}
          selectedItems={selectedFeatures.map((feature) => ({
            geojson: feature,
            uuid: values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.uuid ?? undefined,
            label: values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.name ?? ''
          }))}
          onSelectItem={(feature) => {
            feature.geojson && handleFeatureSelect(feature.geojson);
          }}
          onSelectAll={handleFeatureSelectAll}
          renderCardContent={(_, index) => (
            <Stack gap={3}>
              <CustomTextField label="Name" name={`survey_sample_sites[${index}].name`} />
              <CustomTextField
                label="Description"
                name={`survey_sample_sites[${index}].description`}
                other={{ rows: 2, multiline: true }}
              />
              <SamplingBlockForm />
            </Stack>
          )}
        />
      </Box>
    </form>
  );
};

export default CreateSamplingSiteMapControlForm;
