"use strict";

/* Mute the page header background video */

/* YouTube */

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytplayer', {
        events: {
            'onReady': function() {
                player.mute()
            },
        }
    });
}

jQuery(function($) {
    $.fn.shuffle = function() {
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });

        this.each(function(i){
            $(this).replaceWith($(shuffled[i]));
        });

        return $(shuffled);
    };

    /* Vimeo */

    var iframe = $('#vimeoplayer');
    if (iframe.length) {
        var player = $f(iframe[0]);

        player.addEvent('ready', function() {
            player.api('setVolume', 0);
        });
    }

    var isMobile = false;
    $.support.placeholder = ('placeholder' in document.createElement('input'));

    /* Screen size (grid) */
    var screenLarge = 1200,
        screenMedium = 992,
        screenSmall = 768;

    /* Check if on mobile */
    if(/Mobi/.test(navigator.userAgent)) {
        isMobile = true;
    }

    if (isMobile) {
        $('body').addClass('anps-mobile');
    }

    /*-----------------------------------------------------------------------------------*/
    /*	Top bar
    /*-----------------------------------------------------------------------------------*/

    if ($('.top-bar--menu').length) {
        $('.top-bar').clone().attr('class', 'top-bar-menu').prependTo('.anps-mobile-menu');
    }

    if ($('.top-bar--toggle').length) {
        $('.top-bar').append('<button class="top-bar__toggle"><i class="fa fa-angle-down" aria-hidden="true"></i></button>');

        $('.top-bar__toggle').on('click', function () {
            $('.top-bar').toggleClass('top-bar--active');
            $('.top-bar .container').slideToggle();
        });
    }

    /*-----------------------------------------------------------------------------------*/
    /*	Projects
    /*-----------------------------------------------------------------------------------*/

    /* Mobile */

    $('.project-hover .btn').on('click', function(e) {
        if ($(this).parent().css('opacity') !== '1') {
            e.preventDefault();
            return false;
        }
    });

    /* Reset Pagination */

    function resetPagination(items, itemClass, perPage) {
        var pageTemp = 0;

        items.find(itemClass).each(function(item) {
            var tempClass = $(this).attr('class');

            $(this).attr('class', tempClass.replace(/(page-[1-9][0-9]*)/g, ''));
        });

        items.find(itemClass).each(function(index) {
            if (index % perPage === 0) {
                pageTemp += 1;
            }

            items.find(itemClass).eq(index).addClass('page-' + pageTemp);
        });
    }

    /* Main logic */

    function filterSize() {
        $('.filter').each(function () {
            var maxHeight = -1;
            $(this).find('li').height('auto');
            $(this).find('li').each(function() {
                if ($(this).height() > maxHeight) {
                    maxHeight = $(this).innerHeight();
                }
            });
            $(this).find('li').height(maxHeight);
        });
    }

    $(window).on('resize', filterSize);
    filterSize();

    window.onload = function() {
        $('.ico_listing').each(function() {
            var items = $(this).find('.ico_upcoming, .ico_active, .ico_ended');
            var itemClass = '.ico-item';
            var filter = $(this).find('.filter');
            var initialFilter = '';
            var hash = window.location.hash.replace('#', '');

            if (hash && filter.find('[data-filter="' + hash + '"]').length) {
                initialFilter = '.' + hash;
                filter.find('.selected').removeClass('selected');
                filter.find('[data-filter="' + hash + '"]').addClass('selected');
            }

            /* Layout */
            items.isotope({
                itemSelector: itemClass,
                layoutMode: 'fitRows',
                filter: initialFilter,
            });

            /* Filtering */
            filter.find('button').on('click', function(e) {
                var value = $(this).attr('data-filter');
                value = (value != '*') ? '.' + value : value;

                items.isotope({
                    filter: value
                });

                /* Change select class */
                filter.find('.selected').removeClass('selected');
                $(this).addClass('selected');
            });
        });
        $('.projects').each(function() {
            var items = $(this).find('.projects-content');
            var itemClass = '.projects-item';
            var filter = $(this).find('.filter');
            var initialFilter = '';
            var hash = window.location.hash.replace('#', '');

            if (hash && filter.find('[data-filter="' + hash + '"]').length) {
                initialFilter = '.' + hash;
                filter.find('.selected').removeClass('selected');
                filter.find('[data-filter="' + hash + '"]').addClass('selected');
            }

            if ($(this).find('.projects-pagination').length) {
                var pageNum = 1;
                var perPage = 3;

                if (window.innerWidth < screenSmall) {
                    perPage = 2;
                } else if (window.innerWidth < screenMedium) {
                    perPage = 4;
                } else if (items.find(itemClass).hasClass('col-md-3')) {
                    perPage = 4;
                }

                var numPages = Math.ceil(items.find(itemClass).length / perPage);

                if (numPages < 2) {
                    $('.projects-pagination').css('visibility', 'hidden');
                } else {
                    $('.projects-pagination').css('visibility', 'visible');
                }

                $(window).on('resize', function() {
                    if (window.innerWidth < screenSmall) {
                        perPage = 2;
                    } else if (window.innerWidth < screenMedium) {
                        perPage = 4;
                    } else if (items.find(itemClass).hasClass('col-md-3')) {
                        perPage = 4;
                    } else {
                        perPage = 3;
                    }

                    filter.find('.selected').click();
                });

                resetPagination(items, itemClass, perPage);

                /* Layout */
                items.isotope({
                    itemSelector: itemClass,
                    layoutMode: 'fitRows',
                    filter: '.page-' + pageNum + initialFilter,
                    transitionDuration: '.3s',
                    hiddenStyle: {
                        opacity: 0,
                    },
                    visibleStyle: {
                        opacity: 1,
                    }
                });

                /* Remove empty filter category buttons */
                filter.find('li').each(function() {
                    var className = $(this).children('button').attr('data-filter');

                    if( className === '*' ) {
                        return true;
                    }

                    if (!items.find('.' + className).length) {
                        $(this).remove();
                    }
                });

                /* Filtering */
                filter.find('button').on('click', function(e) {
                    var value = $(this).attr('data-filter');
                    value = (value != '*') ? '.' + value : value;
                    pageNum = 1;

                    numPages = Math.ceil(items.find(itemClass + value).length / perPage);

                    if (numPages < 2) {
                        $('.projects-pagination').css('visibility', 'hidden');
                    } else {
                        $('.projects-pagination').css('visibility', 'visible');
                    }

                    resetPagination(items, itemClass + value, perPage)
                    items.isotope({
                        filter: value + '.page-1'
                    });

                    /* Change select class */
                    filter.find('.selected').removeClass('selected');
                    $(this).addClass('selected');
                });

                $('.projects-pagination button').on('click', function() {
                    var value = $('.filter .selected').attr('data-filter');
                    value = (value != '*') ? '.' + value : value;

                    if ($(this).hasClass('prev')) {
                        if (pageNum - 1 == 0) {
                            pageNum = numPages;
                        } else {
                            pageNum -= 1;
                        }
                    } else {
                        if (pageNum + 1 > numPages) {
                            pageNum = 1;
                        } else {
                            pageNum += 1;
                        }
                    }

                    items.isotope({
                        filter: value + '.page-' + pageNum
                    });
                });
            } else {
                /* Layout */
                items.isotope({
                    itemSelector: itemClass,
                    layoutMode: 'fitRows',
                    filter: initialFilter,
                });

                /* Filtering */
                filter.find('button').on('click', function(e) {
                    var value = $(this).attr('data-filter');
                    value = (value != '*') ? '.' + value : value;

                    items.isotope({
                        filter: value
                    });

                    /* Change select class */
                    filter.find('.selected').removeClass('selected');
                    $(this).addClass('selected');
                });
            }

            /* Add background to parent row */
            if ($('.projects-recent[data-bg]').length) {
                $('.projects-recent').parents('.vc_row').css('background-color', $('.projects-recent').data('bg'))
            } else {
                $('.projects-recent').parents('.vc_row').addClass('bg-dark');
            }
        });
    }

    /*-----------------------------------------------------------------------------------*/
    /*	Push submenu to the left if no space on the right
    /*-----------------------------------------------------------------------------------*/

    var submenuWidth = $('.sub-menu > .menu-item').width();
    var menusWithChildren = $('.main-menu > .menu-item-has-children');

    $('.anps-mobile-menu .menu-item-has-children').append('<button class="sub-menu-toggle"><i class="fa fa-angle-down"></i></button>');

    $('.sub-menu-toggle').on('click', function () {
        $(this).parent().toggleClass('sub-menu-active');
    });

    /* Set an attribute for all top level menus with children */
    function setDepth() {
        $(this).each(function() {
            var depth = 0;

            $(this).find('.sub-menu > .menu-item:last-child').each(function(){
                depth = Math.max(depth, $(this).parents('.sub-menu').length);
            });

            $(this).attr('data-depth', depth);
        });
    }

    /* Check if menu should change */
    function isSubmenuOnScreen() {
        var width = submenuWidth * $(this).attr('data-depth');

        if( window.innerWidth - $(this).offset().left < width ) {
            $(this).addClass('children-right');
        } else {
            $(this).removeClass('children-right');
        }
    }

    setDepth.call(menusWithChildren);
    menusWithChildren.on('mouseenter', isSubmenuOnScreen);

    /* One page support */

    var onePageLinks = $('.anps-smothscroll, .anps-main-nav a[href*="#"]:not([href="#"]):not([href*="="])');

    if( !$('.home').length ) {
        onePageLinks.each(function() {
            var href = $(this).attr('href');
            if( href.indexOf('#') === 0 ) {
                $(this).attr('href', anps.home_url + href);
            }
        });
    }

    onePageLinks.on('click', function(e) {
        if( window.innerWidth > 1199 ) {
            var href = $(this).attr('href');

            if( !$('.home').length || href.indexOf('#') !== 0 ) {
                window.location = href;
                e.preventDefault();
                return false;
            } else {
                var target = $($(this).attr('href'));
                var offset = 0; /* Desired spacing */

                if( $('#wpadminbar').length ) {
                    offset += $('#wpadminbar').height();
                }

                if( $('.anps-header').length ) {
                    offset += $('.anps-header').height();
                }

                if (target.length) {
                    var targetoffset = target.offset().top - offset;

                    $('html,body').animate({
                        scrollTop: targetoffset
                    }, 1000, function () {
                        history.pushState(null, null, href);
                    });

                    return false;
                }
            }
        }
    });

    /* Add Support for touch devices for desktop menu */
    $('.site-header #main-menu').doubleTapToGo();

    function mobileMenuClose() {
        $('.anps-menu-toggle i').removeClass('fa-close').addClass('fa-bars');

        setTimeout(function () {
            if (typeof window.vc_fullWidthRow === 'function') {
                window.vc_fullWidthRow();
            }
            $(window).trigger('resize');
        }, 400);
    }

    $('.anps-menu-toggle').on('click', function () {
        $('body').toggleClass('anps-show-mobile-menu');

        if (!$('body').hasClass('anps-show-mobile-menu')) {
            mobileMenuClose();
        } else {
            $('.anps-menu-toggle i').removeClass('fa-bars').addClass('fa-close');
        }
    });

    $(window).on('resize', function() {
        if (window.innerWidth >= 1200) {
            $('body').removeClass('anps-show-mobile-menu');
            mobileMenuClose();
        }
    });

    $('.anps-mobile-menu').detach().insertAfter('.site');

    /*-----------------------------------------------------------------------------------*/
    /*	Gallery Thumbnails
    /*-----------------------------------------------------------------------------------*/

    var openGallery = false;

    function changeThumb(el) {
        var $gallery = el.parents('.gallery-fs');

        if (!el.hasClass('selected')) {
            var caption = el.attr('title');

            if (el.data('caption')) {
                caption = el.data('caption');
            }

            $gallery.find('> figure > img').attr('src', el.attr('href'));
            $gallery.find('> figure > figcaption').html(caption);
            $gallery.find('.gallery-fs-thumbnails .selected').removeClass('selected');
            el.addClass('selected');
        }
    }

    var thumbCol = 6;
    var galleryParent = $('.gallery-fs').parents('[class*="col-"]');
    var galleryParentSize = Math.floor(galleryParent.outerWidth() / galleryParent.parent().outerWidth() * 100);

    if (galleryParentSize < 60) {
        thumbCol = 5;
    }
    if (galleryParentSize == 100) {
        thumbCol = 9;
    }

    var navText = ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'];

    if ($('html[dir="rtl"]').length) {
        navText.reverse();
    }

    function setOwlNav(e){
        if(e.page.size >= e.item.count) {
            if ($('html[dir="rtl"]').length) {
                $(e.target).siblings('.gallery-fs-nav').children('a, button').css('transform', 'translateX(-83px)');
            } else {
                $(e.target).siblings('.gallery-fs-nav').children('a, button').css('transform', 'translateX(83px)');
            }
        } else {
            $(e.target).siblings('.gallery-fs-nav').children('a, button').css('transform', 'translateX(0)');
        }
    }
    $('.gallery-fs-thumbnails').owlCarousel({
        onInitialized: setOwlNav,
        onResized: setOwlNav,
        loop: false,
        margin: 17,
        nav: true,
        navText: navText,
        rtl: ($('html[dir="rtl"]').length > 0),
        responsive: {
            0:    { items: 2 },
            600:  { items: 4 },
            1000: { items: thumbCol },
        },
    });

    $('.gallery-fs-thumbnails a').swipebox({
        hideBarsDelay: -1,
        afterOpen: function() {
            if (!openGallery) {
                $.swipebox.close();
            }
            openGallery = false;
        },
        nextSlide: function() {
            var index = $('.gallery-fs-thumbnails .owl-item a.selected').parent().index();

            if (index < $('.gallery-fs-thumbnails .owl-item').length - 1) {
                changeThumb($('.gallery-fs-thumbnails .owl-item').eq(index + 1).children('a'));
            }
        },
        prevSlide: function() {
            var index = $('.gallery-fs-thumbnails .owl-item a.selected').parent().index();

            if (index > 0) {
                changeThumb($('.gallery-fs-thumbnails .owl-item').eq(index - 1).children('a'));
            }
        },
    });

    $('.gallery-fs-thumbnails .owl-item a').on('click', function() {
        changeThumb($(this));
    });

    $('.gallery-fs-fullscreen').on('click', function(e) {
        e.preventDefault();
        openGallery = true;

        var $gallery = $(this).parents('.gallery-fs');

        if ($gallery.find('.gallery-fs-thumbnails').length) {
            $gallery.find('.gallery-fs-thumbnails .owl-item a.selected').eq(0).click();
        }
    });

    /* Only one thumbnail */

    if (!$('.gallery-fs-thumbnails').length) {
        $('.gallery-fs-fullscreen').css({
            'right': '21px'
        });
        $('.gallery-fs-fullscreen').swipebox({
            hideBarsDelay: 1
        })
    }

    /* Gallery */

    $('.gallery a').swipebox({
        hideBarsDelay: -1,
    });

    /*-----------------------------------------------------------------------------------*/
    /*	Fixed Footer
    /*-----------------------------------------------------------------------------------*/
    $(window).on('load', function() {
        if ($('.fixed-footer').length) {
            fixedFooter();

            $(window).on('resize', function() {
                fixedFooter();
            });
        }
    })

    function fixedFooter() {
        $('.site-main').css('margin-bottom', $('.site-footer').innerHeight());
    }

    /*-----------------------------------------------------------------------------------*/
    /*	Quantity field
    /*-----------------------------------------------------------------------------------*/


    function addQuantityButtons() {
        $('form .quantity').append('<button class="plus">+</button>');
        $('form .quantity').append('<button class="minus">-</button>');
    }
    addQuantityButtons();

    $(document).on('updated_cart_totals', addQuantityButtons);

    $('body').on('click', '.quantity button', function(e) {
        e.preventDefault();

        var field = $(this).parent().find('.qty'),
            val = parseInt(field.val(), 10),
            step = parseInt(field.attr('step'), 10) || 0,
            min = parseInt(field.attr('min'), 10) || 1,
            max = parseInt(field.attr('max'), 10) || 0;

        if ($(this).html() === '+' && (val < max || !max)) {
            /* Plus */
            field.val(val + step);
        } else if ($(this).html() === '-' && val > min) {
            /* Minus */
            field.val(val - step);
        }

        field.trigger('change');
    });

    /*-----------------------------------------------------------------------------------*/
    /*	Featured Element (lightbox)
    /*-----------------------------------------------------------------------------------*/

    $('.featured-lightbox-link').swipebox({
        hideBarsDelay: 1
    });

    /*-----------------------------------------------------------------------------------*/
    /*	Gallery (lightbox)
    /*-----------------------------------------------------------------------------------*/

    $('.gallery-simple__link').swipebox({
        hideBarsDelay : -1,
    });

    /*-----------------------------------------------------------------------------------*/
    /*	IE9 Placeholders
    /*-----------------------------------------------------------------------------------*/

    if (!$.support.placeholder) {
        $('[placeholder]').on('focus', function() {
            if ($(this).val() == $(this).attr('placeholder')) {
                $(this).val('');
            }
        }).on('blur', function() {
            if ($(this).val() == "") {
                $(this).val($(this).attr('placeholder'));
            }
        }).blur();

        $('[placeholder]').parents('form').on('submit', function() {
            if ($('[placeholder]').parents('form').find('.alert')) {
                return false;
            }

            $(this).find('[placeholder]:not(.alert)').each(function() {
                if ($(this).val() == $(this).attr('placeholder')) {
                    $(this).val('');
                }
            });
        });
    }
    /*-----------------------------------------------------------------------------------*/
    /*	Is on screen?
    /*-----------------------------------------------------------------------------------*/

    jQuery.fn.isOnScreen = function() {

        var win = jQuery(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

    };

    /*-----------------------------------------------------------------------------------*/
    /*	Counter
    /*-----------------------------------------------------------------------------------*/

    function checkForOnScreen() {
        $('.anps-counter').each(function(index) {
            if (!$(this).hasClass('animated') && $('.anps-counter').eq(index).isOnScreen()) {
                var counter = new CountUp(
                    $(this).attr('id'),
                    $(this).data('from'),
                    $(this).data('to'),
                    0,
                    $(this).data('duration'),
                    {
                        useEasing: $(this).data('use-easing'),
                        useGrouping: $(this).data('use-grouping'),
                        separator: $(this).data('separator'),
                        decimal: $(this).data('decimal'),
                    },
                );

                if (!counter.error) {
                    counter.start();
                } else {
                    console.error(counter.error);
                }
                $('.anps-counter').eq(index).addClass('animated');
            }
        });
    }

    checkForOnScreen();

    $(window).scroll(function() {
        checkForOnScreen();
    });


    /*-----------------------------------------------------------------------------------*/
    /*	Page Header
    /*-----------------------------------------------------------------------------------*/

    function pageHeaderVideoSize() {
        $(".page-header iframe").height($(window).width() / 1.77777777778);
    }

    if ($('.page-header').length) {
        pageHeaderVideoSize();
        $(window).on('resize', pageHeaderVideoSize);

        if (isMobile) {
            $('.page-header').find('.page-header-video').remove();
        }

        if ($('#ytplayer')) {
            $('body').append('<script src="https://www.youtube.com/player_api">');
        }
    }


    /*-----------------------------------------------------------------------------------*/
	/*	Accordions & tabs # URL open
	/*-----------------------------------------------------------------------------------*/

    if (window.location.hash && $('.tabs, .panel')) {
        var el = $('[href="' + window.location.hash + '"]');

        if (el.length) {
            el.click();
        }
    }


    /*-----------------------------------------------------------------------------------*/
    /*	Overwriting Visual Composer Sizing Function
    /*-----------------------------------------------------------------------------------*/

    window.vc_rowBehaviour = function() {
        function fullWidthRow() {
            var $elements = $('[data-vc-full-width="true"]');
            $.each($elements, function(key, item) {
                    /* Anpthemes */
                    var verticalOffset = 0;
                    if ($('.anps-header--vertical').length && window.innerWidth > 1200) {
                        verticalOffset = $('.anps-header--vertical .anps-header__bar').innerWidth();
                    }

                    var boxedOffset = 0;
                    if ($('body.boxed').length && window.innerWidth > 1200) {
                        boxedOffset = ($('body').innerWidth() - $('.site-main').innerWidth()) / 2;
                    }

                    var $el = $(this);
                    $el.addClass("vc_hidden");
                    var $el_full = $el.next(".vc_row-full-width");
                    $el_full.length || ($el_full = $el.parent().next(".vc_row-full-width"));
                    var el_margin_left = parseInt($el.css("margin-left"), 10),
                        el_margin_right = parseInt($el.css("margin-right"), 10),
                        offset = 0 - $el_full.offset().left - el_margin_left,
                        width = $(window).width() - verticalOffset - boxedOffset * 2,
                        positionProperty = $('html[dir="rtl"]').length ? 'right' : 'left';

                    if( positionProperty === 'right' ) {
                        verticalOffset = 0;
                    }

                    var options = {
                        'position': 'relative',
                        'box-sizing': 'border-box',
                        'width': width
                    };
                    options[positionProperty] = offset + verticalOffset + boxedOffset;

                    $el.css(options);

                    if (!$el.data("vcStretchContent")) {
                        var padding = -1 * offset - verticalOffset - boxedOffset;
                        0 > padding && (padding = 0);
                        var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
                        0 > paddingRight && (paddingRight = 0),
                            $el.css({
                                "padding-left": padding + "px",
                                "padding-right": paddingRight + "px"
                            })
                    }
                    $el.attr("data-vc-full-width-init", "true"),
                        $el.removeClass("vc_hidden")
                }),
                $(document).trigger("vc-full-width-row", $elements)
        }
        window.vc_fullWidthRow = fullWidthRow;

        function parallaxRow() {
            var vcSkrollrOptions, callSkrollInit = !1;
            return window.vcParallaxSkroll && window.vcParallaxSkroll.destroy(),
                $(".vc_parallax-inner").remove(),
                $("[data-5p-top-bottom]").removeAttr("data-5p-top-bottom data-30p-top-bottom"),
                $("[data-vc-parallax]").each(function() {
                    var skrollrSpeed, skrollrSize, skrollrStart, skrollrEnd, $parallaxElement, parallaxImage, youtubeId;
                    callSkrollInit = !0,
                        "on" === $(this).data("vcParallaxOFade") && $(this).children().attr("data-5p-top-bottom", "opacity:0;").attr("data-30p-top-bottom", "opacity:1;"),
                        skrollrSize = 100 * $(this).data("vcParallax"),
                        $parallaxElement = $("<div />").addClass("vc_parallax-inner").appendTo($(this)),
                        $parallaxElement.height(skrollrSize + "%"),
                        parallaxImage = $(this).data("vcParallaxImage"),
                        youtubeId = vcExtractYoutubeId(parallaxImage),
                        youtubeId ? insertYoutubeVideoAsBackground($parallaxElement, youtubeId) : "undefined" != typeof parallaxImage && $parallaxElement.css("background-image", "url(" + parallaxImage + ")"),
                        skrollrSpeed = skrollrSize - 100,
                        skrollrStart = -skrollrSpeed,
                        skrollrEnd = 0,
                        $parallaxElement.attr("data-bottom-top", "top: " + skrollrStart + "%;").attr("data-top-bottom", "top: " + skrollrEnd + "%;")
                }),
                callSkrollInit && window.skrollr ? (vcSkrollrOptions = {
                        forceHeight: !1,
                        smoothScrolling: !1,
                        mobileCheck: function() {
                            return !1
                        }
                    },
                    window.vcParallaxSkroll = skrollr.init(vcSkrollrOptions),
                    window.vcParallaxSkroll) : !1
        }

        function fullHeightRow() {
            var $element = $(".vc_row-o-full-height:first");
            if ($element.length) {
                var $window, windowHeight, offsetTop, fullHeight;
                $window = $(window),
                    windowHeight = $window.height(),
                    offsetTop = $element.offset().top,
                    windowHeight > offsetTop && (fullHeight = 100 - offsetTop / (windowHeight / 100),
                        $element.css("min-height", fullHeight + "vh"))
            }
            $(document).trigger("vc-full-height-row", $element)
        }

        function fixIeFlexbox() {
            var ua = window.navigator.userAgent,
                msie = ua.indexOf("MSIE ");
            (msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) && $(".vc_row-o-full-height").each(function() {
                "flex" === $(this).css("display") && $(this).wrap('<div class="vc_ie-flexbox-fixer"></div>')
            })
        }
        var $ = window.jQuery;
        $(window).off("resize.vcRowBehaviour").on("resize.vcRowBehaviour", fullWidthRow).on("resize.vcRowBehaviour", fullHeightRow),
            fullWidthRow(),
            fullHeightRow(),
            fixIeFlexbox(),
            vc_initVideoBackgrounds(),
            parallaxRow()
    }

    /* Date Picker (pikaday) */

    window.pikaSize = function() {
        $('.pika-single').width($('input:focus').innerWidth());

        if ($('input:focus').length && $('input:focus').offset().top > $('.pika-single').offset().top) {
            $('.pika-single').addClass('pika-above');
        } else {
            $('.pika-single').removeClass('pika-above');
        }
    };

    if (!isMobile) {
        $('.wpcf7-form .wpcf7-date').attr('type', 'text');
        var picker = new Pikaday({
            field: $('.wpcf7-form .wpcf7-date')[0],
            format: 'MM/DD/YYYY'
        });
    } else {
        $('.wpcf7-form .wpcf7-date').val(moment().format('YYYY-MM-DD'));
    }

    /* Custom Revolution Slider navigation */

    if (typeof revapi1 !== 'undefined') {
        revapi1.bind("revolution.slide.onloaded", function(e) {
            function revCustomArrows() {
                if (window.innerWidth > 1199) {
                    var margin = ($(window).width() - 1140) / 2;

                    if ($('.boxed').length) {
                        margin = 30;
                    }

                    leftArrow.css({
                        'margin-left': margin,
                        'margin-right': 0
                    });
                    rightArrow.css({
                        'margin-left': margin + leftArrow.innerWidth() + spacing
                    });
                } else if (window.innerWidth > 1000) {
                    leftArrow.css({
                        'margin-left': 0,
                        'margin-right': rightArrow.innerWidth() + spacing
                    });
                    rightArrow.css({
                        'margin-left': 0
                    });
                } else {
                    leftArrow.css({
                        'margin-left': -leftArrow.innerWidth() - spacing / 2,
                        'margin-right': 0
                    });
                    rightArrow.css({
                        'margin-left': spacing / 2
                    });
                }
            }

            if ($('.tparrows.custom').length) {
                var leftArrow = $('.tp-leftarrow.custom'),
                    rightArrow = $('.tp-rightarrow.custom'),
                    spacing = 12;

                $(window).on('resize', revCustomArrows);
                revCustomArrows();
            }
        });
    }

    if(isMobile) {
        $('.projects').addClass('projects-mobile');
    }

    if (typeof flexibility === 'function') {
        flexibility(document.querySelector('body'));
    }

    if (typeof $.fn.zoom === 'function') {
        $(document).ready(function() {
            $('.zoom').zoom();
        });
    }

    function responsiveOptions() {
        $('[data-rstyle]').each(function () {
            var rstyles = $(this).data('rstyle').split(';');
            var $el = $(this);

            rstyles.forEach(function (rstyle) {
                if (rstyle !== '') {
                    rstyle = rstyle.split(':');
                    var name = rstyle[0];
                    var values = rstyle[1].split('|');

                    var nextValue = values[3];

                    if (window.innerWidth < screenSmall && values[0] !== '') {
                        nextValue = values[0];
                    } else if (window.innerWidth < screenMedium && values[1] !== '') {
                        nextValue = values[1];
                    } else if (window.innerWidth < screenLarge && values[2] !== '') {
                        nextValue = values[2];
                    }

                    var multipleValues = nextValue.split(' ');

                    if (multipleValues.length > 1) {
                        nextValue = '';

                        multipleValues.forEach(function(val) {
                            nextValue += nextValue !== '' ? ' ' : '';
                            nextValue += val;
                            nextValue += parseInt(val) == val && val !== '' ? 'px' : '';
                        });
                    } else {
                        nextValue += parseInt(nextValue) == nextValue ? 'px' : '';
                    }

                    $el.css(name, nextValue);
                }
            });
        });
    }

    $(window).on('resize', responsiveOptions);
    responsiveOptions();

    $.fn.hoverStyles = function () {
        $(this).on('mouseenter', function () {
            $(this).find('[data-hstyle]').each(function () {
                var hStyle = $(this).data('hstyle');
                if (hStyle !== '') {
                    $(this).attr('data-bstyle', $(this).attr('style'));
                    $(this).css(hStyle);
                }
            });
        });

        $(this).on('mouseleave', function () {
            $(this).find('[data-hstyle]').each(function () {
                $(this).attr('style', $(this).data('bstyle'));
            });
        });
    }

    $('.anps-link').hoverStyles();

    function sideContainer() {
        $('.anps-side-container').each(function () {
            if (window.innerWidth > 991) {
                var spaceWidth = ($('body').width() - $('.container').width()) / 2;
                var columnWidth = $(this).parents('.wpb_wrapper').width();

                var style = {
                    width: (spaceWidth + columnWidth) + 'px'
                };

                if ($('.vc_editor').length) {
                    if ($(this).parents('.vc_vc_column').index() === 0) {
                        style['left'] = -spaceWidth + 'px';
                    }
                } else {
                    if ($(this).parents('.wpb_column').index() === 0) {
                        style['left'] = -spaceWidth + 'px';
                    }
                }

                $(this).css(style);
            } else {
                $(this).css({
                    right: 'auto',
                    width: 'auto',
                });
            }
        });
    }

    $(window).on('resize', sideContainer);
    sideContainer();

    /*-----------------------------------------------------------------------------------*/
    /*	Logos
    /*-----------------------------------------------------------------------------------*/

    $('.anps-logos .owl-carousel').each(function () {
        var $el = $(this);
        var owlcolumns = $el.data('col');
        var enoughItems = $el.find('.anps-logos__item').length > owlcolumns;
        var speed = $el.data('speed');
        var owlSettings = {
            loop: enoughItems,
            mouseDrag: enoughItems,
            touchDrag: enoughItems,
            pullDrag: enoughItems,
            margin: 40,
            dots: false,
            responsiveClass: true,
            rtl: ($('html[dir="rtl"]').length > 0),
            stagePadding: 2,
            autoplay: speed !== '' && speed !== undefined,
            autoplayTimeout: speed,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1,
                    slideBy: 1
                },
                450: {
                    items: 2,
                    slideBy: 1,
                },
                992: {
                    items: owlcolumns,
                    slideBy: 1,
                }
            }
        }
        $el.owlCarousel(owlSettings);
    });

    /* Full width autoplay */

    var logosInitial = true;

    function logosAutoplay() {
        $('.anps-logos__outer-wrap').each(function () {
            if ($(this).parents('.anps-logos--fullwidth').length) {
                if (logosInitial) {
                    $(this).html($(this).html() + $(this).html());
                }
                var width = 0;
                $(this).children().each(function () {
                    width += $(this).innerWidth();
                });
                $(this).width(width);
            }
        });

        logosInitial = false;
    }

    $(window).on('load', logosAutoplay);
    $(window).on('resize', logosAutoplay);

    /* Frame */

    function anpsFrame() {
        $('.anps-frame--spacing').each(function () {
            $(this).css('padding-bottom', $('.anps-frame__img').height());
        });
    }

    $(window).on('load', anpsFrame);
    $(window).on('resize', anpsFrame);

    /* Charts */

    window.anpsCreateChart = function(data) {
        var config = {
            type: 'line',
            data: {
                labels: data.dates[0],
                datasets: [{
                    borderColor: data.lineColor,
                    label: '',
                    data: data.prices[0],
                    fill: false,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 2,
                    pointHitRadius: 10,
                }]
            },
            options: {
                borderWidth: 10,
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false,
                },
                tooltips: {
                    enabled: false,
                    custom: function (tooltipModel) {
                        var $el = $('.anps-chart-tooltip');

                        if (!$el.length) {
                            $('body').append('<div class="anps-chart-tooltip"></div>');
                            $el = $('.anps-chart-tooltip');
                        }

                        if (tooltipModel.opacity === 0) {
                            $el.css('opacity', 0);
                            return;
                        }

                        // Set Text
                        if (tooltipModel.body) {
                            var titleLines = tooltipModel.title || [];
                            var bodyLines = tooltipModel.body.map(function (bodyItem) {
                                return bodyItem.lines;
                            });

                            bodyLines.forEach(function (body, i) {
                                var colors = tooltipModel.labelColors[i];
                                var text = body[0].split(':')[1];
                                $el.html('<span class="anps-chart-tooltip__text">' + text + '</span>');
                            });
                        }

                        var position = this._chart.canvas.getBoundingClientRect();

                        $el.css({
                            opacity: 1,
                            left: position.left + tooltipModel.caretX - $el.innerWidth() / 2 + 'px',
                            top: position.top + tooltipModel.caretY - $el.height() - 14 + 'px',
                            fontFamily: tooltipModel._bodyFontFamily,
                        });
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        ticks: {
                            fontColor: data.xTextColor,
                            fontSize: 14,
                        },
                        zeroLineColor: '#fff',
                        gridLines: {
                            display: false,
                            drawTicks: true,
                            tickMarkLength: 25,
                        },
                    }],
                    yAxes: [{
                        display: true,
                        ticks: {
                            fontColor: data.yTextColor,
                            stepSize: data.yStep,
                            fontSize: 16,
                        },
                        gridLines: {
                            drawBorder: false,
                            color: data.gridLinesColor,
                            zeroLineColor: data.gridLinesColor,
                            borderDash: [9, 5],
                        },
                    }],
                }
            }
        };

        var ctx = document.getElementById(data.id).getContext('2d');
        new Chart(ctx, config);
    }

    function stickyInit() {
        var $window = $(window);
        var $adminBar = $('#wpadminbar');
        var $content = $('.anps-header__content');
        var $bar = $('.anps-header__bar');

        $window.on('scroll resize', sticky);
        sticky();

        function sticky() {
            if (!$('.anps-header__sticky-wrap').length) {
                $bar.wrap('<div class="anps-header__sticky-wrap"></div>');
            }
            var stickyClass = 'anps-header--sticky';
            var $wrap = $('.anps-header__sticky-wrap');

            if (!$wrap.length) return;

            var distance = $wrap.offset().top;
            var offset = 0;

            if ($adminBar.length && window.innerWidth > 601) {
                offset += $adminBar.height();
            }

            var height = window.innerWidth > 991 ? $bar.data('height') : $bar.data('m-height');
            $('.anps-header__sticky-wrap').height(height);

            if ($window.scrollTop() > distance - offset) {
                if (!$('.anps-header').hasClass(stickyClass)) {
                    $('.anps-header').addClass(stickyClass);
                }
                $bar.css({
                    top: offset,
                });
            } else {
                $bar.removeAttr('style');
                $('.anps-header').removeClass(stickyClass);
            }
        }
    }

    if ($('.stickyheader').length) {
        stickyInit();
    }

    function timelineLayout() {
        $('.anps-timeline--style-2 .anps-timeline__item + .anps-timeline__item').each(function () {
            if (window.innerWidth > screenMedium) {
                var margin = $(this).prev().innerHeight();
                if (margin > 100) {
                    margin -= margin/3;
                }

                $(this).css({
                    marginTop: margin,
                });
            } else {
                $(this).css({
                    marginTop: 40,
                });
            }
        });
    }

    timelineLayout();
    $(window).on('resize', timelineLayout);

    function testCSSVariables() {
        var color = 'rgb(255, 198, 0)';
        var el = document.createElement('span');

        el.style.setProperty('--color', color);
        el.style.setProperty('background', 'var(--color)');
        document.body.appendChild(el);

        var styles = getComputedStyle(el);
        var doesSupport = styles.backgroundColor === color;
        document.body.removeChild(el);
        return doesSupport;
    }

    if (!testCSSVariables()) {
        /* Variable in style */
        $('.anps-recent-news[data-link-color]').each(function() {
            var color = $(this).data('link-color');

            $(this).find('.post-meta a').css({
                color: color,
            });
        });

        /* Load static styles */
        $.post(
            anps.ajaxurl,
            {
                'action': 'anps_style_fallback',
            },
            function (response) {
                $('head').append('<style>' + response + '</style>');
            }
        );
    }

    function searchToggle() {
        $('.site-search').toggleClass('site-search--active');

        var height = 0;

        if ($('.site-search--active').length) {
            height = $('.site-search__form').innerHeight();
            $('.menu-search-toggle i').removeClass('fa-search').addClass('fa-close');
        } else {
            $('.menu-search-toggle i').removeClass('fa-close').addClass('fa-search');
        }

        $('.site-search').height(height);
    }

    $('.menu-search-toggle').on('click', function () {
        if ($('html').scrollTop() === 0) {
            searchToggle();
        } else {
            $('html').animate({
                scrollTop: 0
            }, 400, searchToggle);
        }
    });

    function headerBottom() {
        if (window.innerWidth > 991) {
            $('.anps-header--bottom .anps-header__wrap').css({
                top: window.innerHeight - $('#wpadminbar').height() - $('.anps-header__bar').innerHeight(),
            });
        } else {
            $('.anps-header--bottom .anps-header__wrap').css({
                top: 'auto',
            });
        }
    }
    headerBottom();
    $(window).on('resize', headerBottom);

    function anpsPageHeaderParticles() {
        if ($('.anps-page-header-particles').length) {
            anpsParticlesDraw({
                el: 'anps-page-header-particles',
                color: '#fff',
                interactivity: true,
            });
        }
    }

    anpsPageHeaderParticles();

    $('bodyh').append('<ul class="anps-crypto-list"></ul>');

    /* Newsletter */

    $('.anps-subscribe').each(function () {
        if ($(this).find('.tnp-field:not(.tnp-field-privacy):not(.tnp-field-button)').length > 1) {
            $(this).addClass('anps-subscribe--multiple');
            $(this).find('.tnp-submit').addClass('anps-btn anps-btn--md anps-btn--style-0');
        } else {
            $(this).addClass('anps-subscribe--single');
        }
    });

    $('.tnp-field-privacy').each(function() {
        $(this).find('input').attr('id', 'tnp-privacy').prependTo($(this));
        $(this).find('label').attr('for', 'tnp-privacy');
    });

    $('.tnp-widget').each(function () {
        if ($(this).find('.tnp-field:not(.tnp-field-privacy):not(.tnp-field-button)').length > 1) {
            $(this).addClass('tnp-widget--multiple');
            $(this).find('.tnp-submit').addClass('anps-btn anps-btn--md anps-btn--style-0');
        } else {
            $(this).addClass('tnp-widget--single');
        }
    });
});

