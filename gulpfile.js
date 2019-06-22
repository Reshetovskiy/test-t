'use strict';

var gulp          = require('gulp'),
	rigger        = require('gulp-include'),
	rename        = require('gulp-rename'),
	fileInclude   = require('gulp-file-include'),
	prefixer      = require('gulp-autoprefixer'),
	sass          = require('gulp-sass'),
	cssmin        = require('gulp-cssmin'),
    uglify        = require('gulp-uglify'),
    uglifyEs      = require('gulp-uglify-es').default,
	imagemin      = require('gulp-imagemin'),
	pngquant      = require('imagemin-pngquant'),
	spritesmith	  = require('gulp.spritesmith'),
	connect       = require('gulp-connect'),
	opn           = require('opn'),
	rimraf        = require('rimraf'),
    bower         = require('gulp-bower'),
    svgSprite     = require('gulp-svg-sprite'),
	svgmin        = require('gulp-svgmin'),
	cheerio       = require('gulp-cheerio'),
	replace       = require('gulp-replace'),
	plumber       = require('gulp-plumber'),
    filter        = require('gulp-filter'),
    inlinesource  = require('gulp-inline-source'),
    log           = require('fancy-log'),
    imgRetina     = require('gulp-img-retina'),
    htmlmin       = require('gulp-htmlmin'),
    csso          = require('gulp-csso'),
    ftp           = require('vinyl-ftp'),
    gutil         = require('gulp-util'),
    zip           = require('gulp-zip'),
    useref        = require('gulp-useref'),
    runSequence   = require('run-sequence'),
    sourcemaps    = require('gulp-sourcemaps'),
    env           = require('gulp-env'),
    gulpif        = require('gulp-if');

var versionScripts = new Date();

versionScripts = parseInt(versionScripts.getFullYear() + '' + versionScripts.getMonth() + '' + versionScripts.getDay() + '' + versionScripts.getHours());

runSequence.options.ignoreUndefinedTasks = true;

const arg = (argList => {
    if (argList !== undefined) {
        let arg = {}, a, opt, thisOpt, curOpt;
        for (a = 0; a < argList.length; a++) {
            thisOpt = argList[a].trim();
            opt = thisOpt.replace(/^\-+/, '');

            if (opt === thisOpt) {
                if (curOpt) arg[curOpt] = opt;
                curOpt = null;
            }
            else {
                curOpt = opt;
                arg[curOpt] = true;
            }
        }
        return arg;
    }
    return false;
})(process.argv);

var buildpath = 'build',
    testpath = 'test',
    appPath = 'app/';

var retinaOpts = {};

var path = {
    build: {
        html:   buildpath + '/',
        js:     buildpath + '/js/',
        css:    buildpath + '/css/',
        img:    buildpath + '/img/',
        fonts:  buildpath + '/fonts/',
        bower:  buildpath + '/vendor/'
    },
    test: {
        html:   testpath + '/',
        img:    testpath + '/img/',
        fonts:  testpath + '/fonts/',
        css:  testpath + '/css/',
        js:  testpath + '/js/'
    },
    src: {
        html:                'src/templates/*.html',
        js:                  'src/js/script.js',
        style:               'src/scss/style.scss',
        img:                 'src/img/work/**/*.*',
        imgicons:            'src/img/icons/*.png',
        svgicons:            'src/img/icons/*.svg',
        fonts:               'src/fonts/**/*.*',
        bower:               'bower_components/**/*.*',
        path_sasspartials:   'src/scss/partials/',
        path_sasstemplates:  'src/scss/templates/',
        path_img:            'src/img/work/'
    },
    watch: {
        html:   'src/templates/**/*.html',
        bower:  'bower_components/**/*.*',
        js:     'src/js/**/*.js',
        style:  'src/scss/**/*.scss',
        img:    [
        	'src/img/**/*.*',
        	'!src/img/work/icons.png',
        	'!src/img/work/icons.svg'
        ],
        fonts:  'src/fonts/**/*.*'
    },
    clean: './build',
    cleanTest: './test'
};

var server = {
    host: 'localhost',
    port: '2288'
};

gulp.task('clean:build', function (cb) {
    return rimraf(path.clean, cb);
});

gulp.task('clean:test', function (cb) {
    return rimraf(path.cleanTest, cb);
});

gulp.task('clean', [
    'clean:test',
    'clean:build'
]);

gulp.task('webserver', function() {
    connect.server({
        host: server.host,
        port: server.port,
        livereload: true
    });
});

gulp.task('openbrowser', function() {
    opn( 'http://' + server.host + ':' + server.port + '/' + buildpath );
});

gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(fileInclude())
        .pipe(gulpif(arg.retina, imgRetina(retinaOpts)))
        .pipe(replace("$$version$$", "?v=" + versionScripts))
        .pipe(gulp.dest(path.build.html))
        .pipe(connect.reload());
});

gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(connect.reload());
});

gulp.task('style:build', function () {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(gulp.dest(path.build.css))
        .pipe(connect.reload());
});

gulp.task('sprite', function () {
    var spriteData = gulp.src(path.src.imgicons)
        .pipe(spritesmith({
            imgName: 'icons.png',
            cssName: 'icons.scss',
            algorithm: 'binary-tree',
            cssFormat: 'css',
            cssTemplate: 'css_template_icons.css.mustache',
        }));

    spriteData.img.pipe(gulp.dest(path.src.path_img));
    spriteData.css.pipe(gulp.dest(path.src.path_sasspartials));
    return;
});

