import { expect } from 'chai';
import { _extractProjects } from './projects';

describe('Unit Testing: GET /projects - Test database query result parsing', () => {
  it('should return empty array if query result was empty', function () {
    const rows: any[] = [];
    const projects: any[] = _extractProjects(rows);

    expect(projects).to.be.an('array');
    expect(projects).to.have.length(0);
  });

  it('should return an array of one element if query result contains one row', function () {
    const rows: any[] = [];

    rows.push({
      id: 1,
      name: 'Project BioHub',
      start_date: '2021/01/01',
      end_date: '2022/12/31',
      location_description: 'Here'
    });

    const projects: any[] = _extractProjects(rows);

    expect(projects).to.be.an('array');
    expect(projects).to.have.length(1);
    expect(projects[0]).to.have.property('name', 'Project BioHub');
  });
});
