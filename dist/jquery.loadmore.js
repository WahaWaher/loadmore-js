/**
 * jQuery.loadMore
 * Version: 1.0.2
 * Repo: https://github.com/WahaWaher/loadmore-js
 * Author: Sergey Kravchenko
 * Contacts: wahawaher@gmail.com
 * License: MIT
 */

;(function($) {

	var methods = {

		init: function(options) {

			var  defaults = $.extend(true, {
				url: 'ajax-loadmore.php', // Путь к PHP-обработчику
				path: 'parts/', // Путь к каталогу с файлами записей
				ignore: [], // Имена фалов в катологе "path", которые буду игнорированы

				layout: { // Элементы разметки
					posts: $('<div/>'), // Контейнер для записей
					postWrap:  $('<div/>'), // Обертка для каждой записи
					postImg: $('<img>').attr('alt', 'lm-img'), // html для изображений
					controls:  $('<div/>'), // Контейнер для эл-ов управления
					button: {
						element: $('<button/>', { // Кнопка "Загрузить еще"
							text: 'Загрузить еще'
						}),
						event: 'click', // Собитие на кнопке, при котором будет сработана подгрузка
						// genBehavior: true 
					},
					preloader: {
						element: $('<svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a"><stop stop-color="#222" stop-opacity="0" offset="0%"/><stop stop-color="#222" stop-opacity=".631" offset="63.146%"/><stop stop-color="#222" offset="100%"/></linearGradient></defs><g transform="translate(1 1)" fill="none"><path d="M36 18c0-9.94-8.06-18-18-18" stroke="#222" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></path><circle fill="#222" cx="36" cy="18" r="1"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/></circle></g></svg>'),
						onInit: false, // Отображать прелоадер при инициализации
						onEachItem: false, // Отображать прелоадер на каждой записи
						onButton: false // Отображать прелоадер в кнопке
					},
				},

				showFirst: 3, // Отображать кол-во записей при загрузке страницы
				showMore: 3,  // Отображать кол-во записей при след. подгрузке
				firstPostDelay: 0, // Задержка перед отображением первой записи из группы, мс
				nextPostDelay: 0, // Задержка перед отображением каждой следующей записи из группы, мс

				beforeInit:         function() {},
				afterInit:          function() {},
				onInitError:        function() {},
				beforeShowItem:     function() {},
				afterShowItem:      function() {},
				onShowItemError:    function() {},
				beforeShowItems:    function() {},
				afterShowItems:     function() {}

			}, $.fn.loadMore.defaults);

			this.each(function() {
				var $ths = $(this);

				if( $ths.data('_init') == true ) return false;

				$ths.data('defaults', defaults);
				$ths.data('options', options);

				var data = $ths.attr('data-loadmore');
				data = eval('(' + data + ')');
				if( typeof(data) != 'object') data = {};

				$ths.data('settings', $.extend(true, {}, defaults, options, data));
				var sets = $ths.data('settings'),
					 layout = sets.layout;

				// Callback: beforeInit()
				sets.beforeInit.call($ths, sets);

				// 1. ФОРМИРОВАНИЕ РАЗМЕТКИ
				layout.container = $ths.addClass('loadmore');

				layout.posts = layout.posts.clone()
											.addClass('lm-posts')
											.appendTo($ths);

				layout.controls = layout.controls.clone()
											.addClass('lm-controls')
											.appendTo($ths);

				layout.postWrap.addClass('lm-post-wrap');
				layout.postImg.addClass('lm-post-img');

				if( layout.preloader.element ) {
					layout.preloader.element = $('<div/>',{ class: 'lm-preloader' })
															.append(layout.preloader.element.clone());
				};

				// 2. ПОЛУЧЕНИЕ С СЕРВЕРА ИНФ. О ПОСТАХ 

				// Прелоадер. Инит. Вкл.									 
				if( layout.preloader.element && layout.preloader.onInit == true  ) {
					layout.container.append(layout.preloader.element.clone().addClass('lm-init-preloader'));
				}

				$.ajax({
					type: 'POST',
					url: sets.url,
					data: {
						target: 'init',
						get_first_posts: sets.showFirst,
						data: {
							path: sets.path,
							ignore: sets.ignore,
						}
					},
					success: function(initRes) {

						// Зенес. инф. о постах в настройки
						initRes = JSON.parse(initRes);
						sets.posts = initRes.posts;
						sets._itemsAll = initRes.all;

						// Отображ. первых постов
						methods.post.call($ths, sets.showFirst);

						// Прелоадер. Инит. Выкл.
						if( layout.preloader.element && layout.preloader.onInit == true  ) {
							$ths.find('.lm-init-preloader').remove();
						}

						// Кнопка "Загрузить еще"
						if( layout.button.element )
							layout.button.element = layout.button.element.clone(true)
																	.addClass('lm-btn load-more')
																	.appendTo(layout.controls);

						// Событие на кнопке "Загрузить еще"
						// ID для генерации уник.числа (пространство имен, обраб.)
						sets._nsid = randInt(10000000, 99999999);

						if( typeof(layout.button.element) == 'object' ) {
							layout.button.element.on(layout.button.event + '.lm-' + sets._nsid, function() {
								methods.post.call($ths, sets.showMore);
								return false;
							});
						}

						$ths.data('_init', true);
						// Callback: afterInit()
						sets.afterInit.call($ths, sets);
					},
					error: function(error) {
						sets.onInitError.call($ths, sets, error);
					}
				});

			});

			return $(this);

		},

		post: function(count) {
			var $ths = $(this), sets = $ths.data('settings'), layout = sets.layout;
			var _curItemsBefore = sets._itemsCur || 0; // постов отображено до вызова метода
			// count - кол-во следующих постов для отображения

			if( !sets.posts || (sets._itemsCur == sets._itemsAll && sets._itemsCur != 0) ) return false;
			if( !count ) count = sets.showMore;

			// Callback: beforeShowItems()
			sets.beforeShowItems.call($ths, sets);

			// Прелоадер на кнопке. Вкл.
			if( layout.button.element && layout.preloader.element && layout.preloader.onButton ) {
				 var btn = layout.button.element,
					  prl = layout.preloader.element.clone().addClass('lm-btn-preloader');

				if( btn.find('.lm-btn-preloader').length == 0 )
					btn.append(prl.addClass('loading'));
					else btn.find('.lm-btn-preloader').addClass('loading');
			}

			// ОПРЕД. ПОСТЫ, КОТОРЫЕ НУЖНО ОТОБРАЗИТЬ, РЕЗЕРВ. МЕСТА
			var nextPostsObj = {}, i = 0, nextPostsRec = true;
			$.each(sets.posts, function(key, post) {

				if( post.status == 'onpage' ) return;
				if( count <= i ) return false;

				if( post.status != 'received' ) nextPostsRec = false;
				nextPostsObj[post.name] = post;

				// Обертки для записей
				var postWrap = layout.postWrap.clone()
											.attr('data-lm-postname', post.name);

				// Добав. прелоадер на каждой записи 									 
				if( layout.preloader.element && layout.preloader.onEachItem == true  )
					postWrap.append(layout.preloader.element.clone().addClass('lm-post-preloader'));

				// Помест. обертку для каждой записи в разметку
				layout.posts.append(postWrap);

				// Пометка записей в осн. массиве, как ONPAGE
				sets.posts[post.name].status = post.status = 'onpage';

				i++;
			});

			// console.log( 'Посты для отображения: ', nextPostsObj, nextPostsRec );

			// использ. ajax
			if( nextPostsRec === false ) {
			
				$.ajax({
					type: 'POST',
					url: sets.url,
					data: {
						target: 'get_posts_content',
						data: {
							path: sets.path,
							ignore: sets.ignore,
							posts: nextPostsObj
						}
					},
					success: function(gpcRes) {
						gpcRes = JSON.parse(gpcRes);
						nextPostsObj = gpcRes.posts;

						postsThrow(nextPostsObj);

					},
					error: function(error) {
						// Callback: onShowItemError
			   		sets.onShowItemError.call($ths, sets, error);
					},
				});

			// загружаем посты из настроек
			} else if( nextPostsRec === true ) {
				
				postsThrow(nextPostsObj);

			}
			
			// Функция вброса постов в разметку
			function postsThrow(posts) {
				// posts - Объект с постами
				
				var animDelay = sets.firstPostDelay;
				$.each(posts, function(key, post) {
				// post - объект текущего поста 

					var postFormat;
					if( post.format.match(/jpg|png|jpeg/igm) ) postFormat = 'img';
					if( post.format.match(/html|php|txt/igm) ) postFormat = 'txt';

					try {
						sets.posts[post.name].content = post.content = $(post.content);
					} catch(e) {
						if( e.message.match('unrecognized expression') )
							sets.posts[post.name].content = post.content = $('<div/>', {
								class: 'lm-post-autowrap',
								html: post.content
							});
					}

					// Для форматов: jpg|png|jpeg
					if( postFormat == 'img' ) {
						var imgUrl = window.origin + '/' + sets.path + post.name;
						sets.posts[post.name].content = post.content = layout.postImg.clone().attr('src', imgUrl);
					}

					setTimeout(function() {

						// для форматов: html|php|txt
						if( postFormat == 'txt' ) {

							beforePostAppend();
							post.content.appendTo(layout.posts.find('[data-lm-postname="'+post.name+'"]'));
							afterPostAppend();

						}

						// для форматов: jpg|png|jpeg
						if( postFormat == 'img') {

							var img = new Image();
							img.src = post.content.attr('src');
							img.onload = function () {

								beforePostAppend();
								post.content.appendTo(layout.posts.find('[data-lm-postname="'+post.name+'"]'));
								afterPostAppend();

							}
						}

						function beforePostAppend() {
							// Удал. прелоадер на каждой записи 									 
							if( layout.preloader.element && layout.preloader.onEachItem == true )
								layout.posts.find('[data-lm-postname="'+post.name+'"] .lm-post-preloader').remove();

							// Callback: beforeShowItem()
							sets.beforeShowItem.call($ths, sets, post);
						}

						function afterPostAppend() {

							if( typeof(sets._itemsCur) != 'number' ) sets._itemsCur = 0;
							sets._itemsCur += 1;

							// Удал. кнопку "Загрузить еще", если все записи загружены
							if( sets._itemsCur >= sets._itemsAll )
								layout.button.element.remove();

							// Callback: afterShowItem()
							sets.afterShowItem.call($ths, sets, post);

							// Проверка: Все посты из группы загружены
							if( sets._itemsCur >= (_curItemsBefore + count) ) {
								// Удал. прелоадер на кнопке
								if( layout.preloader.onButton )
									layout.button.element.find('.lm-btn-preloader').removeClass('loading').remove();

								// Callback: afterShowItems()
								sets.afterShowItems.call($ths, sets);
							}

						}

					}, animDelay);

					// анимация задержкой вывода
					animDelay += sets.nextPostDelay;

				});

			}

			return $(this);

		},

		destroy: function() {
			
			if( !$(this).data('_init') ) return false;

			var $ths = $(this), sets = $ths.data('settings'), layout = sets.layout;

			if( $ths.data('_init') === true ) {

				// удал. обработчик (кнопка "Загрузить еще")
				if( layout.button && layout.button.event )
					layout.button.element.off( layout.button.event + '.lm-' + sets._nsid );

				$ths.children().remove();
				$ths.removeData();

			}

			return $(this);

		},

		reinit: function(newOpts) {
			var $ths = $(this);

			var oldOpts = $ths.data('options');
			methods.destroy.call($ths);

			if( newOpts && typeof(newOpts) == 'object' )
				methods.init.call($ths, newOpts);
			else methods.init.call($ths, oldOpts);

			return $(this);

		},


	};

	// Генератор случайного числа
	function randInt(min, max) {
		var rand = min - 0.5 + Math.random() * (max - min + 1)
		rand = Math.round(rand);
		return rand;
	}

	$.fn.loadMore = function(methodOrOptions) {
		if ( methods[methodOrOptions] ) {
			return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			methods.init.apply( this, arguments );
			return this;
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.loadMore' );
		}    
	};

})(jQuery);