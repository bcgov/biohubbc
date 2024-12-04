import { mdiMinusCircleOutline, mdiPlusCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import React, { useState } from 'react';
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
    <Paper variant="outlined">
      <List>
        {sampleSites.map((site, index) => {
          const isExpanded = expandedSites.includes(site.survey_sample_site_id);

          return (
            <React.Fragment key={site.survey_sample_site_id}>
              <ListItem
                alignItems="flex-start"
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 1,
                  px: 2,
                  mb: 2
                }}>
                <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mb={1}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography color={grey[400]} mr={2}>
                          {index + 1}
                        </Typography>
                        <Typography fontWeight={700} variant="subtitle1">
                          {site.name}
                        </Typography>
                      </Box>
                    }
                  />
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
                  <Box width="100%" pl={2}>
                    <SamplePeriodPeriodForm />
                  </Box>
                )}
              </ListItem>
              {index < sampleSites.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};
