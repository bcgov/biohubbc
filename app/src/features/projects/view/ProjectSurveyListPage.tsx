import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, {
  useState,
  //useCallback,
  useEffect
} from 'react';
import { useHistory } from 'react-router';
//import makeStyles from '@material-ui/core/styles/makeStyles';
//import { mdiClipboardCheckMultipleOutline, mdiInformationOutline, mdiPaperclip } from '@mdi/js';
//import Icon from '@mdi/react';
//import { DATE_FORMAT } from 'constants/dateFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
//import { useLocation } from 'react-router';
import { useParams } from 'react-router';
//import { NavLink } from 'react-router-dom';

export interface IProjectSurveysProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const ProjectSurveys: React.FC<IProjectSurveysProps> = (props) => {
  const history = useHistory();
  const { projectForViewData } = props;

  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const projectId = projectForViewData.id;
  console.log(projectId);

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/projects/${projectId}/survey/create`);
  };

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  // if (!codes || !projectWithDetails) {
  //   return <CircularProgress className="pageProgress" size={40} />;
  // }

  return (
    <>
      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Surveys</Typography>
            <Button variant="outlined" color="primary" onClick={() => navigateToCreateSurveyPage(projectId)}>
              Create Survey
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProjectSurveys;
