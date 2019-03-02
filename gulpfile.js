var gulp 					= require('gulp'),
		gutil 				= require('gulp-util'),
		sass 					= require('gulp-sass'),
		browserSync 	= require('browser-sync'),
		concat 				= require('gulp-concat'),
		uglify 				= require('gulp-uglify'),
		minify 				= require('gulp-csso'),
		cmq						= require('gulp-merge-media-queries'),
		rename 				= require('gulp-rename'),
		del 					= require('del'),
		imagemin 			= require('gulp-imagemin'),
		svgmin				= require('gulp-svgmin'),
		cache					= require('gulp-cache'),
		autoprefixer 	= require('gulp-autoprefixer'),
		ftp						= require('vinyl-ftp'),
		notify				= require('gulp-notify');

//these vars are path to your files.
var myBase = 'app/';

//Project scripts

gulp.task('js', function() {
	return gulp.src([
		myBase + 'js/common.js', //Always at the end.
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest(myBase + 'js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: myBase
		},
		notify: false,
	});
});

gulp.task('sass', function() {
	return gulp.src(myBase + 'sass/**/*.scss')
	.pipe(sass().on('error', notify.onError()))
	.pipe(autoprefixer(['last 5 versions']))
	.pipe(gulp.dest(myBase + 'css'))
	.pipe(cmq({
      log: true
    }))
	.pipe(minify())
	.pipe(rename({suffix: '.min', prefix: ''}))
	.pipe(gulp.dest(myBase + 'css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch(myBase + 'sass/**/*.scss', ['sass']);
	gulp.watch(['libs/**/*.js', myBase + '/js/common.js'], ['js']);
	gulp.watch(myBase + '*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src(myBase + 'img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('svgmin', function() {
	return gulp.src(myBase + 'img/**/*.svg')
	.pipe(svgmin())
	.pipe(gulp.dest('dist/img/svg'));
});

gulp.task('build', ['removedist', 'imagemin','svgmin','sass', 'js'], function() {

	var buildFiles = gulp.src([
		myBase + '*.html',
		myBase + '.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		myBase + 'css/main.min.css',
		])
		.pipe(groupMedia())
		.pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		myBase + 'js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		myBase + 'fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);