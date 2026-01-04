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
    $('#toggle').click(function () {
        $(this).toggleClass('active');
        $('#overlay').toggleClass('open');
        $('body').toggleClass('mobile-nav-open');
    });

    // Tree Menu
    $(".tree").treemenu({delay:300});

    // Smooth scroll for anchor links (accounts for header height)
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
            $('.dropmenu ul li').removeClass('active');
            $(this).closest('li').addClass('active');
        }
    });

    // Update active menu item on scroll (highlight current section)
    var sectionIds = $('section.page-section').map(function(){ return this.id; }).get();
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
            $('.dropmenu ul li').removeClass('active');
            $('.dropmenu ul li').has('a[href="#'+current+'"]').addClass('active');
        }
    }
    $(window).on('scroll resize', function(){
        updateActiveOnScroll();
    });
    // initialize
    updateActiveOnScroll();

    // Center underlines: compute each link's center relative to the menu container
    function alignUnderlines(){
        var $ul = $('.dropmenu > ul');
        if (!$ul.length) return;
        var ulRect = $ul[0].getBoundingClientRect();
        $ul.find('li').each(function(){
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
    // call on ready, resize and after content changes
    alignUnderlines();
    $(window).on('resize', function(){
        alignUnderlines();
    });
    // also realign after smooth scroll completes (in case header size changes)
    $(document).on('click', 'a[href^="#"]', function(){
        setTimeout(alignUnderlines, 320);
    });

});
