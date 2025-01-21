import EditDialog from 'components/dialog/EditDialog';
import { IDrawControlsRef } from 'components/map/components/DrawControls';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { ICreateBlock } from 'interfaces/useBlockApi.interface';
import { createRef } from 'react';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { CreateBlocksFormYupSchema } from '../form/create/CreateBlocksForm';
import EditBlocksForm from '../form/edit/EditBlocksForm';

export const BlocksFormYupSchema = yup.object({
  block: yup.object({
    survey_block_id: yup.number().required('Survey block ID is required'),
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    geojson: yup.object().nullable()
  })
});

interface ICreateBlocksDialogProps {
  isDialogOpen: boolean;
  handleClose: () => void;
  handleSave: (data: ICreateBlockFormData) => void;
  initialValues: ICreateBlockFormData;
}

export interface ICreateBlockFormData {
  blocks: ICreateBlock[];
}

export const CreateBlocksDialog = (props: ICreateBlocksDialogProps) => {
  const { initialValues, isDialogOpen, handleSave, handleClose } = props;

  const formikProps = useFormikContext<ICreateBlockFormData>();
  const { values, setFieldValue, setFieldError, handleSubmit } = formikProps;

  // const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const drawRef = createRef<IDrawControlsRef>();

  // Handle importing new features (blocks/clusters)
  const handleImport = (features: Feature[]) => {
    setFieldValue('blocks', [
      ...values.blocks,
      ...features.map((feature) => ({
        ...feature,
        uuid: v4(),
        geojson: { ...feature, id: v4() },
        name: `Cluster ${values.blocks.length + 1}`,
        description: null
      }))
    ]);
  };

  // Handle adding a new feature (block)
  const handleAdd = (feature: Feature) => {
    const uuid = v4();
    setFieldValue('blocks', [
      ...values.blocks,
      {
        name: `Cluster ${values.blocks.length + 1}`,
        uuid,
        geojson: { ...feature, id: uuid },
        description: null
      }
    ]);
  };

  // Handle deleting a block
  const handleDelete = (deletedFeatures: Feature[]) => {
    const filteredBlocks = values.blocks.filter((block) => !deletedFeatures.some((del) => del.id === block.uuid));
    setFieldValue('blocks', filteredBlocks);
    setFieldError('blocks', undefined);

    deletedFeatures.forEach((deletedFeature) => {
      const blockToDelete = values.blocks.find((block) => block.uuid === deletedFeature.id);
      if (blockToDelete?.leaflet_id) {
        drawRef.current?.deleteLayer(blockToDelete.leaflet_id);
      }
    });

    // setSelectedFeatures((prevSelected) =>
    //   prevSelected.filter((selected) => !deletedFeatures.some((del) => del.id === selected.id))
    // );
  };

  console.log(handleDelete, handleAdd, handleSave, handleImport, handleSave);

  return (
    <EditDialog
      dialogTitle="Create Clusters"
      open={isDialogOpen}
      onCancel={handleClose}
      onSave={() => handleSubmit()}
      size="md"
      component={{
        initialValues: initialValues,
        validationSchema: CreateBlocksFormYupSchema,
        element: <EditBlocksForm />
      }}
    />
  );
};

export default CreateBlocksDialog;
