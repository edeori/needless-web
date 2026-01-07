var isTouch = window.DocumentTouch && document instanceof DocumentTouch;

function scrollHeader() {
    // Has scrolled class on header
    var zvalue = $(document).scrollTop();
    if ( zvalue > 75 )
        $("#header").addClass("scrolled");
    else
        $("#header").removeClass("scrolled");
}

function parallaxBackground() {
    $('.parallax').css('background-positionY', ($(window).scrollTop() * 0.3) + 'px');
}

jQuery(document).ready(function($){

    scrollHeader();

    // Scroll Events
    if (!isTouch){
        $(document).scroll(function() {
            scrollHeader();
            parallaxBackground();
        });
    };

    // Touch scroll
    $(document).on({
        'touchmove': function(e) {
            scrollHeader(); // Replace this with your code.
        }
    });

    //Smooth scroll to start
    $('#to-start').click(function(){
        var start_y = $('#start').position().top;
        var header_offset = 45;
        window.scroll({ top: start_y - header_offset, left: 0, behavior: 'smooth' });
        return false;
    });

    //Smooth scroll to top
    $('#to-top').click(function(){
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        return false;
    });

    // Responsive Menu
    var $toggle = $('#toggle');
    var $overlay = $('#overlay');

    function openMobileMenu() {
        $toggle.addClass('active');
        $overlay.addClass('open');
        $('body').addClass('mobile-nav-open');
    }

    function closeMobileMenu() {
        $toggle.removeClass('active');
        $overlay.removeClass('open');
        $('body').removeClass('mobile-nav-open');
    }

    function isMobileMenuOpen() {
        return $overlay.hasClass('open');
    }

    $toggle.click(function () {
        if (isMobileMenuOpen()) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    $('.overlay-menu a').on('click', function() {
        closeMobileMenu();
    });

    // Tree Menu
    $(".tree").treemenu({delay:300});

    // Smooth scroll for anchor links (accounts for header height)
    function setActiveNavItem(id){
        var selector = id ? 'a[href="#' + id + '"]' : null;
        var $desktopItems = $('.dropmenu ul li');
        var $mobileItems = $('.overlay-menu li');
        $desktopItems.removeClass('active');
        $mobileItems.removeClass('active');
        if (selector) {
            $desktopItems.has(selector).addClass('active');
            $mobileItems.has(selector).addClass('active');
        }
    }

    function normalizePath(path) {
        if (!path) return '/';
        return path.replace(/\/+$/, '') || '/';
    }

    $(document).on('click', 'a[href*="#"]', function(e){
        var href = $(this).attr('href');
        if (!href) return;
        if (href === '#') return;

        var targetId = null;
        var targetPath = window.location.pathname;

        if (href.charAt(0) === '#') {
            targetId = href.slice(1);
        } else {
            var parsed;
            try {
                parsed = new URL(href, window.location.origin);
            } catch (err) {
                return;
            }
            if (!parsed.hash || parsed.host !== window.location.host) {
                return;
            }
            targetId = parsed.hash.slice(1);
            targetPath = parsed.pathname;
            if (normalizePath(targetPath) !== normalizePath(window.location.pathname)) {
                return;
            }
        }

        if (!targetId) return;
        var $target = $('#' + targetId);
        if (!$target.length) return;

        e.preventDefault();
        var headerHeight = $('#header').outerHeight() || 0;
        var targetTop = $target.offset().top - headerHeight;
        $('html, body').animate({ scrollTop: targetTop }, 600);

        if (history.replaceState) {
            history.replaceState(null, null, '#' + targetId);
        } else {
            location.hash = '#' + targetId;
        }

        setActiveNavItem(targetId);
    });

    // Update active menu item on scroll (highlight current section)
    var sectionIds = $('.modular-anchor-target').map(function(){ return this.id; }).get();
    function updateActiveOnScroll(){
        var scrollTop = $(window).scrollTop();
        var headerHeight = $('#header').outerHeight() || 0;
        var current = null;
        for (var i=0;i<sectionIds.length;i++){
            var id = sectionIds[i];
            var $s = $('#' + id);
            if ($s.length){
                var top = $s.offset().top - headerHeight - 5;
                if (scrollTop >= top) current = id;
            }
        }
        if (current){
            setActiveNavItem(current);
        }
    }
    $(window).on('scroll resize', function(){
        updateActiveOnScroll();
    });
    // initialize
    updateActiveOnScroll();

    // Center underlines: compute each link's center relative to the menu container
    function setUnderlineWidths($items){
        $items.each(function(){
            var $li = $(this);
            var $a = $li.find('a').first();
            if (!$a.length) return;
            var aRect = $a[0].getBoundingClientRect();
            var textWidth = Math.round(aRect.width);
            try{
                // try to measure only text content width for more precise underline
                var range = document.createRange();
                range.selectNodeContents($a[0]);
                var rect = range.getBoundingClientRect();
                if (rect && rect.width) textWidth = Math.round(rect.width);
            } catch(e){}
            // set CSS variable on the anchor so ::after can use it
            $a.css('--uw', textWidth + 'px');
        });
    }

    function alignUnderlines(){
        setUnderlineWidths($('.dropmenu > ul li'));
        setUnderlineWidths($('.overlay-menu li'));
    }
    // call on ready, resize and after content changes
    alignUnderlines();
    $(window).on('resize', function(){
        alignUnderlines();
        if ($(window).width() > 840 && isMobileMenuOpen()) {
            closeMobileMenu();
        }
    });
    // also realign after smooth scroll completes (in case header size changes)
    $(document).on('click', 'a[href^="#"]', function(){
        setTimeout(alignUnderlines, 320);
    });

    // EPK gallery lightbox
    var $epkItems = $('.epk-gallery__item');
    var $epkLightbox = $('#epkLightbox');
    if ($epkItems.length && $epkLightbox.length) {
        var $body = $('body');
        var $lightboxImage = $epkLightbox.find('.epk-lightbox__image');
        var $lightboxText = $epkLightbox.find('.epk-lightbox__text');
        var $lightboxDownload = $epkLightbox.find('.epk-lightbox__download-icon');
        var currentIndex = 0;

        function renderLightbox(index) {
            var total = $epkItems.length;
            if (!total) {
                return;
            }
            if (index < 0) index = 0;
            if (index >= total) index = total - 1;
            currentIndex = index;
            var $item = $epkItems.eq(currentIndex);
            var src = $item.data('full');
            var caption = $item.data('caption') || '';
            var alt = $item.data('alt') || caption || 'Press photo';
            var downloadUrl = $item.data('download');
            var filename = $item.data('filename') || '';

            $lightboxImage.attr('src', src).attr('alt', alt);
            $lightboxText.text(caption);
            if (downloadUrl) {
                $lightboxDownload.attr('href', downloadUrl);
                if (filename) {
                    $lightboxDownload.attr('download', filename);
                } else {
                    $lightboxDownload.removeAttr('download');
                }
                $lightboxDownload.show();
            } else {
                $lightboxDownload.hide();
            }
        }

        function openLightbox(index) {
            renderLightbox(index);
            $epkLightbox.addClass('is-active').attr('aria-hidden', 'false');
            $body.addClass('epk-lightbox-open');
        }

        function closeLightbox() {
            $epkLightbox.removeClass('is-active').attr('aria-hidden', 'true');
            $body.removeClass('epk-lightbox-open');
        }

        function showSibling(step) {
            var total = $epkItems.length;
            if (!total) return;
            var nextIndex = (currentIndex + step + total) % total;
            renderLightbox(nextIndex);
        }

        $epkItems.on('click keydown', function(event){
            if ($(event.target).closest('.epk-gallery__download').length) {
                return;
            }
            var isKeyboard = event.type === 'keydown';
            if (isKeyboard) {
                var key = event.key || event.keyCode;
                if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar' && key !== 13 && key !== 32) {
                    return;
                }
                event.preventDefault();
            }
            var index = parseInt($(this).data('index'), 10) || 0;
            openLightbox(index);
        });

        $epkLightbox.find('.epk-lightbox__close').on('click', closeLightbox);
        $epkLightbox.find('.epk-lightbox__backdrop').on('click', closeLightbox);
        $epkLightbox.find('.epk-lightbox__nav--next').on('click', function(){
            showSibling(1);
        });
        $epkLightbox.find('.epk-lightbox__nav--prev').on('click', function(){
            showSibling(-1);
        });

        $(document).on('keydown', function(event){
            if (!$epkLightbox.hasClass('is-active')) return;
            var key = event.key || event.keyCode;
            if (key === 'Escape' || key === 'Esc' || key === 27) {
                closeLightbox();
            } else if (key === 'ArrowRight' || key === 39) {
                showSibling(1);
            } else if (key === 'ArrowLeft' || key === 37) {
                showSibling(-1);
            }
        });
    }

});
