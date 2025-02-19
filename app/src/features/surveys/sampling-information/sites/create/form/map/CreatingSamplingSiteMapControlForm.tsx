import { mdiChevronDown, mdiMinusCircle } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/system/Stack';
import AlertBar from 'components/alert/AlertBar';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { CreateBlockI18N } from 'constants/i18n';
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/create/form/map/blocks/SamplingBlockForm';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { useMemo, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import {
  ICreateSampleSiteFormData,
  IPostSurveyBlock,
  IPostSurveySampleSite
} from '../../CreateSamplingSitePage.interface';

interface ICreateSamplingSiteMapControlFormProps {
  siteCount: number;
  blocks: IPostSurveyBlock[];
}

const CreateSamplingSiteMapControlForm = ({ siteCount, blocks }: ICreateSamplingSiteMapControlFormProps) => {
  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const { handleSubmit, values, setFieldValue, errors, setFieldError } = formikProps;
  const dialogContext = useDialogContext();

  const [expandedIndexes, setExpandedIndexes] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIndexes((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const drawRef = useRef<IDrawControlsRef>(null);

  const handleImport = (features: Feature[]) => {
    const newSites: IPostSurveySampleSite[] = features.map((feature) => ({
      site_assignment_id: v4(),
      geojson: { ...feature, id: v4() },
      name: shapeFileFeatureName(feature) ?? '',
      description: shapeFileFeatureDesc(feature) ?? null
    }));

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
    const siteNumber = values.survey_sample_sites.length + 1 + (siteCount || 0);
    const assignment_id = v4();

    setFieldValue('survey_sample_sites', [
      ...values.survey_sample_sites,
      {
        name: `Site ${siteNumber}`,
        assignment_id,
        description: null,
        leaflet_id: id,
        geojson: { ...feature, id: assignment_id }
      }
    ]);
  };

  const handleEdit = (editedFeatures: Feature[]) => {
    setFieldValue(
      'survey_sample_sites',
      values.survey_sample_sites.map((site) => {
        const editedFeature = editedFeatures.find((f) => f.id === site.site_assignment_id);
        return editedFeature ? { ...site, geojson: editedFeature } : site;
      })
    );
  };

  const handleDelete = (deletedFeatures: Feature[]) => {
    setFieldValue(
      'survey_sample_sites',
      values.survey_sample_sites.filter((site) => !deletedFeatures.some((del) => del.id === site.site_assignment_id))
    );
    setFieldError('survey_sample_sites', undefined);

    deletedFeatures.forEach((deletedFeature) => {
      const siteToDelete = values.survey_sample_sites.find((site) => site.site_assignment_id === deletedFeature.id);
      if (siteToDelete?.leaflet_id) {
        drawRef.current?.deleteLayer(siteToDelete.leaflet_id);
      }
    });

    setSelectedFeatures((prev) => prev.filter((selected) => !deletedFeatures.some((del) => del.id === selected.id)));
  };

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      prev.some((selected) => selected.id === feature.id)
        ? prev.filter((selected) => selected.id !== feature.id)
        : [...prev, feature]
    );
  };

  const siteMap = useMemo(() => {
    return new Map(values.survey_sample_sites.map((site) => [site.site_assignment_id, site]));
  }, [values.survey_sample_sites]);

  // const selectedItems = useMemo(
  //   () =>
  //     selectedFeatures
  //       .map((feature) => {
  //         const site = siteMap.get(String(feature.id));
  //         return site ? { geojson: feature, assignment_id: site.site_assignment_id, label: site.name } : null;
  //       })
  //       .filter(Boolean),
  //   [selectedFeatures, siteMap]
  // );

  // const handleFeatureSelectAll = () => {
  //   setSelectedFeatures((prev) =>
  //     prev.length === values.survey_sample_sites.length ? [] : values.survey_sample_sites.map((site) => site.geojson!)
  //   );
  // };

  const features = useMemo(() => values.survey_sample_sites.map((site) => site.geojson!), [values.survey_sample_sites]);

  console.log(expandedIndexes);

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
          tooltip={(feature) => <SurveyMapTooltip title={siteMap.get(String(feature.id))?.name ?? ''} />}
          selectedFeatures={selectedFeatures}
          dialogTitle="Import Sites"
        />
      </Paper>

      {errors?.survey_sample_sites && !Array.isArray(errors?.survey_sample_sites) && (
        <AlertBar
          severity="error"
          title={errors.survey_sample_sites}
          variant="outlined"
          text={errors.survey_sample_sites}
          sx={{ mt: 3 }}
        />
      )}

      <Box mt={3}>
        <TransitionGroup>
          {values.survey_sample_sites.map((site, index) => (
            <Collapse key={site.site_assignment_id} >
              <Box display="flex" alignItems="center" mb={2}>
                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: selectedFeatures.some((selected) => selected.id === site.geojson?.id)
                      ? '#e3f2fd'
                      : grey[50]
                  }}
                  variant="outlined">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => {
                      toggleExpand(site.site_assignment_id);
                    }}
                    sx={{ cursor: 'pointer' }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        color="primary"
                        checked={selectedFeatures.some((selected) => selected.id === site.geojson?.id)}
                        onChange={() => handleFeatureSelect(site.geojson!)}
                      />
                      <Typography fontWeight={700}>{site.name}</Typography>
                    </Box>
                    <IconButton color="primary">
                      <Icon path={mdiChevronDown} size={1} />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedIndexes.includes(site.site_assignment_id)}>
                    <Stack gap={2} mt={3}>
                      <CustomTextField label="Name" name={`survey_sample_sites[${index}].name`} />
                      <CustomTextField
                        label="Description"
                        name={`survey_sample_sites[${index}].description`}
                        other={{ multiline: true, rows: 2 }}
                      />
                      <SamplingBlockForm site_assignment_id={site.site_assignment_id} blocks={blocks} />
                    </Stack>
                  </Collapse>
                </Paper>

                <IconButton color="error" sx={{ mx: 1 }} onClick={() => handleDelete([site.geojson!])}>
                  <Icon path={mdiMinusCircle} size={1} />
                </IconButton>
              </Box>
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>
    </form>
  );
};

export default CreateSamplingSiteMapControlForm;
