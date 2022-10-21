import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ITemplateData } from 'interfaces/useAdminApi.interface';
import React, { useEffect, useState } from 'react';
import TemplateList from './TemplateList';

/**
 * Page to display template management data/functionality.
 *
 * @return {*}
 */
const ManageTemplatesPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [templates, setTemplates] = useState<ITemplateData[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [hasLoadedTemplates, setHasLoadedTemplates] = useState(false);

  useEffect(() => {
    const getTemplates = async () => {
      const getTemplatesResponse = await biohubApi.admin.getTemplates();
      console.log('getTemplatesResponse', getTemplatesResponse);

      setTemplates(() => {
        setHasLoadedTemplates(true);
        setIsLoadingTemplates(false);
        return getTemplatesResponse;
      });
    };

    if (hasLoadedTemplates || isLoadingTemplates) {
      return;
    }

    setIsLoadingTemplates(true);

    getTemplates();
  }, [biohubApi, isLoadingTemplates, hasLoadedTemplates]);

  const refreshTemplates = async () => {
    const getTemplatesResponse = await biohubApi.admin.getTemplates();

    setTemplates(getTemplatesResponse);
  };

  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h1">Manage Templates</Typography>
        </Box>

        <Box pt={3}>
          <TemplateList templates={templates} refresh={refreshTemplates} />
        </Box>
      </Container>
    </Box>
  );
};

export default ManageTemplatesPage;
