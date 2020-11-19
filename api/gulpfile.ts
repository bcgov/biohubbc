import del from 'del';
import gulp from 'gulp';
import ts from 'gulp-typescript';

// Clean (delete) the dist folder
gulp.task('clean', () => {
  return del(['./dist']);
});

// Compile the api and create the dist folder
gulp.task('ts-server', () => {
  const tsProject = ts.createProject('tsconfig.json');
  const tsResult = tsProject.src().pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

// Clean the dist folder, and build the api dist
gulp.task('build', gulp.series('clean', 'ts-server'));
