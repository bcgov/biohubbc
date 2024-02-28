import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateProjectRequest, IUpdateProjectRequest } from 'interfaces/useProjectApi.interface';
import ProjectDetailsForm, { ProjectDetailsFormYupSchema } from '../components/ProjectDetailsForm';
import ProjectObjectivesForm, { ProjectObjectivesFormYupSchema } from '../components/ProjectObjectivesForm';
import ProjectUserForm, { ProjectUserRoleYupSchema } from '../components/ProjectUserForm';
import { useContext } from 'react';
import { CodesContext } from 'contexts/codesContext';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  sectionDivider: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

export interface IEditProjectForm {
  initialProjectData: IUpdateProjectRequest | ICreateProjectRequest;
  handleSubmit: (formikData: IUpdateProjectRequest) => void;
  formikRef: React.RefObject<FormikProps<IUpdateProjectRequest>>;
}

export const validationProjectYupSchema =
  ProjectDetailsFormYupSchema
    .concat(ProjectObjectivesFormYupSchema)
    .concat(ProjectUserRoleYupSchema);

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const EditProjectForm = (props: IEditProjectForm) => {
  const { formikRef } = props;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data

  const classes = useStyles();

  const handleSubmit = async (formikData: IUpdateProjectRequest) => {
    props.handleSubmit(formikData);
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.initialProjectData as unknown as IUpdateProjectRequest}
      validationSchema={validationProjectYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}>
      <>
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

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Team Members"
          summary="Specify team members and their associated role for this project."
          component={<ProjectUserForm users={props.initialProjectData.participants || []} roles={codes?.project_roles ?? []} />}
        />

        <Divider className={classes.sectionDivider} />
      </>
    </Formik>
  );
};

export default EditProjectForm;
