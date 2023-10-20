import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Card, CardHeader, Collapse, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { TransitionGroup } from 'react-transition-group';

interface AnimalDataCardsProps {
  header: string;
  data: Record<string, string>[];
}
export const AnimalDataCards = ({ header, data }: AnimalDataCardsProps) => {
  return (
    <TransitionGroup>
      {data.map((item, index) => {
        return (
          <Collapse key={`${header}-${item}-${index}`}>
            <Card
              variant="outlined"
              sx={{
                background: grey[100],
                '& .MuiCardHeader-subheader': {
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '92ch',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '14px'
                },
                mt: 1,
                '& .MuiCardHeader-title': {
                  mb: 0.5
                }
              }}>
              <CardHeader
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={header}
                subheader={Object.entries(data).map((key, value) => `${key}-${value}`)}
              />
            </Card>
          </Collapse>
        );
      })}
    </TransitionGroup>
  );
};