gulp.task('svg:sprite:build', function () {
    return gulp.src(path.src.svgicons)
        .pipe(plumber())
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg',
                    render: {
                        scss: {
                            dest: '../../../../' + path.src.path_sasspartials + 'svg_sprite.scss',
                            template: 'css_template_svg_icons.mustache'
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(path.src.path_img));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(plumber())
        .pipe(gulp.dest(path.build.img))
        .pipe(connect.reload());

    gulp.run('sprite');
    gulp.run('svg:sprite:build');
    return;
});

gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('bower:build', function() {
	var mfilter = filter([
            '**/*.*',
            '!**/src/**/*.*',
            '!**/*.json',
            '!**/.gitignore',
            '!**/*Gulpfile.js',
            '!**/*.md',
            '!**/*.json',
            '!**/.jshintrc',
            '!**/*.txt',
            '!**/*.psd',
            '!**/*.scss',
            '!**/*.sass',
            '!**/*.less',
            '!**/*.map',
            '!**/*.md',
    ]);
    var cssfilter = filter(['**/*.css'], {restore: true});
    var jsfilter = filter(['**/*.js'], {restore: true});

    return gulp.src(path.src.bower)
        .pipe(cssfilter)
        .pipe(cssfilter.restore)
        .pipe(mfilter)
        .pipe(gulp.dest(path.build.bower))
});

gulp.task('watch', function() {
    gulp.watch(path.watch.html,  ['html:build']);
    gulp.watch(path.watch.js,    ['js:build']);
    gulp.watch(path.watch.style, ['style:build']);
    gulp.watch(path.watch.img,   ['image:build', 'sprite', 'svg:sprite:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
    gulp.watch(path.watch.bower, ['bower:build', 'style:build']);
});

gulp.task('build', [
    'image:build',
    'fonts:build',
    'bower:build',
    'js:build',
    'style:build',
    'html:build'
]);

gulp.task('build:test', function () {
    gulp.src(path.build.html + '*.html')
        .pipe(gulpif(arg.nocache, replace('<meta http-equiv="Cache-Control" content="no-cache">', '')))
        .pipe(gulpif(arg.nodefer, replace('<noscript id="deferred-styles">', '')))
        .pipe(gulpif(arg.nodefer, replace('</noscript>', '')))
        .pipe(gulpif(arg.noinline, replace(' inline', '')))
        .pipe(useref())
        .pipe(gulpif(arg.sourcemaps, sourcemaps.init()))
        .pipe(gulpif(!arg.noinline, inlinesource()))
        .pipe(gulpif('*.css', csso()))
        .pipe(gulpif('*.css', cssmin()))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif(!arg.nohtmlmin, gulpif('*.html', htmlmin({
            collapseWhitespace: true,
            conservativeCollapse: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))))
        .pipe(gulpif(arg.sourcemaps, sourcemaps.write()))
        .pipe(gulp.dest(path.test.html));

    gulp.src(path.build.img + '**/*.*')
        .pipe(gulp.dest(path.test.img));

    gulp.src(path.build.fonts + '**/*.*')
        .pipe(gulp.dest(path.test.fonts));

    gulp.src(path.build.css + '**/*.*')
        .pipe(gulp.dest(path.test.css));

    gulp.src(path.build.js + '**/*.*')
        .pipe(gulp.dest(path.test.js));

    gulp.src(path.build.css + '**/*.*')
        .pipe(gulpif('*.css', csso()))
        .pipe(gulpif('*.css', cssmin()))
        .pipe(rename({ suffix: '.min'}))
        .pipe(gulp.dest(path.test.css));

    gulp.src(path.build.js + '**/*.*')
        .pipe(gulpif('*.js', uglifyEs()))
        .pipe(rename({ suffix: '.min'}))
        .pipe(gulp.dest(path.test.js));
});

gulp.task('test', function () {
    runSequence('build:test');
});

gulp.task('build:watch', [
    'image:build',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'bower:build',
    'watch'
]);

gulp.task('server', ['build', 'watch', 'webserver', 'openbrowser']);

gulp.task('default', ['build']);

gulp.task('env', function() {
    env({
        file: '.env'
    });
});

gulp.task('deploy', ['env'], function () {
    var path = process.env.APP_ENV === 'prod' ? buildpath : testpath;
    var conn = ftp.create( {
        host:     process.env.FTP_HOST,
        port:     process.env.FTP_PORT,
        user:     process.env.FTP_LOGIN,
        password: process.env.FTP_PASS,
        parallel: process.env.FTP_PARALLEL,
        log:      gutil.log
    } );

    var globs = [
        path + '/**/*.*'
    ];

    return gulp.src(globs, { base: './' + path, buffer: false })
        .pipe( conn.newer(process.env.FTP_DIR) )
        .pipe( conn.dest(process.env.FTP_DIR) );
});

gulp.task('zip', function (cb) {
    rimraf(appPath, cb);
    gulp.src([
        '!node_modules',
        '!node_modules/**',
        '!bower_components',
        '!bower_components/**',
        '!test',
        '!test/**',
        '!build',
        '!build/**',
        '!.vscode',
        '!.vscode/**',
        '!.idea',
        '!.idea/**',
        '!app',
        '!app/**',
        '!.git',
        '!.git/**',
        './**',
        '.gitignore',
        '.env.example.json'
        ])
        .pipe(zip('app.zip'))
        .pipe(gulp.dest(appPath))
});
