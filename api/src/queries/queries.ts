import administrativeActivity from './administrative-activity';
import codes from './codes';
import database from './database';
import dwc from './dwc';
import occurrence from './occurrence';
import permit from './permit';
import project from './project';
import projectParticipation from './project-participation';
import publicQueries from './public';
import search from './search';
import security from './security';
import spatial from './spatial';
import survey from './survey';
import users from './users';

export const queries = {
  administrativeActivity,
  codes,
  database,
  dwc,
  occurrence,
  permit,
  project,
  projectParticipation,
  public: publicQueries,
  search,
  security,
  spatial,
  survey,
  users
};
