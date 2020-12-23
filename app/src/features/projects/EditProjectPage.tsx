import { Box, CircularProgress, Container, Typography } from '@material-ui/core';
import EditFormControlsComponent from 'components/form/EditFormControlsComponent';
import FormContainer from 'components/form/FormContainer';
import { projectTemplate } from 'constants/project-templates';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProjectRecord } from 'interfaces/project-interfaces';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router';

/**
 * Page to display a single Project in edit mode.
 *
 * @return {*}
 */
const EditProjectPage: React.FC = () => {
  // const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [project, setProject] = useState(null);

  useEffect(() => {
    // This function is not fully flushed out or tested
    const getProject = async () => {
      // TODO disable for demo purposes

      // const projectResponse = await biohubApi.getProject(urlParams['id']);

      // if (!projectResponse) {
      //   // TODO error messaging
      //   return;
      // }

      // An example of a project
      const testProject: IProjectRecord = {
        id: 1,
        project: {
          id: 1,
          name: 'Project Name',
          objectives: 'Project Objectives',
          scientific_collection_permit_number: '123456',
          management_recovery_action: 'A',
          location_description: 'Location Description',
          start_date: moment().toISOString(),
          end_date: moment().toISOString(),
          results: 'Results',
          caveats: 'Caveats',
          comments: 'Comments'
        },
        fundingAgency: {
          fundingAgency: {
            id: 1,
            funding_agency_project_id: '1',
            funding_amount: 100,
            funding_end_date: moment().toISOString(),
            funding_start_date: moment().toISOString()
          },
          agency: {
            id: 1,
            name: 'Agency',
            record_effective_date: moment().toISOString(),
            record_end_date: moment().toISOString()
          },
          landBasedClimateStrategy: {
            id: 1,
            name: 'Land Based Climate Strategy'
          }
        },
        managementActions: {
          managementActions: {
            id: 1
          },
          actionType: {
            id: 1,
            name: 'Action type',
            description: 'Action Description',
            record_effective_date: moment().toISOString(),
            record_end_date: moment().toISOString()
          }
        },
        region: {
          id: 1,
          common_code: 'Common Code'
        },
        proponent: {
          id: 1,
          name: 'Proponent Name',
          record_effective_date: moment().toISOString(),
          record_end_date: moment().toISOString()
        }
      };

      setProject(testProject /*templateResponse*/);
    };

    if (!project) {
      getProject();
    }
  }, [biohubApi, project]);

  const handleChange = () => {};

  const handleSubmitSuccess = () => {};

  if (!project) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <Box my={3}>
      <Container>
        <Box mb={3}>
          <Typography variant="h2">{`Edit Project ${project.id}`}</Typography>
        </Box>
        <Box>
          <FormContainer
            record={project}
            template={projectTemplate}
            formControlsComponent={<EditFormControlsComponent />}
            onFormChange={handleChange}
            onFormSubmitSuccess={handleSubmitSuccess}></FormContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default EditProjectPage;
