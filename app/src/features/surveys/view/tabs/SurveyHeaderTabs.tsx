import { mdiClipboardOutline, mdiShieldAccount } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { SURVEY_ACTIVE_TAB_VALUE } from 'features/surveys/details/SurveyPage';
import appTheme from 'themes/appTheme';

interface ISurveyHeaderTabsProps {
  activeTab: SURVEY_ACTIVE_TAB_VALUE;
  handleTabChange: (tab: SURVEY_ACTIVE_TAB_VALUE) => void;
}

/**
 * Displays buttons for changing tabs on the Survey page, changing which content is shown
 *
 * @param {ISurveyHeaderTabsProps} props
 * @returns
 */
const SurveyHeaderTabs = (props: ISurveyHeaderTabsProps) => {
  const { activeTab, handleTabChange } = props;

  const tabs = [
    { value: SURVEY_ACTIVE_TAB_VALUE.details, icon: mdiClipboardOutline, label: 'Details' },
    { value: SURVEY_ACTIVE_TAB_VALUE.permissions, icon: mdiShieldAccount, label: 'Permissions' }
  ];

  return (
    <Stack flexDirection="row" mt={2}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Button
            key={tab.value}
            color="primary"
            onClick={() => handleTabChange(tab.value)}
            startIcon={<Icon path={tab.icon} size={0.8} style={{ marginTop: '1px' }} />}
            sx={{
              px: 3,
              textTransform: 'none',
              fontSize: '0.9rem',
              color: isActive ? 'primary' : grey[500],
              fontWeight: isActive ? 700 : 500,
              borderBottom: `4px solid ${isActive ? appTheme.palette.primary.main : 'transparent'}`,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}>
            {tab.label}
          </Button>
        );
      })}
    </Stack>
  );
};

export default SurveyHeaderTabs;
