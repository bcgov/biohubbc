import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { ICreateProjectRequest, IUpdateProjectRequest } from 'interfaces/useProjectApi.interface';
import { useContext } from 'react';
import ProjectDetailsForm, { ProjectDetailsFormYupSchema } from '../components/ProjectDetailsForm';
import ProjectObjectivesForm, { ProjectObjectivesFormYupSchema } from '../components/ProjectObjectivesForm';
import ProjectUserForm, { ProjectUserRoleYupSchema } from '../components/ProjectUserForm';

export interface IEditProjectForm {
  initialProjectData: IUpdateProjectRequest | ICreateProjectRequest;
  handleSubmit: (formikData: IUpdateProjectRequest) => void;
  formikRef: React.RefObject<FormikProps<IUpdateProjectRequest>>;
}

export const validationProjectYupSchema =
  ProjectDetailsFormYupSchema.concat(ProjectObjectivesFormYupSchema).concat(ProjectUserRoleYupSchema);

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const EditProjectForm = (props: IEditProjectForm) => {
  const { formikRef } = props;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  const handleSubmit = async (formikData: IUpdateProjectRequest) => {
    props.handleSubmit(formikData);
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.initialProjectData as IUpdateProjectRequest}
      validationSchema={validationProjectYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter general information, objectives and timelines for the project."
          component={
            <>
              <ProjectDetailsForm
                program={
                  codes?.program?.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
              />
              <Box mt={3}>
                <ProjectObjectivesForm />
              </Box>
            </>
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Team Members"
          summary="Specify team members and their associated role for this project."
          component={<ProjectUserForm roles={codes?.project_roles ?? []} />}
        />

        <Divider />
      </Stack>
    </Formik>
  );
};

export default EditProjectForm;
