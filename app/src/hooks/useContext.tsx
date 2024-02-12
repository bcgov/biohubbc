import { ConfigContext, IConfig } from 'contexts/configContext';
import { DialogContext, IDialogContext } from 'contexts/dialogContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';

/**
 * Returns an instance of `IConfig` from `ConfigContext`.
 *
 * @return {*}  {IConfig}
 */
export const useConfigContext = (): IConfig => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw Error(
      'ConfigContext is undefined, please verify you are calling useConfigContext() as child of an <ConfigContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IDialogContext` from `DialogContext`.
 *
 * @return {*}  {IDialogContext}
 */
export const useDialogContext = (): IDialogContext => {
  const context = useContext(DialogContext);

  if (!context) {
    throw Error(
      'DialogContext is undefined, please verify you are calling useDialogContext() as child of an <DialogContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IProjectContext` from `ProjectContext`.
 *
 * @return {*}  {IProjectContext}
 */
export const useProjectContext = (): IProjectContext => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw Error(
      'ProjectContext is undefined, please verify you are calling useProjectContext() as child of an <ProjectContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ISurveyContext` from `SurveyContext`.
 *
 * @return {*}  {ISurveyContext}
 */
export const useSurveyContext = (): ISurveyContext => {
  const context = useContext(SurveyContext);

  if (!context) {
    throw Error(
      'SurveyContext is undefined, please verify you are calling useSurveyContext() as child of an <SurveyContextProvider> component.'
    );
  }

  return context;
};
