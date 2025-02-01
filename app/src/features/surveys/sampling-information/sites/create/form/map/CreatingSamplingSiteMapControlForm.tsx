import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/system/Stack';
import AlertBar from 'components/alert/AlertBar';
import CollapsibleCardList from 'components/card/CollapsibleCardList';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { CreateBlockI18N } from 'constants/i18n';
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/create/form/map/blocks/SamplingBlockForm';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { createRef, useMemo, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import {
  ICreateSampleSiteFormData,
  IPostSurveyBlock,
  IPostSurveySampleSite
} from '../../CreateSamplingSitePage.interface';

interface ICreateSamplingSiteMapControlFormProps {
  siteCount?: number;
  blocks: IPostSurveyBlock[];
}

const CreateSamplingSiteMapControlForm = ({ siteCount, blocks }: ICreateSamplingSiteMapControlFormProps) => {
  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const { handleSubmit, values, setFieldValue, errors, setFieldError } = formikProps;
  const dialogContext = useDialogContext();

  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const drawRef = createRef<IDrawControlsRef>();

  // const handleDeleteAll = () => {
  //   values.survey_sample_sites.forEach((item) => {
  //     if (item.leaflet_id) drawRef.current?.clearLayers();
  //   });
  //   setFieldValue('survey_sample_sites', []);
  //   setSelectedFeatures([]);
  //   setFieldError('survey_sample_sites', undefined);
  // };

  const handleImport = (features: Feature[]) => {
    const newSites: IPostSurveySampleSite[] = features.map((feature) => {
      const assignment_id = v4();
      return {
        ...feature,
        assignment_id,
        geojson: { ...feature, id: assignment_id },
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
    const assignment_id = v4();
    const siteNumber = values.survey_sample_sites.length + 1 + (siteCount || 0);
    const newSite: IPostSurveySampleSite = {
      name: `Site ${siteNumber}`,
      assignment_id,
      description: null,
      leaflet_id: id,
      geojson: { ...feature, id: assignment_id }
    };
    setFieldValue('survey_sample_sites', [...values.survey_sample_sites, newSite]);
  };

  const handleEdit = (editedFeatures: Feature[]) => {
    const updatedSites = values.survey_sample_sites.filter(
      (block) => !editedFeatures.some((feature) => feature.id === block.assignment_id)
    );
    setFieldValue('survey_sample_sites', [...updatedSites, ...editedFeatures]);
  };

  const handleDelete = (deletedFeatures: Feature[]) => {
    const filteredSites = values.survey_sample_sites.filter(
      (block) => !deletedFeatures.some((del) => del.id === block.assignment_id)
    );
    setFieldValue('survey_sample_sites', filteredSites);
    setFieldError('survey_sample_sites', undefined);

    deletedFeatures.forEach((deletedFeature) => {
      const blockToDelete = values.survey_sample_sites.find((block) => block.assignment_id === deletedFeature.id);
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
      (block) => block.geojson && selectedFeatures.some((feature) => feature.id === block.assignment_id)
    );

    setSelectedFeatures(
      allSelected ? [] : values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!)
    );
  };

  const handleTooltip = (feature: Feature) => {
    const label = values.survey_sample_sites.find((block) => block.assignment_id === feature.id)?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  const features = useMemo(
    () => values.survey_sample_sites.filter((block) => block.geojson).map((block) => block.geojson!),
    [values.survey_sample_sites]
  );

  return (
    <form onSubmit={handleSubmit}>
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
            assignment_id: block.assignment_id,
            label: block.name
          }))}
          selectedItems={selectedFeatures.map((feature) => ({
            geojson: feature,
            assignment_id:
              values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.assignment_id ?? '',
            label: values.survey_sample_sites.find((block) => block.geojson?.id === feature.id)?.name ?? ''
          }))}
          onSelectItem={(feature) => feature.geojson && handleFeatureSelect(feature.geojson)}
          onSelectAll={handleFeatureSelectAll}
          renderCardContent={(site, index) => (
            <Stack gap={3}>
              <CustomTextField label="Name" name={`survey_sample_sites[${index}].name`} />
              <CustomTextField
                label="Description"
                name={`survey_sample_sites[${index}].description`}
                other={{ rows: 2, multiline: true }}
              />
              <SamplingBlockForm assignment_id={site.assignment_id} blocks={blocks} />
            </Stack>
          )}
        />
      </Box>
    </form>
  );
};

export default CreateSamplingSiteMapControlForm;
