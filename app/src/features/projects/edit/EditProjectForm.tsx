import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IUpdateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import ProjectCoordinatorForm from '../components/ProjectCoordinatorForm';
import ProjectDetailsForm from '../components/ProjectDetailsForm';
import ProjectObjectivesForm from '../components/ProjectObjectivesForm';
import ProjectPartnershipsForm from '../components/ProjectPartnershipsForm';
import ProjectUserForm from '../components/ProjectUserForm';
import {
  getCoordinatorAgencyOptions,
  initialProjectFieldData,
  validationProjectYupSchema
} from '../create/CreateProjectForm';

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
  codes: IGetAllCodeSetsResponse;
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
const EditProjectForm: React.FC<IEditProjectForm> = (props) => {
  const { codes, formikRef } = props;

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
        validateOnBlur={true}
        validateOnChange={false}
        enableReinitialize={true}
        onSubmit={handleSubmit}>
        <>
          {/* <ScrollToFormikError fieldOrder={Object.keys(initialProjectFieldData)} /> */}

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
            title="Project Coordinator"
            summary="Provide the Project Coordinator's contact and agency information."
            component={
              <ProjectCoordinatorForm coordinator_agency={getCoordinatorAgencyOptions(codes)} />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Team Members"
            summary="Specify team members and their associated role for this project."
            component={<ProjectUserForm users={props.projectData.participants || []} roles={codes.project_roles} />}
          />

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Partnerships"
            summary="Select partners supporting or participating in this project."
            component={
              <>
                <Box component="fieldset">
                  <Typography component="legend" variant="h5">
                    Select Partnerships
                  </Typography>
                  <Box mt={1}>
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

          {/* TODO: (https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-161) Commenting out location form temporarily, while its decided where exactly project/survey locations should be defined */}
          {/* <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Location and Boundary"
            summary="Provide details about the project's location and define the project spatial boundary"
            component={<ProjectLocationForm />}></HorizontalSplitFormComponent> */}

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
