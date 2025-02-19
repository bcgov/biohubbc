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
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/form/map/blocks/SamplingBlockForm';
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
} from '../../create/CreateSamplingSitePage.interface';

interface ICreateSamplingSiteMapControlFormProps {
  /**
   * Array of blocks that can be assigned to the new sampling site
   */
  blocks: IPostSurveyBlock[];
  /**
   * Number of sites, used for dynamically naming new sites (eg. Site 1, Site 2).
   * Includes sites in formik (ie. values.sites.length + dataLoader.sites.length)
   */
  siteCount: number;
}

/**
 * Form control for adding new sampling sites
 *
 * @param {ICreateSamplingSiteMapControlFormProps} props
 * @returns
 */
const CreateSamplingSiteMapControlForm = (props: ICreateSamplingSiteMapControlFormProps) => {
  const { siteCount, blocks } = props;

  const { handleSubmit, values, setFieldValue, errors, setFieldError } = useFormikContext<ICreateSampleSiteFormData>();

  // Ids for which children are expanded (accordion-like behaviour)
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  const dialogContext = useDialogContext();

  // Ref for map controls, used for clearing map layers when items are deleted from formik
  const drawRef = useRef<IDrawControlsRef>(null);

  // Callback for expanding children, exposing the form inputs for a given sampling site
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Import sites from a file
  const handleImport = (features: Feature[]) => {
    const newSites: IPostSurveySampleSite[] = features.map((feature, index) => {
      const site_assignment_id = v4();
      return {
        site_assignment_id: site_assignment_id,
        geojson: { ...feature, id: site_assignment_id },
        name: shapeFileFeatureName(feature) ?? `Site ${siteCount + 1 + index}`,
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

  // Add sampling site by drawing on the map
  const handleAdd = (feature: Feature, id: number) => {
    const site_assignment_id = v4();

    setFieldValue('survey_sample_sites', [
      ...values.survey_sample_sites,
      {
        name: `Site ${siteCount + 1}`,
        site_assignment_id,
        description: null,
        leaflet_id: id,
        geojson: { ...feature, id: site_assignment_id }
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

  // Handle the map feature or card checkbox being clicked for a sampling site
  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      // If the site is already selected, remove it from the selection
      prev.some((selected) => selected.id === feature.id)
        ? prev.filter((selected) => selected.id !== feature.id)
        : [...prev, feature]
    );
  };

  // Tooltip component to display when a feature is hovered on the map
  const handleTooltip = (feature: Feature) => {
    const site = values.survey_sample_sites.find((site) => site.geojson?.id === feature.id);
    const label = site?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

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

  // Memoize the geojson of sampling sites to display on the map and to display cards for
  const sites = useMemo(() => values.survey_sample_sites, [values.survey_sample_sites]);

  return (
    <form onSubmit={handleSubmit}>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <ImportDrawMapControl
          mapId="survey-survey-sample-sites-map"
          label="Sites"
          drawControlsRef={drawRef}
          features={sites.map((site) => site.geojson!)}
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
          severity="error"
          title={errors.survey_sample_sites}
          variant="outlined"
          text={errors.survey_sample_sites}
          sx={{ mt: 3 }}
        />
      )}

      <TransitionGroup>
        {sites.map((site, index) => (
          <Collapse key={site.site_assignment_id}>
            <Box display="flex" alignItems="center" mt={2}>
              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  // Change colour of selected sites
                  bgcolor: selectedFeatures.some((selected) => selected.id === site.geojson?.id) ? '#e3f2fd' : grey[50]
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
                  <Box
                    display="flex"
                    alignItems="center"
                    onClick={(e) => {
                      // Stop propogation to prevent the card from expanding when the checkbox is clicked
                      e.stopPropagation();
                    }}>
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

                <Collapse in={expandedItems.includes(site.site_assignment_id)}>
                  <Stack gap={2} mt={3}>
                    <CustomTextField label="Name" name={`survey_sample_sites[${index}].name`} />
                    <CustomTextField
                      label="Description"
                      name={`survey_sample_sites[${index}].description`}
                      other={{ multiline: true, rows: 2 }}
                    />
                    {/* Form for assigning this site to blocks */}
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
    </form>
  );
};

export default CreateSamplingSiteMapControlForm;
