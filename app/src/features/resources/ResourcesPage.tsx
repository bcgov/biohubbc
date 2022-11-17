import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  pageTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  }
}));

/**
 * Page to display a list of resources
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const classes = useStyles();
  const config = useContext(ConfigContext);
  const s3PublicHostURL = config?.S3_PUBLIC_HOST_URL;

  const resources = [
    {
      id: '13',
      name: 'Deer Aerial Non Stratified Random Block Recruit Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Deer_Aerial_NonStratifiedRandomBlock_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Deer',
      fileSize: '108 KB'
    },
    {
      id: '14',
      name: 'Deer Ground Transect Recruit Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Deer_Ground_Transect_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Deer',
      fileSize: '114 KB'
    },
    {
      id: '10',
      name: 'Elk Aerial Stratified Random Block Recruit Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Elk_Aerial_StratifiedRandomBlock_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Elk',
      fileSize: '122 KB'
    },
    {
      id: '11',
      name: 'Elk Aerial Non Stratified Random Block Recruit Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Elk_Aerial_NonStratifiedRandomBlock_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Elk',
      fileSize: '120 KB'
    },
    {
      id: '12',
      name: 'Elk Aerial Transect Distance Sampling Recruit Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Elk_Aerial_Transect_DistanceSampling_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Elk',
      fileSize: '114 KB'
    },
    {
      id: '9',
      name: 'Elk Summary Results Template 1.0',
      url: `${s3PublicHostURL}/templates/Elk_Summary_Results_1.0.xlsx`,
      type: 'Summary Results Template',
      species: 'Elk',
      fileSize: '24 KB'
    },
    {
      id: '8',
      name: 'Goat Summary Results Template 1.0',
      url: `${s3PublicHostURL}/templates/Goat_Summary_Results_1.0.xlsx`,
      type: 'Summary Results Template',
      species: 'Mountain Goat',
      fileSize: '27 KB'
    },
    {
      id: '1',
      name: 'Moose Aerial Non-SRB Recruitment Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Moose_Aerial_NonStratifiedRandomBlock_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Alces americanus, Moose',
      fileSize: '145 KB'
    },
    {
      id: '2',
      name: 'Moose Aerial Stratified Random Block Recruitment Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Moose_Aerial_StratifiedRandomBlock_Recruit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Alces americanus, Moose',
      fileSize: '143 KB'
    },
    {
      id: '3',
      name: 'Moose Aerial Transect Distance Sampling Survey 1.0',
      url: `${s3PublicHostURL}/templates/Moose_Aerial_Transect_Distance_Sampling_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Alces americanus, Moose',
      fileSize: '143 KB'
    },
    {
      id: '6',
      name: 'Moose Summary Results Template 1.0',
      url: `${s3PublicHostURL}/templates/Moose_Summary_Results_1.0.xlsx`,
      type: 'Summary Results Template',
      species: 'Alces americanus, Moose',
      fileSize: '27 KB'
    },
    {
      id: '5',
      name: 'Mountain Goat Aerial Total Count Recruitment Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Goat_Aerial_Population_Total_Count_Recuit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Mountain Goat',
      fileSize: '100 KB'
    },
    {
      id: '4',
      name: 'Sheep Aerial Total Count Recruitment Composition Survey 1.0',
      url: `${s3PublicHostURL}/templates/Sheep_Aerial_Population_Total_Count_Recuit_Comp_Survey_1.0.xlsx`,
      type: 'Field Data Template',
      species: 'Sheep',
      fileSize: '131 KB'
    },
    {
      id: '7',
      name: 'Sheep Summary Results Template 1.0',
      url: `${s3PublicHostURL}/templates/Sheep_Summary_Results_1.0.xlsx`,
      type: 'Summary Results Template',
      species: 'Sheep',
      fileSize: '24 KB'
    }
  ];

  const getResourcesList = () => {
    return (
      <TableContainer>
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell width={150} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            {resources?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link href={row.url} underline="always" style={{ fontWeight: 700 }}>
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell align="center">
                  <IconButton href={row.url} aria-label={'Download' + ' ' + row.name}>
                    <Icon path={mdiTrayArrowDown} size={0.8} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * Displays resources list.
   */
  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Resources
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <Box px={1}>{getResourcesList()}</Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ResourcesPage;
