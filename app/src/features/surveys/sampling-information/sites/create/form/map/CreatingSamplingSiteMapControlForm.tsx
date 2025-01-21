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
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/create/form/components/SamplingBlockForm';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { IGetSurveyBlock } from 'interfaces/useBlockApi.interface';
import { createRef, useMemo, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ICreateSampleSiteFormData } from '../../CreateSamplingSitePage.interface';

interface ICreateSamplingSiteMapControlFormProps {
  siteCount?: number;
  blocks: IGetSurveyBlock[];
}

const CreateSamplingSiteMapControlForm = ({ siteCount, blocks }: ICreateSamplingSiteMapControlFormProps) => {
  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const { handleSubmit, values, setFieldValue, errors, setFieldError } = formikProps;
  const dialogContext = useDialogContext();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const drawRef = createRef<IDrawControlsRef>();

  const handleDeleteAll = () => {
    values.survey_sample_sites.forEach((item) => {
      if (item.leaflet_id) drawRef.current?.clearLayers();
    });
    setFieldValue('survey_sample_sites', []);
    setSelectedFeatures([]);
    setFieldError('survey_sample_sites', undefined);
  };

  const handleImport = (features: Feature[]) => {
    const newSites = features.map((feature) => {
      const uuid = v4();
      return {
        ...feature,
        uuid,
        geojson: { ...feature, id: uuid },
        name: shapeFileFeatureName(feature) ?? '',
        description: shapeFileFeatureDesc(feature) ?? null
      };
    });

    setFieldValue('survey_sample_sites', [...values.survey_sample_sites, ...newSites]);
  };

  const handleImportFailure = () => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateBlockI18N.importErrorTitle,
      dialogText: CreateBlockI18N.importErrorText,
      open: true,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false })
    });
  };

  const handleAdd = (feature: Feature, id: number) => {
    const uuid = v4();
    const siteNumber = values.survey_sample_sites.length + 1 + (siteCount || 0);
    const newSite = {
      name: `Site ${siteNumber}`,
      uuid,
      leaflet_id: id,
      geojson: { ...feature, id: uuid }
    };
    setFieldValue('survey_sample_sites', [...values.survey_sample_sites, newSite]);
  };

  const handleEdit = (editedFeatures: Feature[]) => {
    const updatedSites = values.survey_sample_sites.filter(
      (block) => !editedFeatures.some((feature) => feature.id === block.uuid)
    );
    setFieldValue('survey_sample_sites', [...updatedSites, ...editedFeatures]);
  };

  const handleDelete = (deletedFeatures: Feature[]) => {
    const filteredSites = values.survey_sample_sites.filter(
      (block) => !deletedFeatures.some((del) => del.id === block.uuid)
    );
    setFieldValue('survey_sample_sites', filteredSites);
    setFieldError('survey_sample_sites', undefined);

    deletedFeatures.forEach((deletedFeature) => {
      const blockToDelete = values.survey_sample_sites.find((block) => block.uuid === deletedFeature.id);
      blockToDelete?.leaflet_id && drawRef.current?.deleteLayer(blockToDelete.leaflet_id);
    });

    setSelectedFeatures((prevSelected) =>
      prevSelected.filter((selected) => !deletedFeatures.some((del) => del.id === selected.id))
    );
  };

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeatures((prevSelected) =>
      prevSelected.some((selectedFeature) => selectedFeature.id === feature.id)
        ? prevSelected.filter((selectedFeature) => selectedFeature.id !== feature.id)
        : [...prevSelected, feature]
    );
  };

  const handleFeatureSelectAll = () => {
    const allSelected = values.survey_sample_sites.every(
      (block) => block.geojson && selectedFeatures.some((feature) => feature.id === block.uuid)
    );

    setSelectedFeatures(
      allSelected ? [] : values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!)
    );
  };

  const handleTooltip = (feature: Feature) => {
    const label = values.survey_sample_sites.find((block) => block.uuid === feature.id)?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  const features = useMemo(
    () => values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!),
    [values.survey_sample_sites]
  );

  return (
    <form onSubmit={handleSubmit}>
      <YesNoDialog
        dialogTitle="Remove all clusters?"
        dialogText="Are you sure you want to remove all clusters?"
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel="Remove All"
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel="Cancel"
        open={isDeleteOpen}
        onYes={() => {
          setIsDeleteOpen(false);
          handleDeleteAll();
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
            uuid: block.uuid,
            label: block.name
          }))}
          selectedItems={selectedFeatures.map((feature) => ({
            geojson: feature,
            uuid: values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.uuid,
            label: values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.name ?? ''
          }))}
          onSelectItem={(feature) => feature.geojson && handleFeatureSelect(feature.geojson)}
          onSelectAll={handleFeatureSelectAll}
          renderCardContent={(_, index) => (
            <Stack gap={3}>
              <CustomTextField label="Name" name={`survey_sample_sites[${index}].name`} />
              <CustomTextField
                label="Description"
                name={`survey_sample_sites[${index}].description`}
                other={{ rows: 2, multiline: true }}
              />
              <SamplingBlockForm name={`survey_sample_sites[${index}].blocks`} blocks={blocks} />
            </Stack>
          )}
        />
      </Box>
    </form>
  );
};

export default CreateSamplingSiteMapControlForm;
