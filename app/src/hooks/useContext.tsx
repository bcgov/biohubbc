import { AnimalPageContext, IAnimalPageContext } from 'contexts/animalPageContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { DialogContext, IDialogContext } from 'contexts/dialogContext';
import { IObservationsContext, ObservationsContext } from 'contexts/observationsContext';
import { IObservationsPageContext, ObservationsPageContext } from 'contexts/observationsPageContext';
import { IObservationsTableContext, ObservationsTableContext } from 'contexts/observationsTableContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { ITaxonomyContext, TaxonomyContext } from 'contexts/taxonomyContext';
import { ITelemetryDataContext, TelemetryDataContext } from 'contexts/telemetryDataContext';
import { IAllTelemetryTableContext, TelemetryTableContext } from 'contexts/telemetryTableContext';
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
 * Returns an instance of `ICodesContext` from `CodesContext`.
 *
 * @return {*}  {ICodesContext}
 */
export const useCodesContext = (): ICodesContext => {
  const context = useContext(CodesContext);

  if (!context) {
    throw Error(
      'CodesContext is undefined, please verify you are calling useCodesContext() as child of an <CodesContextProvider> component.'
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

/**
 * Returns an instance of `IObservationsContext` from `ObservationsContext`.
 *
 * @return {*}  {IObservationsContext}
 */
export const useObservationsContext = (): IObservationsContext => {
  const context = useContext(ObservationsContext);

  if (!context) {
    throw Error(
      'ObservationsContext is undefined, please verify you are calling useObservationsContext() as child of an <ObservationsContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IObservationsPageContext` from `ObservationsPageContext`.
 *
 * @return {*}  {IObservationsPageContext}
 */
export const useObservationsPageContext = (): IObservationsPageContext => {
  const context = useContext(ObservationsPageContext);

  if (!context) {
    throw Error(
      'ObservationsPageContext is undefined, please verify you are calling useObservationsPageContext() as child of an <ObservationsPageContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IObservationsTableContext` from `ObservationsTableContext`.
 *
 * @return {*}  {IObservationsTableContext}
 */
export const useObservationsTableContext = (): IObservationsTableContext => {
  const context = useContext(ObservationsTableContext);

  if (!context) {
    throw Error(
      'ObservationsTableContext is undefined, please verify you are calling useObservationsTableContext() as child of an <ObservationsTableContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ITelemetryDataContext` from `TelemetryDataContext`.
 *
 * @return {*}  {ITelemetryDataContext}
 */
export const useTelemetryDataContext = (): ITelemetryDataContext => {
  const context = useContext(TelemetryDataContext);

  if (!context) {
    throw Error(
      'TelemetryDataContext is undefined, please verify you are calling useTelemetryDataContext() as child of an <TelemetryTableContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ITelemetryTableContext` from `TelemetryTableContext`.
 *
 * @return {*}  {ITelemetryTableContext}
 */
export const useTelemetryTableContext = (): IAllTelemetryTableContext => {
  const context = useContext(TelemetryTableContext);

  if (!context) {
    throw Error(
      'TelemetryTableContext is undefined, please verify you are calling useTelemetryTableContext() as child of an <TelemetryTableContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ITaxonomyContext` from `TaxonomyContext`.
 *
 * @return {*}  {ITaxonomyContext}
 */
export const useTaxonomyContext = (): ITaxonomyContext => {
  const context = useContext(TaxonomyContext);

  if (!context) {
    throw Error(
      'TaxonomyContext is undefined, please verify you are calling useTaxonomyContext() as child of an <TaxonomyContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IAnimalPageContext` from `AnimalPageContext`.
 *
 * @return {*} {IAnimalPageContext}
 */
export const useAnimalPageContext = (): IAnimalPageContext => {
  const context = useContext(AnimalPageContext);

  if (!context) {
    throw Error(
      'AnimalPageContext is undefined, please verify you are calling useAnimalPageContext() as child of an <AnimalPageContextProvider> component.'
    );
  }

  return context;
};
