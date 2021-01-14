const {src, dest, watch, parallel, series} = require('gulp');

// Рабочая папка проекта
// const appFolder = require("path").basename(__dirname);
const appFolder = "app/"
// Исходная папка проекта
const srcFolder = "src/";
// Выходная папка проекта
const distFolder = "dist/";

// Список браузеров для префиксера
const browsers = [
  'Android >= 4',
  'Chrome >= 20',
  'Firefox >= 24',
  'Explorer >= 11',
  'iOS >= 6',
  'Opera >= 12',
  'Safari >= 6',
];

// Пути к папкам проекта
const path = { 
  // Пути выгрузки файлов выходного проекта 
  dist: {
    html: distFolder,
		js: distFolder + "js/",
		css: distFolder + "css/",
		images: distFolder + "images/",
		fonts: distFolder + "fonts/"
  },
  // Пути выходного проекта
  work: {
    html: appFolder,
		js: appFolder + "js/",
		css: appFolder + "css/",
		images: appFolder + "images/",
		fonts: appFolder + "fonts/"
  },
  // Пути исходного проекта 
  src : {
    favicon: srcFolder + "favicon.{jpg,png,svg,gif,ico,webp}",
    html: [srcFolder + "*.html", "!" + srcFolder + "_*.html"],
    js: srcFolder + "js/main.js",
		css: srcFolder + "scss/style.scss",
		images: [srcFolder + "images/**/*.{jpg,png,svg,gif,ico,webp}", "!**/favicon.*"],
		fonts: srcFolder + "/fonts/**/*"
  },
  // Пути по которым происходит отслеживание файлов исходного проекта
  watch: {
    html: srcFolder + "**/*.html",
    scss: srcFolder + "scss/**/*.scss",
    js: srcFolder + "js/**/*.js",
    images: srcFolder + "images/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: srcFolder + "/fonts/**/*",
    favicon: srcFolder + "favicon.{jpg,png,svg,gif,ico,webp}"
  }
}

// Обновление браузера
const browsersync = require('browser-sync').create();
// Конвертация Sass/Scss в css
const scss        = require('gulp-sass');
// Добавление префиксов
const prefixer    = require('gulp-autoprefixer');
// Группирует медиа-запросы
const groupmedia = require("gulp-group-css-media-queries");
// Минификация СSS стилей
const cleancss = require("gulp-clean-css");
// Переименование файлов
const rename      = require('gulp-rename');
// Объединение файлов
const fileinclude = require("gulp-file-include");
// Минификация JS скриптов
const uglify      = require('gulp-uglify');
// Конвертация последних версий языка ECMAScript, в более старый
const babel       = require('gulp-babel');
// Сжатие картинок
const imagemin    = require('gulp-imagemin');
const recompress  = require('imagemin-jpeg-recompress');
const pngquant    = require('imagemin-pngquant');
// Проверяет стоит ли обрабатывать файлы, если они уже имеются в исходной папке 
const newer = require('gulp-newer');
// Удаление файлов и папок
const del         = require('del');

// Функция обработки HTML
function html() { 
  return src(path.src.html)
  .pipe(fileinclude())
  .pipe(dest(path.work.html))
  .pipe(browsersync.stream());
}

// Функция обработки CSS
function css() { 
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(groupmedia())
    .pipe(prefixer({
      overrideBrowserslist: ['last 8 versions'],
      browsers: browsers,
      grid: true,
      cascade: true
    }))
    .pipe(dest(path.work.css))
    .pipe(cleancss())
    .pipe(rename({
				extname: ".min.css"
			})
    )
    .pipe(dest(path.work.css))
    .pipe(browsersync.stream());
}

// Функция обработки JS
function js() { 
  return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.work.js))
		.pipe(uglify())
		.pipe(rename({
				suffix: ".min",
				extname: ".js"
			})
		)
		.pipe(dest(path.work.js))
		.pipe(browsersync.stream());
}

// Функция обработки картинок
function images() {
  return src(path.src.images)
    .pipe(newer(path.work.images))
    .pipe(dest(path.work.images))
    .pipe(browsersync.stream());
}

// Функция обработки favicon
function favicon() {
	return src(path.src.favicon)
		.pipe(rename({
				extname: ".ico"
			})
		)
		.pipe(dest(path.work.html))
}

// Функция обработки шрифтов 
function fonts() { 
  return src(path.src.fonts)
    .pipe(newer(path.work.fonts))
    .pipe(dest(path.work.fonts))
    .pipe(browsersync.stream());
}

// Функция обработки HTML для выходного проекта
function htmlBuild() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.dist.html));
}

// Функция обработки CSS для выходного проекта
function cssBuild() { 
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(groupmedia())
    .pipe(prefixer({
      overrideBrowserslist: ['last 8 versions'],
      browsers: browsers,
      grid: true,
      cascade: true
    }))
    .pipe(cleancss())
    .pipe(rename({
				suffix: ".min",
				extname: ".css"
			})
    )
    .pipe(dest(path.dist.css))
}

// Функция обработки JS для выходного проекта
function jsBuild() { 
  return src(path.src.js)
  .pipe(fileinclude())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(uglify())
  .pipe(
    rename({
      suffix: ".min",
      extname: ".js"
    })
  )
  .pipe(dest(path.dist.js));
}

// Функция обработки картинок для выходного проекта
function imagesBuild() {
  return src(path.src.images)
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    interlaced: true,
    optimizationLevel: 3 // 0 to 7
  }))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    interlaced: true,
    optimizationLevel: 3 // 0 to 7
  },
    [
      recompress({
        loops: 6,
        min: 50,
        max: 90,
        quality: 'high',
        use: [pngquant({
          quality: [0.7, 0.9],
          strip: true,
          speed: 1
        })],
      }),
      imagemin.gifsicle(),
      imagemin.optipng(),
      imagemin.svgo()
  ]))
  .pipe(dest(path.dist.images))
  .pipe(browsersync.stream());
}

// Функция обработки favicon для выходного проекта
function faviconBuild() {
	return src(path.src.favicon)
		.pipe(rename({
				extname: ".ico"
			})
		)
		.pipe(dest(path.dist.html))
}

 // Функция обработки шрифтов для выходного проекта
function fontsBuild() { 
  return src(path.src.fonts, {base: 'src'})
  .pipe(dest(path.dist.fonts));
} 

// Функция для настройки параметров обновления браузера при изменение файлов исходного проекта
function browserSync() {
  browsersync.init({
    server: {
      baseDir: appFolder
    },
    port: 5500,
    ui: {
      port: 5501
    },
    notify: false
  })
}

// Функция отлеживания изменений файлов проекта
function watchFiles() { 
  watch(path.watch.html, html);
	watch(path.watch.scss, css);
	watch(path.watch.js, js);
	watch(path.watch.images, images);
	watch(path.watch.fonts, fonts);
  watch(path.watch.favicon, favicon);
}

// Очищения(удаление) выходной папки проекта 
function clean() { 
  return del(distFolder);
}

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.favicon = favicon;

exports.htmlBuild = htmlBuild;
exports.cssBuild = cssBuild;
exports.jsBuild = jsBuild;
exports.imagesBuild = imagesBuild;
exports.fontsBuild = fontsBuild;
exports.faviconBuild = faviconBuild;

exports.browserSync = browserSync;
exports.watchFiles = watchFiles;
exports.clean = clean;

exports.build = series(clean, htmlBuild, cssBuild, jsBuild, imagesBuild, fontsBuild, faviconBuild);
exports.default = parallel(html, css, js, images, fonts, favicon, browserSync, watchFiles);