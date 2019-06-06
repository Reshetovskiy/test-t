# gulp "Start project" web-friends
Сборка gulp

## Установка

```
npm i gulp gulp-uglify-es gulp-rename gulp-file-include gulp-env fancy-log gulp-util vinyl-ftp gulp-sourcemaps run-sequence gulp-zip gulp-useref gulp-htmlmin gulp-csso gulp-img-retina gulp-if gulp-inline-source gulp-autoprefixer gulp-bower gulp-connect gulp-cssmin gulp-filter gulp-imagemin gulp-sass gulp-livereload gulp-include gulp-uglify gulp.spritesmith gulp-svg-sprite gulp-svgmin gulp-cheerio gulp-replace gulp-plumber imagemin-pngquant opn rimraf -g

npm link gulp gulp-uglify-es gulp-rename gulp-file-include gulp-env fancy-log gulp-util vinyl-ftp gulp-sourcemaps run-sequence gulp-zip gulp-useref gulp-htmlmin gulp-csso gulp-img-retina gulp-if gulp-inline-source gulp-autoprefixer gulp-bower gulp-connect gulp-cssmin gulp-filter gulp-imagemin gulp-sass gulp-livereload gulp-include gulp-uglify gulp.spritesmith gulp-svg-sprite gulp-svgmin gulp-cheerio gulp-replace gulp-plumber imagemin-pngquant opn rimraf
```

# или

```
npm i
```

### Скопируйте .env.example.json в .env.json внесите настройки хостинга

## Команды генерации кода

```
gulp build 
gulp test
gulp server
```
### для включение режима Retina использовать параметр --retina

## Тестирование
### для включения режима мапирования использовать параметр --sourcemaps
### для отключения режима кеширования использовать параметр --nocache
### для отключения режима защиты стилей и скриптов использовать параметр --noinline
### для отключения режима защиты разметки использовать параметр --nohtmlm
### для отключения режима отложенной загрузки стилей использовать параметр --nodefer

## Bower

```
bower i
```

Установщик bower нужно запускать из корня, устанавливаться пакеты будут в `bower_components`, а компелироваться в `"build/vendor"`

## Структура проекта
```
src/fonts - шрифты
src/img/work - все картинки кроме иконок для спрайтов, будет скомпелировано в `"build/img"`
src/img/icons - все картинки иконок для спрайтов, будет скомпелировано в `src/work/icons.png` + `src/sass/partials/icons.scss`
src/img/icons - все картинки иконок SVG, будут скомпелированы в `src/work/sprite.svg` + `src/sass/partials/svg_sprite.scss`
src/sass - стили, скомпелируется в `"build/css"`
src/js - скрипты, скомпелируется в `"build/js"`
pages - html файлы, скомпелируются файлы из корня `src` в корень `build`
```

## Использование спрайта SVG

```
@@include('mixins/svg-icon.html', {"name": "corrected", "class": "color-red"})
```
Где name - имя файла иконки, а class - дополнительные классы

## Деплой на FTP

```
gulp build
gulp test
gulp deploy
```

## Создание архива приложения

### файл app.zip будет доступен в папке `app`

```
gulp zip
```

### Подключение к Laravel

Компилируем верстку
```
$ gulp build
$ gulp test --noinline --nohtmlmin
```

Копируем ```./webpack-example/webpack.mix.itsclient.js``` в директорию родителя
```
$ cp ./webpack-example/webpack.mix.itsclient.js ../
$ cd ../
```
Добавляем в Laravel поддержку этого файла, в файл webpack.mix.js вставляем строки 

```
if (process.env.section) {
    require(`${__dirname}/webpack.mix.${process.env.section}.js`);
}
```
Добавляем строку в файл ```package.json``` строки в серкцию ```scripts``` 
```
"itsclient": "cross-env process.env.section=itsclient NODE_ENV=production node_modules/webpack/bin/webpack.js --progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js"
```

Запускаем команду ```npm run itsclient```

Подключаем в layouts

Стили:
```
<link rel="stylesheet" href="{{ asset('its-client/css/plugins.css') }}">
<link rel="stylesheet" href="{{ asset('its-client/css/style.css') }}">
или
<link rel="stylesheet" href="{{ asset('its-client/css/style.min.css') }}">
```

Скрыпты:
```
<script src="{{ asset('its-client/js/plugins.js') }}"></script>
<script src="{{ asset('its-client/js/script.js') }}"></script>
или
<script src="{{ asset('its-client/js/script.min.js') }}"></script>
```
