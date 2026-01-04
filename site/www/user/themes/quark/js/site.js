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

    $(document).on('click', 'a[href^="#"]', function(e){
        var href = $(this).attr('href');
        // ignore empty or just '#'
        if (!href || href === '#') return;
        var id = href.slice(1);
        var $target = $('#' + id);
        if ($target.length) {
            e.preventDefault();
            // calculate offset (current header height)
            var headerHeight = $('#header').outerHeight() || 0;
            var targetTop = $target.offset().top - headerHeight;
            $('html, body').animate({ scrollTop: targetTop }, 600);
            // update hash without jumping
            if (history.replaceState) {
                history.replaceState(null, null, '#' + id);
            } else {
                location.hash = '#' + id;
            }
            // mark active menu item
            setActiveNavItem(id);
        }
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

});
