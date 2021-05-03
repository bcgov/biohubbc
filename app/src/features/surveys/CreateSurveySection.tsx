import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';

export interface ICreateSurveySectionProps {
  codes: IGetAllCodeSetsResponse;
  title: string;
  summary: string;
  component: any;
}

/**
 * Shared component for various survey sections
 *
 * @return {*}
 */
const CreateSurveySection: React.FC<ICreateSurveySectionProps> = (props) => {
  const { title, summary, component } = props;

  return (
    <>
      <Box width="100%" display="flex" flexWrap="nowrap">
        <Box width="30%" p={3}>
          <Box>
            <Typography variant="h2">{title}</Typography>
          </Box>
          <Box>
            <Typography variant="body2">{summary}</Typography>
          </Box>
        </Box>
        <Box width="70%" p={3}>
          {component}
        </Box>
      </Box>
    </>
  );
};

export default CreateSurveySection;
