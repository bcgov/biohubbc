import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import ReadMoreField from 'components/fields/ReadMoreField';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPublicProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Project objectives content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectObjectives: React.FC<IPublicProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { objectives }
  } = props;

  return (
    <>
      <Box mb={5}>
        <Box mb={2} height="2rem">
          <Typography variant="h3">Objectives</Typography>
        </Box>
        <ReadMoreField text={objectives.objectives} maxCharLength={850} />
      </Box>

      {objectives.caveats && (
        <>
          <Divider></Divider>
          <Box mt={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
              <Typography variant="h3">Caveats</Typography>
            </Box>
            <ReadMoreField text={objectives.caveats} maxCharLength={850} />
          </Box>
        </>
      )}
    </>
  );
};

export default PublicProjectObjectives;
