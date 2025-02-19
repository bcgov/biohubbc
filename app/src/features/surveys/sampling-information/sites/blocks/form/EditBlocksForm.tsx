import { mdiChevronDown, mdiMinusCircle } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import { EditBlockI18N } from 'constants/i18n';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { createRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import {
  ICreateSampleSiteFormData,
  IPostSurveyBlock,
  IPostSurveySampleSite
} from '../../create/CreateSamplingSitePage.interface';
import { SamplingBlockForm } from './sample-site/SamplingSiteBlockForm';

interface IEditBlocksForm {
  /**
   * Available sampling sites that can be assigned to the new block
   */
  sites: Omit<IPostSurveySampleSite, 'geojson'>[];
  /**
   * The number of blocks, used for default names of new blocks
   */
  blockCount: number;
}

/**
 * Edit multiple survey blocks - map control
 *
 * @return {*}
 */
const EditBlocksForm = (props: IEditBlocksForm) => {
  const { sites, blockCount } = props;

  const formikProps = useFormikContext<ICreateSampleSiteFormData>();

  const { handleSubmit, values, setFieldValue, setFieldError } = formikProps;
  const dialogContext = useDialogContext();

  const [expandedIndexes, setExpandedIndexes] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIndexes((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

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
    const block_assignment_id = v4();
    const siteNumber = values.blocks.length + 1 + (blockCount || 0);
    const newBlock: IPostSurveyBlock = {
      name: `Block ${siteNumber}`,
      block_assignment_id,
      description: null,
      leaflet_id: id,
      geojson: { ...feature, id: block_assignment_id }
    };
    setFieldValue('blocks', [...values.blocks, newBlock]);
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

  const handleDelete = (deletedFeatures: Feature[]) => {
    setFieldValue(
      'blocks',
      values.blocks.filter((site) => !deletedFeatures.some((del) => del.id === site.block_assignment_id))
    );
    setFieldError('blocks', undefined);

    deletedFeatures.forEach((deletedFeature) => {
      const siteToDelete = values.blocks.find((site) => site.block_assignment_id === deletedFeature.id);
      if (siteToDelete?.leaflet_id) {
        drawRef.current?.deleteLayer(siteToDelete.leaflet_id);
      }
    });

    setSelectedFeatures((prev) => prev.filter((selected) => !deletedFeatures.some((del) => del.id === selected.id)));
  };

  const handleTooltip = (feature: Feature) => {
    const block = values.blocks.find((block) => block.geojson?.id === feature.id);
    const label = block?.name ?? '';
    return <SurveyMapTooltip title={label} key={`feature-tooltip-${feature.id}`} />;
  };

  const features = values.blocks.map((block) => block.geojson).filter((block) => block !== undefined && block !== null);

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

      {
        <Box mt={3}>
          <TransitionGroup>
            {values.blocks.map((block, index) => (
              <Collapse key={block.block_assignment_id}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Paper
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: selectedFeatures.some((selected) => selected.id === block.geojson?.id)
                        ? '#e3f2fd'
                        : grey[50]
                    }}
                    variant="outlined">
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      onClick={() => {
                        toggleExpand(block.block_assignment_id);
                      }}
                      sx={{ cursor: 'pointer' }}>
                      <Box display="flex" alignItems="center">
                        <Checkbox
                          color="primary"
                          checked={selectedFeatures.some((selected) => selected.id === block.geojson?.id)}
                          onChange={() => handleFeatureSelect(block.geojson!)}
                        />
                        <Typography fontWeight={700}>{block.name}</Typography>
                      </Box>
                      <IconButton color="primary">
                        <Icon path={mdiChevronDown} size={1} />
                      </IconButton>
                    </Box>

                    <Collapse in={expandedIndexes.includes(block.block_assignment_id)}>
                      <Stack gap={2} mt={3}>
                        <CustomTextField label="Name" name={`blocks[${index}].name`} />
                        <Box>
                          <CustomTextField
                            label="Description"
                            name={`blocks[${index}].description`}
                            other={{ rows: 2, multiline: true }}
                          />
                        </Box>
                        <Box>
                          <SamplingBlockForm assignment_id={block.block_assignment_id} sites={sites} />
                        </Box>
                      </Stack>
                    </Collapse>
                  </Paper>

                  <IconButton color="error" sx={{ mx: 1 }} onClick={() => handleDelete([block.geojson!])}>
                    <Icon path={mdiMinusCircle} size={1} />
                  </IconButton>
                </Box>
              </Collapse>
            ))}
          </TransitionGroup>
        </Box>
      }
    </form>
  );
};

export default EditBlocksForm;
