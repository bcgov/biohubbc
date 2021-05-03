import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectSurveySectionProps {
  title: string;
  summary: string;
  component: any;
}

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const CreateSurveySection: React.FC<IProjectSurveySectionProps> = (props) => {
  const { title, summary, component } = props;

  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

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

  return (
    <>
      <Box width="100%" display="flex" flexWrap="nowrap">
        <Box width="40%" p={3}>
          <Box>
            <Typography variant="h2">{title}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">{summary}</Typography>
          </Box>
        </Box>
        <Box width="60%" p={3}>
          {component}
        </Box>
      </Box>
    </>
  );
};

export default CreateSurveySection;
