import { mdiGroup, mdiMapMarker, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import AlertBar from 'components/alert/AlertBar';
import CollapsibleCardList from 'components/card/CollapsibleCardList';
import YesNoDialog from 'components/dialog/YesNoDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { ImportDrawMapControl } from 'components/map/ImportDrawMapControl';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { CreateBlockI18N } from 'constants/i18n';
import { SamplingSiteManageTableView } from 'features/surveys/sampling-information/sites/table/SamplingSiteTabsContainer';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useDialogContext } from 'hooks/useContext';
import { createRef, useMemo, useState } from 'react';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ICreateBlockFormData } from '../../create/CreateBlockPage';

interface ICreateBlocksMapFormProps {
  /**
   * The number of clusters in the survey, used for generating unique names of new clusters
   * eg. If the survey has 10 clusters, the next cluster name will default to "Cluster 11".
   */
  clusterCount?: number;
}

export const SurveyBlockInitialValues = { blocks: [] };

/**
 * Create blocks - map control
 *
 * @return {*}
 */
const CreateBlocksMapForm = (props: ICreateBlocksMapFormProps) => {
  const formikProps = useFormikContext<ICreateBlockFormData>();
  const dialogContext = useDialogContext();

  const { handleSubmit, values, setFieldValue, errors, setFieldError } = formikProps;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);

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
    setFieldError('blocks', undefined);
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
    // UUID is the key used to join map layers with their corresponding formik data
    const uuid = v4();

    let clusterNumber = values.blocks.length + 1;
    if (props.clusterCount) {
      clusterNumber += props.clusterCount;
    }

    setFieldValue('blocks', [
      ...values.blocks,
      {
        name: `Cluster ${clusterNumber}`,
        description: null,
        uuid,
        leaflet_id: id,
        geojson: { ...feature, id: uuid }
      }
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
    setFieldError('blocks', undefined);

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

  // useMemo to prevent map zoom from changing when a feature is selected
  const features = useMemo(
    () => values.blocks.filter((block) => block.geojson).map((block) => block.geojson!),
    [values.blocks]
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
          mapId="survey-blocks-map"
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
          dialogTitle="Import Blocks"
        />
      </Paper>

      {errors?.blocks && !Array.isArray(errors?.blocks) && (
        <AlertBar sx={{ mt: 3 }} severity="error" title={errors.blocks} variant="outlined" text={errors.blocks} />
      )}

      <Toolbar
        disableGutters
        sx={{
          flex: '1 1 auto',
          my: 2,
          width: '100%'
        }}>
        <CustomToggleButtonGroup
          views={[
            { value: SamplingSiteManageTableView.SITES, icon: mdiMapMarker, label: SamplingSiteManageTableView.SITES },
            {
              value: SamplingSiteManageTableView.CLUSTER,
              icon: mdiGroup,
              label: SamplingSiteManageTableView.CLUSTER
            }
          ]}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="horizontal"
        />
        <Button
          sx={{
            mt: 1
          }}
          data-testid="cluster-add-button"
          variant="outlined"
          color="primary"
          title="Create Cluster"
          aria-label="Create Cluster"
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add Cluster
        </Button>
      </Toolbar>

      {values.blocks.length > 0 ? (
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
      ) : (
        <Box minHeight='200px' bgcolor={grey[100]} display="flex" alignItems="center" justifyContent="center">
          <Typography>You have not added any new sites</Typography>
        </Box>
      )}
    </form>
  );
};

export default CreateBlocksMapForm;
