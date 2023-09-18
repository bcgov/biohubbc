import EditDialog from 'components/dialog/EditDialog';
import { FundingSourceI18N } from 'constants/i18n';
import { useState } from 'react';
import yup from 'utils/YupSchema';

interface ICreateFundingSourceProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const SamplingMethodYupSchema = yup.object().shape({});
const CreateSamplingMethod: React.FC<ICreateFundingSourceProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (values: any) => {};
  return (
    <>
      <EditDialog
        dialogTitle={FundingSourceI18N.createFundingSourceDialogTitle}
        dialogText={FundingSourceI18N.createFundingSourceDialogText}
        open={props.open}
        dialogLoading={isSubmitting}
        component={{
          element: <SamplingMethodForm />,
          initialValues: {
            funding_source_id: null,
            name: '',
            description: '',
            start_date: null,
            end_date: null,
            revision_count: null
          },
          validationSchema: SamplingMethodYupSchema
        }}
        dialogSaveButtonLabel="Create"
        onCancel={() => props.onClose()}
        onSave={(formValues) => {
          handleSubmit(formValues);
        }}
      />
    </>
  );
};

export default CreateSamplingMethod;
