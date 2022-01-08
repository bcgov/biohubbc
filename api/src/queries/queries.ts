import administrativeActivity from './administrative-activity';
import codes from './codes';
import database from './database';
import permit from './permit';
import project from './project';
import projectParticipation from './project-participation';
import publicQueries from './public';
import search from './search';
import security from './security';
import spatial from './spatial';
import users from './users';

export const queries = {
  administrativeActivity,
  codes,
  database,
  permit,
  project,
  projectParticipation,
  public: publicQueries,
  search,
  security,
  spatial,
  users
};
