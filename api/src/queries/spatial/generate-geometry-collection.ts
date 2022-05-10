import { Feature } from 'geojson';
import { SQL, SQLStatement } from 'sql-template-strings';

/*
  Function to generate the SQL for insertion of a geometry collection
*/
export function generateGeometryCollectionSQL(geometry: Feature[]): SQLStatement {
  if (geometry.length === 1) {
    const geo = JSON.stringify(geometry[0].geometry);

    return SQL`public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))`;
  }

  const sqlStatement: SQLStatement = SQL`public.ST_AsText(public.ST_Collect(array[`;

  geometry.forEach((geom: Feature, index: number) => {
    const geo = JSON.stringify(geom.geometry);

    // as long as it is not the last geometry, keep adding to the ST_collect
    if (index !== geometry.length - 1) {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo})),
      `);
    } else {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))]))
      `);
    }
  });

  return sqlStatement;
}
