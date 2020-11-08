const gulp = require('gulp');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const rev = require('gulp-rev');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const del = require('del');
const fontmin = require('gulp-fontmin-woff2'); 

gulp.task('css', function(done){
    console.log('minifying css...');
    gulp.src('./assets/**/*.scss', '!./assets/public/**/*.scss')
    .pipe(sass())
    .pipe(cssnano())
    .pipe(gulp.dest('./assets/public/assets'));

     gulp.src('./assets/**/*.css', '!./assets/public/**/*.css')
    .pipe(rev())
    .pipe(gulp.dest('./assets/public/assets'))
    .pipe(rev.manifest({
        base:'./assets/public/assets',
        merge: true
    }))
    .pipe(gulp.dest('./assets/public/assets'));
    done();
});


// run now
gulp.task('js', function(done){
    console.log('minifying js...');
   
     gulp.src('./assets/**/*.js','!./assets/public/**/*.js')
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./assets/public/assets'))
    .pipe(rev.manifest({
        base:'./assets/public/assets',
        merge: true
    }))
    .pipe(gulp.dest('./assets/public/assets'));
    done()
});
gulp.task('images', function(done){
    console.log('compressing images...');
    gulp.src('./assets/**/*.+(png|jpg|gif|svg|jpeg|jfif)','!/assets/**/*.+(png|jpg|gif|svg|jpeg|jfif)')
    .pipe(imagemin())
    .pipe(rev())
    .pipe(gulp.dest('./assets/public/assets'))
    .pipe(rev.manifest({
        base:'./assets/public/assets',
        merge: true
    }))
    .pipe(gulp.dest('./assets/public/assets'));
    done();
});

// gulp.task('fonts', function(done) {
//     console.log('compressing fonts...');
//     gulp.src('./assets/**/*.+(ttf|eot|woff|woff2)','!./assets/public/**/*.+(ttf|eot|woff|woff2)')
//         .pipe(fontmin())
//         .pipe(rev())
//     .pipe(gulp.dest('./assets/public/assets'))
//     .pipe(rev.manifest({
//         base:'./assets/public/assets',
//         merge: true
//     }))
//     .pipe(gulp.dest('./assets/public/assets'));
//     done();
// });


// empty the public/assets directory
gulp.task('clean:assets', function(done){
    del.sync('./assets/public/assets');
    done();
});

gulp.task('build', gulp.series('clean:assets', 'css', 'js', 'images'), function(done){
    console.log('Building assets');
    done();
});

