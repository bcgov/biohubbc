import { mdiMinusCircleOutline, mdiPlusCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { SamplePeriodPeriodForm } from './periods/SamplePeriodPeriodForm';

interface ISamplingPeriodSiteFormProps {
  sampleSites: IGetSampleLocationNonSpatialDetails[];
}

export const SamplingPeriodSiteForm = (props: ISamplingPeriodSiteFormProps) => {
  const { sampleSites } = props;
  const [expandedSites, setExpandedSites] = useState<number[]>([]);

  const handleClick = (site: IGetSampleLocationNonSpatialDetails) => {
    if (expandedSites.includes(site.survey_sample_site_id)) {
      setExpandedSites(expandedSites.filter((existing) => existing !== site.survey_sample_site_id));
      return;
    }
    setExpandedSites((prev) => [...prev, site.survey_sample_site_id]);
  };

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 2 }}>
      <TransitionGroup>
        {sampleSites.map((site, index) => {
          const isExpanded = expandedSites.includes(site.survey_sample_site_id);
          return (
            <Collapse key={site.survey_sample_site_id}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>{site.name}</Typography>
                {isExpanded ? (
                  <IconButton color="error" onClick={() => handleClick(site)}>
                    <Icon path={mdiMinusCircleOutline} size={1} />
                  </IconButton>
                ) : (
                  <IconButton color="primary" onClick={() => handleClick(site)}>
                    <Icon path={mdiPlusCircle} size={1} />
                  </IconButton>
                )}
              </Box>
              {/* Show periods if the site is expanded */}
              {isExpanded && (
                <Box ml={2}>
                  <SamplePeriodPeriodForm />
                </Box>
              )}
              {index < sampleSites.length - 1 && <Divider />}
            </Collapse>
          );
        })}
      </TransitionGroup>
    </Paper>
  );
};
