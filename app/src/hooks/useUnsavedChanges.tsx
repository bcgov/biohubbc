import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { EditSurveyI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import * as History from 'history';
import { useContext } from 'react';
import { useHistory } from 'react-router';

/**
 * Hook to handle pages that need confirmation before leaving with unsaved changes.
 * Will render a confirmation dialog when attempting to navigate to a different page.
 * In most cases this hook will be used in conjunction with the Prompt (react-router-dom) component.
 *
 * @param {boolean} [skipConfirmation] - Boolean indicator to skip the dialog confirmation ie: isSaving / isSubmitting
 * @returns {*} {
 *  renderUnsavedChangesDialog: (pathname: string) => void - manually trigger the confirmation dialog - usually used with `cancel` callbacks
 *  changeLocation: (location: History.Location) => boolean - location change interceptor - passed to prompt `message` prop
 * }
 */
export const useUnsavedChangesDialog = (skipConfirmation?: boolean) => {
  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  /**
   * Generates the cancel dialog props
   *
   * @param {string} pathname - Path to redirect to on confirmation
   * @returns {IYesNoDialogProps} Cancel dialog props
   */
  const getCancelDialogProps = (pathname: string): IYesNoDialogProps => {
    return {
      dialogTitle: EditSurveyI18N.cancelTitle,
      dialogText: EditSurveyI18N.cancelText,
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        dialogContext.setYesNoDialog({ open: false });
        history.push(pathname);
      }
    };
  };

  /**
   * Renders unsaved changes dialog - which redirects to a specific location on confirmation
   *
   * @param {string} pathname - A history location pathname ie: 'projects'
   */
  const renderUnsavedChangesDialog = (pathname: string) => dialogContext.setYesNoDialog(getCancelDialogProps(pathname));

  /**
   * Intercepts all history navigation attempts usually used with '<Prompt>'
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const changeLocation = (location: History.Location) => {
    // Skip the confirmation dialog, usually when form is saving: allow location change
    if (skipConfirmation) {
      return true;
    }

    // If dialog not open: open confirmation dialog
    if (!dialogContext.yesNoDialogProps.open) {
      // Dialog will trigger a location change again if yes selected
      dialogContext.setYesNoDialog(getCancelDialogProps(location.pathname));
      // Do not allow location change
      return false;
    }

    // All other location changes: allow it
    return true;
  };

  return { changeLocation, renderUnsavedChangesDialog };
};