function anpsParticlesDraw(options) {
    particlesJS(options.el, {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": options.color,
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": options.color,
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": options.interactivity,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": options.interactivity,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}

function anpsParticles(options) {
    var $ = jQuery;

    options.api.on('revolution.slide.onbeforeswap', function (e, data) {
        $('#anps-particles-' + options.sliderName).appendTo(e.currentTarget);
    });

    options.api.on('revolution.slide.onchange', function (e, data) {
        if (!$(e.currentTarget).find('#anps-particles-' + options.sliderName).length) {
            $(data.currentslide).append('<div id="anps-particles-' + options.sliderName + '" class="anps-particles"></div>');

            options.el = 'anps-particles-' + options.sliderName,

            anpsParticlesDraw(options);
        } else {
            $('#anps-particles-' + options.sliderName).appendTo(data.currentslide);
        }
    });
}

function cryptoStyling($layer) {
    $layer.find('.anps-crypto-form__field').attr('style', $layer.attr('style'));
    $layer.find('.anps-crypto-form__field').css({
        'max-width': '100%',
        'min-width': 0,
    });
}

function anpsCryptoField(name, $layer, options, data, val) {
    var $ = jQuery;

    if ($layer.hasClass('anps-crypto-' + name) && !$layer.find('.anps-crypto-form__field').length) {

        var currencies = options.to.split(',');
        if ($layer.hasClass('anps-crypto-from')) {
            currencies = options.from.split(',');
        }

        $layer.html('').append('<input type="text" value="' + val + '" class="anps-crypto-form__field"><button class="anps-crypto-form__btn">' + currencies[0] + '</button>');
    }

    if (data.eventtype === 'enteredstage' && $layer.hasClass('anps-crypto-' + name) && !$layer.find('.anps-crypto-form__field').attr('style')) {
        $(window).on('resize', function() {
            cryptoStyling($layer);
        });
        cryptoStyling($layer);
    }
}

window.anpsCryptos = {};

function anpsCrypto(options) {
    var $ = jQuery;
    var cryptoLoaded = false;

    function anpsCrytoLoad($el, sliderName) {
        var currenciesFrom = options.from.split(',');
        var currenciesTo = options.to.split(',');
        var counter = 0;

        if (anps.cryto_listings) {
            anpsCrytoLoadFinal(JSON.parse(anps.cryto_listings));
        } else {
            $.ajax({
                url: 'https://api.coinmarketcap.com/v2/listings/',
            }).done(function (response) {
                anpsCrytoLoadFinal(response);
            });
        }

        function anpsCrytoLoadFinal(response) {
            var needAJAX = true;

            if (typeof window.anps.crypto_values !== 'undefined' &&
                typeof window.anps.crypto_values[sliderName] !== 'undefined' && window.anps.crypto_values[sliderName] !== {}) {
                window.anpsCryptos = window.anps.crypto_values[sliderName];

                needAJAX = false;

                currenciesFrom.forEach(function (currencyFrom) {
                    currenciesTo.forEach(function (currencyTo) {
                        if (typeof window.anpsCryptos[currencyFrom + '-' + currencyTo] === 'undefined') {
                            needAJAX = true;
                        }
                    });
                });

                if (!needAJAX) {
                    setTimeout(function() {
                        $el.find('.anps-crypto-to input').val(window.anpsCryptos[currenciesFrom[0].toLowerCase() + '-' + currenciesTo[0].toLowerCase()]);
                    }, 400);
                }
            }

            if (needAJAX) {
                response.data.forEach(function (apiCurrency) {
                    currenciesFrom.forEach(function (currencyFrom) {
                        if (apiCurrency.symbol.toLowerCase() === currencyFrom.toLowerCase()) {
                            currenciesTo.forEach(function (currencyTo) {
                                setTimeout(function() {
                                    $.ajax({
                                        url: 'https://api.coinmarketcap.com/v2/ticker/' + apiCurrency.id + '/?convert=' + currencyTo,
                                    }).done(function (response, a , b) {
                                        window.anpsCryptos[currencyFrom + '-' + currencyTo] = response.data.quotes[currencyTo.toUpperCase()].price;
                                        counter++;
                                        if (counter === currenciesFrom.length * currenciesTo.length) {
                                            $el.find('.anps-crypto-to input').val(window.anpsCryptos[currenciesFrom[0].toLowerCase() + '-' + currenciesTo[0].toLowerCase()]);
                                        }

                                        $.post(
                                            anps.ajaxurl,
                                            {
                                                'action': 'anps_store_cryto_values',
                                                data: window.anpsCryptos,
                                                name: sliderName,
                                            },
                                        );
                                    });
                                }, 1000)
                            });
                        }
                    });
                });
            }
        }
    }

    options.api.bind("revolution.slide.layeraction", function (e, data) {
        var $layer = $(data.layer);

        /* From */
        anpsCryptoField('from', $layer, options, data, 1);

        /* To */
        anpsCryptoField('to', $layer, options, data, 0);

        if (!cryptoLoaded) {
            cryptoLoaded = true;

            anpsCrytoLoad($(e.target), options.api.selector.replace('#', ''));

            function currencyCalc($el) {
                var to = $(e.target).find('.anps-crypto-to input').val();
                var toCur = $(e.target).find('.anps-crypto-to button').text();
                var from = $(e.target).find('.anps-crypto-from input').val();
                var fromCur = $(e.target).find('.anps-crypto-from button').text();

                if ($el.parent().hasClass('anps-crypto-to')) {
                    $(e.target).find('.anps-crypto-from input').val((to / window.anpsCryptos[fromCur + '-' + toCur]).toFixed(8));
                } else {
                    $(e.target).find('.anps-crypto-to input').val((window.anpsCryptos[fromCur + '-' + toCur] * from).toFixed(8));
                }
            }

            $(e.target).on('input', '.anps-crypto-form__field', function() {
                currencyCalc($(this));
            });

            $(e.target).on('click', '.anps-crypto-form__btn', function () {
                if ($(this).hasClass('anps-crypto-form__btn--active')) {
                    $(this).removeClass('anps-crypto-form__btn--active');
                    $('.anps-crypto-list').hide();
                    return;
                }

                var list = '';
                var currencies = options.to.split(',');
                if ($(this).parent().hasClass('anps-crypto-from')) {
                    currencies = options.from.split(',');
                }

                currencies.forEach(function (cur) {
                    list += '<li class="anps-crypto-list__item"><button class="anps-crypto-list__btn">' + cur + '</button></li>';
                });

                $('.anps-crypto-form__btn--active').removeClass('anps-crypto-form__btn--active');
                $(this).addClass('anps-crypto-form__btn--active')

                $('.anps-crypto-list').css({
                    left: $(this).offset().left + $(this).innerWidth(),
                    top: $(this).offset().top + $(this).height(),
                }).html(list).show();
            });

            $('body').on('click', '.anps-crypto-list__btn', function () {
                $('.anps-crypto-form__btn--active').html($(this).html());
                currencyCalc($(e.target).find('.anps-crypto-from .anps-crypto-form__field'));
                $('.anps-crypto-form__btn--active').removeClass('anps-crypto-form__btn--active');
                $('.anps-crypto-list').hide();
            });
        }
    });
}

function anpsCountdown(options) {
    var $ = jQuery;

    $('body').countdown(options.finalDate, function (event) {
        $('.anps-counter__day').html(event.strftime('%D'));
        $('.anps-counter__hour').html(event.strftime('%H'));
        $('.anps-counter__minute').html(event.strftime('%M'));
        $('.anps-counter__second').html(event.strftime('%S'));
    });
}

function anpsSlider(options) {
    var $ = jQuery;

    options.color = typeof options.color !== 'undefined' ? options.color : '#000';

    options.api.bind("revolution.slide.layeraction", function (e, data) {
        if (!$(this).find('.anps-slider-progress div').length) {
            $(this).find('.anps-slider-progress').append('<div style="background-color: ' + options.color + '; width: ' + (options.current / options.max * 100) + '%"></div>');
        }
    });
}
