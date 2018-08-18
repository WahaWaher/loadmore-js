jQuery LoadMore Plugin <sup>1.0.2</sup>
-------
_Динамическая подгрузка контента на страницу из директории на сервере средствами AJAX. Плагин сканирует указанную директорию на наличие файлов, забирает их содержимое(или ссылки) и подгружает на страницу по событию. Отличное решение для насыщенных контентом LandingPage, которое разгрузит страницу и упростит процесс редактирования/добавления контента администратору._

* Поддерживаемые форматы файлов: **txt**, **html**, **php** + изображения: **jpg**, **png**
* Легко настраиваемая анимация появления блоков с контентом.
* Гибкий прелоадер (инит, отдельная запись, кнопка "Загрузить еще").
* SEO рекомендации для поисковых систем Yandex, Google. Генерация полной HTML-версии страницы (в разработке).

## Пакетные менеджеры:
```sh
# Bower
bower install --save loadmore-js
```

## Подключение:

1. Подключить jQuery и jquery.loadmore.js
```html
<!-- jQuery -->
<script src="libs/jquery/dist/jquery.min.js"></script>

<!-- jquery.loadmore.js -->
<script src="dist/jquery.loadmore.js"></script>
```
2. Задать HTML-элемент, в который будет помещен контент.
```html
<div class="example-posts"></div>
```
3. В корневой каталог сайта скопировать файл: **ajax-loadmore.php**
4. Тут же в корневом каталоге создать папку **"parts"** и поместить в нее файлы с необх. содержимым. 
4. Инициализировать плагин на элементе(группе элементов):
```javascript
$('.example-posts').loadMore({
	// Параметры...
});
```

## Примеры использования:
Страница с примерами demo/index.html

## Параметры:

