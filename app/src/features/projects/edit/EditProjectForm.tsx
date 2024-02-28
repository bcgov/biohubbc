import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { IUpdateProjectRequest } from 'interfaces/useProjectApi.interface';
import ProjectDetailsForm from '../components/ProjectDetailsForm';
import ProjectObjectivesForm from '../components/ProjectObjectivesForm';
import ProjectUserForm from '../components/ProjectUserForm';
import { initialProjectFieldData, validationProjectYupSchema } from '../create/CreateProjectForm';
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
  projectData: IUpdateProjectRequest;
  handleSubmit: (formikData: IUpdateProjectRequest) => void;
  handleCancel: () => void;
  formikRef: React.RefObject<FormikProps<IUpdateProjectRequest>>;
}

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

  const handleCancel = () => {
    props.handleCancel();
  };

  return (
    <Box p={5}>
      <Formik
        innerRef={formikRef}
        initialValues={initialProjectFieldData as unknown as IUpdateProjectRequest}
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
            // TODO ProjectUserForm (and/or its child components) should not takes roles as a prop and should instead derive roles through `useContext(CodesContext)`
            component={<ProjectUserForm users={props.projectData.participants || []} roles={codes?.project_roles ?? []} />}
          />

          <Divider className={classes.sectionDivider} />
        </>
      </Formik>

      <Box display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          color="primary"
          variant="contained"
          onClick={() => formikRef.current?.submitForm()}
          className={classes.actionButton}>
          Save Project
        </Button>
        <Button color="primary" variant="outlined" onClick={handleCancel} className={classes.actionButton}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditProjectForm;
