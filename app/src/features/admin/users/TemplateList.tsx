import { TableBody } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { ITemplateData } from 'interfaces/useAdminApi.interface';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

export interface ITemplateListProps {
  templates: ITemplateData[];
  refresh: () => void;
}

const TemplateList: React.FC<ITemplateListProps> = (props) => {
  const classes = useStyles();

  const { templates } = props;


  return (
    <>
      <Paper>
        <Toolbar disableGutters>
          <Grid
            justify="space-between" // Add it here :)
            container
            alignItems="center">
            <Grid item>
              <Box px={2}>
                <Typography variant="h2">Templates </Typography>
              </Box>
            </Grid>

            <Grid item>
              <Box my={1} mx={2}>
                <Button color="primary" variant="outlined">
                  Add Template
                </Button>
                <Button color="primary" variant="outlined">
                  Add Validation
                </Button>
                <Button color="primary" variant="outlined">
                  Add Transformation
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Version</TableCell>
                <TableCell>Intended Outcome</TableCell>
                <TableCell>Field Survey Method</TableCell>
                <TableCell>Sampling Design</TableCell>
                <TableCell>Unit Sampled</TableCell>
                <TableCell>Validation</TableCell>
                <TableCell>Transformation</TableCell>
                <TableCell width="100px" align="center">
                  Active
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody data-testid="template-table">
              {!templates?.length && (
                <TableRow data-testid={'template-row-0'}>
                  <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                    No Templates
                  </TableCell>
                </TableRow>
              )}
              {templates.length > 0 &&
                templates.map((row, index) => (
                  <TableRow data-testid={`template-row-${index}`} key={row.template_id}>
                    <TableCell>
                      <strong>{row.name || 'Not Applicable'}</strong>
                    </TableCell>
                    <TableCell>{row.version}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default TemplateList;
