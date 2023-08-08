import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { alphabetizeObjects } from 'utils/Utils';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from '../components/ProjectCoordinatorForm';
import ProjectDetailsForm, {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from '../components/ProjectDetailsForm';
import ProjectIUCNForm, { ProjectIUCNFormInitialValues, ProjectIUCNFormYupSchema } from '../components/ProjectIUCNForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from '../components/ProjectLocationForm';
import ProjectObjectivesForm, {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from '../components/ProjectObjectivesForm';
import ProjectPartnershipsForm, {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from '../components/ProjectPartnershipsForm';

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
  ...ProjectCoordinatorInitialValues,
  ...ProjectLocationFormInitialValues,
  ...ProjectIUCNFormInitialValues,
  ...ProjectPartnershipsFormInitialValues
};

export const validationProjectYupSchema = ProjectCoordinatorYupSchema.concat(ProjectDetailsFormYupSchema)
  .concat(ProjectObjectivesFormYupSchema)
  .concat(ProjectLocationFormYupSchema)
  .concat(ProjectIUCNFormYupSchema)
  .concat(ProjectPartnershipsFormYupSchema);

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
  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.initialValues || initialProjectFieldData}
      validationSchema={validationProjectYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}>
      <>
        <ScrollToFormikError fieldOrder={Object.keys(initialProjectFieldData)} />

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
                type={
                  codes?.type?.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
              />
              <Box mt={3}>
                <ProjectObjectivesForm />
              </Box>
              <Box component="fieldset" mt={5}>
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
              </Box>
            </>
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Project Coordinator"
          summary="Provide the Project Coordinator's contact and agency information."
          component={
            <ProjectCoordinatorForm coordinator_agency={getCoordinatorAgencyOptions(codes)} />
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Funding and Partnerships"
          summary="Specify project funding sources and additional partnerships."
          component={
            <>
              <Box component="fieldset">
                <Typography component="legend" variant="h5">
                  Funding Sources
                </Typography>
                <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                  Specify funding sources for the project. <strong>Note:</strong> Dollar amounts are not intended to be
                  exact, please round to the nearest 100.
                </Typography>
                <Box mt={3}>
                  {
                    //funding
                  }
                </Box>
              </Box>
              <Box component="fieldset" mt={5}>
                <Typography component="legend" variant="h5">
                  Partnerships
                </Typography>
                <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
                  Additional partnerships that have not been previously identified as a funding sources.
                </Typography>
                <Box mt={4}>
                  <ProjectPartnershipsForm
                    first_nations={
                      codes?.first_nations?.map((item) => {
                        return { value: item.id, label: item.name };
                      }) || []
                    }
                    stakeholder_partnerships={
                      codes?.agency?.map((item) => {
                        return { value: item.name, label: item.name };
                      }) || []
                    }
                  />
                </Box>
              </Box>
            </>
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Location and Boundary"
          summary="Provide details about the project's location and define the project spatial boundary"
          component={<ProjectLocationForm />}></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />
      </>
    </Formik>
  );
};

export default CreateProjectForm;
