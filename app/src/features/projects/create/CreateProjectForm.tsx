import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { PROJECT_ROLE } from 'constants/roles';
import { Formik, FormikProps } from 'formik';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest, IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { alphabetizeObjects } from 'utils/Utils';
import ProjectDetailsForm, {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from '../components/ProjectDetailsForm';
import { ProjectIUCNFormInitialValues } from '../components/ProjectIUCNForm';
import ProjectObjectivesForm, {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from '../components/ProjectObjectivesForm';
import ProjectUserForm, {
  ProjectUserRoleFormInitialValues,
  ProjectUserRoleYupSchema
} from '../components/ProjectUserForm';

const useStyles = makeStyles((theme: Theme) => ({
  sectionDivider: {
    height: '1px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

export interface ICreateProjectForm {
  codes: IGetAllCodeSetsResponse;
  handleSubmit: (formikData: ICreateProjectRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateProjectRequest>>;
  initialValues?: ICreateProjectRequest;
}

export const initialProjectFieldData: ICreateProjectRequest = {
  ...ProjectDetailsFormInitialValues,
  ...ProjectObjectivesFormInitialValues,
  ...ProjectIUCNFormInitialValues,
  ...ProjectUserRoleFormInitialValues
};

export const validationProjectYupSchema =
  ProjectDetailsFormYupSchema.concat(ProjectObjectivesFormYupSchema).concat(ProjectUserRoleYupSchema);
// TODO: (https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-162) Commenting out IUCN form (yup schema) temporarily, while its decided if IUCN information is desired
// .concat(ProjectIUCNFormYupSchema)

//Function to get the list of coordinator agencies from the code set
export const getCoordinatorAgencyOptions = (codes: IGetAllCodeSetsResponse): string[] => {
  const options = [...(codes?.agency || []), ...(codes?.first_nations || [])];
  return alphabetizeObjects(options, 'name').map((item) => item.name);
};

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const CreateProjectForm: React.FC<ICreateProjectForm> = (props) => {
  const { codes, formikRef } = props;

  const classes = useStyles();

  const handleSubmit = async (formikData: ICreateProjectRequest) => {
    props.handleSubmit(formikData);
  };

  const authStateContext = useAuthStateContext();

  const getProjectParticipants = (): IGetProjectParticipant[] => {
    let participants: IGetProjectParticipant[] = [];

    // load initial values from draft webform
    if (props.initialValues?.participants) {
      participants = props.initialValues?.participants as IGetProjectParticipant[];
    } else {
      // this is a fresh form and the logged in user needs to be added as a participant
      participants = [
        {
          system_user_id: authStateContext.simsUserWrapper?.systemUserId,
          display_name: authStateContext.simsUserWrapper?.displayName,
          email: authStateContext.simsUserWrapper?.email,
          agency: authStateContext.simsUserWrapper?.agency,
          identity_source: authStateContext.simsUserWrapper?.identitySource,
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        } as IGetProjectParticipant
      ];
    }
    return participants;
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.initialValues || initialProjectFieldData}
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
              {/* TODO: (https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-162) Commenting out IUCN form temporarily, while its decided if IUCN information is desired */}
              {/* <Box component="fieldset" mt={5}>
                <Typography component="legend" variant="h5">
                  IUCN Conservation Actions Classification
                </Typography>
                <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                  Conservation actions are specific actions or sets of tasks undertaken by project staff designed to
                  reach each of the project's objectives.
                </Typography>

                <Box mt={3}>
                  <ProjectIUCNForm
                    classifications={
                      codes?.iucn_conservation_action_level_1_classification?.map((item) => {
                        return { value: item.id, label: item.name };
                      }) || []
                    }
                    subClassifications1={
                      codes?.iucn_conservation_action_level_2_subclassification?.map((item) => {
                        return { value: item.id, iucn1_id: item.iucn1_id, label: item.name };
                      }) || []
                    }
                    subClassifications2={
                      codes?.iucn_conservation_action_level_3_subclassification?.map((item) => {
                        return { value: item.id, iucn2_id: item.iucn2_id, label: item.name };
                      }) || []
                    }
                  />
                </Box>
              </Box> */}
            </>
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Team Members"
          summary="Specify team members and their associated role for this project."
          component={<ProjectUserForm users={getProjectParticipants()} roles={codes.project_roles} />}
        />
        <Divider className={classes.sectionDivider} />
      </>
    </Formik>
  );
};

export default CreateProjectForm;