Опция | Тип | Поум. | Описание
------ | ------ | --------- | ---------
`url` | string | 'ajax-loadmore.php' | Путь к PHP-обработчику
`path` | string | 'parts/' | Путь к каталогу с файлами записей
`ignore` | array | [] | Имена фалов в катологе "path", которые буду игнорированы
`layout` | object | [см.<sup>1</sup>](#option-tip-layout) | Элементы разметки
`showFirst` | number | 3 | Отображать кол-во записей при загрузке страницы
`showMore` | number | 3 | Отображать кол-во записей при послед. подгрузках
`firstPostDelay` | number | 0 | Задержка перед отображением первой записи из группы, мс
`nextPostDelay` | number | 0 | Задержка перед отображением каждой следующей записи из группы, мс

_<div id="option-tip-layout">1. Элементы разметки:</div>_

```javascript
layout: { // Элементы разметки
	posts: $('<div/>'), // Контейнер для записей
	postWrap:  $('<div/>'), // Обертка для каждой записи
	postImg: $('<img>').attr('alt', 'lm-img'), // html для изображений
	controls:  $('<div/>'), // Контейнер для эл-ов управления
	button: {
		element: $('<button/>', { // Кнопка "Загрузить еще"
			text: 'Загрузить еще' // Текст кнопки
		}),
		event: 'click', // Событие на кнопке, при котором будет сработана подгрузка
	},
	preloader: {
		element: $('<svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a"><stop stop-color="#222" stop-opacity="0" offset="0%"/><stop stop-color="#222" stop-opacity=".631" offset="63.146%"/><stop stop-color="#222" offset="100%"/></linearGradient></defs><g transform="translate(1 1)" fill="none"><path d="M36 18c0-9.94-8.06-18-18-18" stroke="#222" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></path><circle fill="#222" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></circle></g></svg>'), // Прелоадер
		onInit: false, // Отображать прелоадер при инициализации
		onEachItem: false, // Отображать прелоадер на каждой записи
		onButton: true // Отображать прелоадер в кнопке
	},
}
```

## Функции обратного вызова:

Callback | Аргументы | Поум. | Описание
------ | ---- | ------- | -----------
`beforeInit` | \[sets:object\] | n/a | Перед началом инициализации.
`afterInit` | \[sets:object\] | n/a | После инициализации.
`onInitError` | \[sets:object\] | n/a | Ошибка отправки Ajax-запроса при инициализации
`beforeShowItem` | \[sets:object, curPost:object \] | n/a | Перед публикацией отдельной записи
`afterShowItem` | \[sets:object, curPost:object \] | n/a | После публикации отдельной записи
`onShowItemError` | \[sets:object\] | n/a | Ошибка отправки Ajax-запроса, при публикации отдельной записи
`beforeShowItems` | \[sets:object\] | n/a | Перед показом группы записей в кол-ве `showMore` шт.
`afterShowItems` | \[sets:object\] | n/a | После показа группы записей в кол-ве `showMore` шт.

```javascript
$('.example-posts').loadMore({
	beforeInit:         function(sets) {},
	afterInit:          function(sets) {},
	onInitError:        function(sets) {},
	beforeShowItem:     function(sets, curPost) {},
	afterShowItem:      function(sets, curPost) {},
	onShowItemError:    function(sets) {},
	beforeShowItems:    function(sets) {},
	afterShowItems:     function(sets) {}
});
```
## Публичные методы:
Метод | Описание
----------- | -----------
`init` | Инициализация
`reinit` | Реинициализация
`destroy` | Вернуть состояние до инита
`post` | Публикация следующих записей

```javascript
// Инициализация
var options = {};
$('.example-posts').loadMore('init', options);

// Реинициализация
$('.example-posts').loadMore('reinit'); // Реинит с текущими параметрами

var newOptions = {}; // Объект с новыми параметрами
$('.example-posts').loadMore('reinit', newOptions); // Реинит с новыми параметрами

// Вернуть состояние элементa/ов до инита
$('.example-posts').loadMore('destroy');

// Публикация записей
var amountOfPosts = 10; // Кол-во записей, которые будут опубликованы
$('.example-posts').loadMore('post', amountOfPosts);

// Если не указать второй аргумент, будет опубликовано записей в кол-ве `showMore`
$('.example-posts').loadMore('post');
```

## Заметки:
### Анимация:
#### Анимация появления записей с [animate.css](https://github.com/daneden/animate.css):

```css
.custom-animation-params {
	-webkit-animation-duration: .45s;
	        animation-duration: .45s; /* Продолжительность */
	-webkit-animation-delay: .45s;
	        animation-delay: .45s; /* Задержка */
	-webkit-animation-iteration-count: infinite;
	        animation-iteration-count: infinite; /* Анимационный цикл */
}
```

```javascript
$('.example-posts').loadMore({
	beforeShowItem: function(sets, curPost) {
		curPost.content.addClass('animated custom-animation-params');
	},
	afterShowItem: function(sets, curPost) {
		curPost.content.addClass('zoomIn'); // Все эффекты: https://daneden.github.io/animate.css
	}
});
```
#### Анимация появления записей методами jQuery:
```javascript
$('.example-posts').loadMore({
	beforeShowItem: function(sets, curPost) {
		curPost.content.hide();
	},
	afterShowItem: function(sets, curPost) {
		curPost.content.fadeIn();
	}
});
```

### Дата-атрибуты:
Параметры в data-атрибуте имеют наивысший приоритет. Они переопределят параметры по умолчанию, а так же пользовательские параметры заданные при инициализации.
```javascript
	// Инициализация группы элементов
	$('.example-posts').loadMore();
```
```html
	<!-- Переопределение параметров для отдельных эл-ов через Data-атрибут: -->
	<div class="example-posts" data-loadmore="{
		path: 'parts/1',
		showFirst: 3,
	}"></div>
	<div class="example-posts" data-loadmore="{
		path: 'parts/2',
		showFirst: 5,
	}"></div>
```

### Замена &lt;img&gt; на background-image при публикации изображений:
```javascript
$('.example-posts').loadMore({
	beforeShowItem: function(sets, curPost) {
		
		if( curPost.format.match(/jpeg|jpg|png/igm) ) {
			// Запомнить ссылку на текущее изображение
			var curPostSrc = curPost.content.attr('src');
			// Замена контента
			curPost.content = $('<div/>', {
				class: 'lm-background'
			}).css({
				'min-height': '252px',
				'background-image': 'url('+ curPostSrc +')',
				'background-size': 'cover'
			});
		}
		
	}
});
```
### Переопределение параметров по умолчанию:
```javascript
	// Переопределение параметров по умолчанию:
	$.fn.loadMore.defaults = {};
	
	// Например:
	$.fn.loadMore.defaults = {
		showMore: 15 // изменит станд. значение пар-ра showMore
	};
```

## Зависимости:
- [jQuery](http://jquery.com/download/)

## Требования
- jQuery версия 1.9.1 или выше

## История изменений:
### 1.0.2 - 18.08.2018
- Добавлена поддержка цепочек вызовов
- Незначительные изменения в наименовании некоторых переменных
- Некоторые правки в readme.md

## Лицензия (MIT)
Copyright (c) 2018 Sergey Kravchenko

Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, а также лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.
