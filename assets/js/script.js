

/*
Author       : Dreamguys
Template Name: Doccure - Bootstrap Template
Version      : 1.0
*/

(function($) {
    "use strict";

    // Stick Sidebar


    if ($(window).width() > 767) {
        if ($('.theiaStickySidebar').length > 0) {
            $('.theiaStickySidebar').theiaStickySidebar({
                // Settings
                additionalMarginTop: 30
            });
        }
        $('.hideme').css('display', 'none');
        $('.hideinphone').css('display', 'block');

    }

    // Sidebar
    if ($(window).width() <= 991) {
        var Sidemenu = function() {
            this.$menuItem = $('.main-nav a');
        };

        function init() {
            var $this = Sidemenu;
            $('.main-nav a').on('click', function(e) {
                if ($(this).parent().hasClass('has-submenu')) {
                    e.preventDefault();
                }
                if (!$(this).hasClass('submenu')) {
                    $('ul', $(this).parents('ul:first')).slideUp(350);
                    $('a', $(this).parents('ul:first')).removeClass('submenu');
                    $(this).next('ul').slideDown(350);
                    $(this).addClass('submenu');
                } else if ($(this).hasClass('submenu')) {
                    $(this).removeClass('submenu');
                    $(this).next('ul').slideUp(350);
                }
            });
            //$('.main-nav li.has-submenu a.active').parents('li:last').children('a:first').addClass('active').trigger('click');
        }

        // Sidebar Initiate
        init();
    }

    // Textarea Text Count

    var maxLength = 100;
    $('#review_desc').on('keyup change', function() {
        var length = $(this).val().length;
        length = maxLength - length;
        $('#chars').text(length);
    });

    // Select 2

    if ($('.select').length > 0) {
        $('.select').select2({
            minimumResultsForSearch: -1,
            width: '100%'
        });
    }

    // Date Time Picker

    if ($('.datetimepicker').length > 0) {
        $('.datetimepicker').datetimepicker({
            format: 'DD/MM/YYYY',
            icons: {
                up: "fas fa-chevron-up",
                down: "fas fa-chevron-down",
                next: 'fas fa-chevron-right',
                previous: 'fas fa-chevron-left'
            }
        });
    }

    // Fancybox Gallery

    if ($('.clinic-gallery a').length > 0) {
        $('.clinic-gallery a').fancybox({
            buttons: [
                "thumbs",
                "close"
            ],
        });
    }

    // Floating Label

    if ($('.floating').length > 0) {
        $('.floating').on('focus blur', function(e) {
            $(this).parents('.form-focus').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
        }).trigger('blur');
    }

    // Mobile menu sidebar overlay

    $('body').append('<div class="sidebar-overlay"></div>');
    $(document).on('click', '#mobile_btn', function() {
        $('main-wrapper').toggleClass('slide-nav');
        $('.sidebar-overlay').toggleClass('opened');
        $('html').addClass('menu-opened');
        return false;
    });

    $(document).on('click', '.sidebar-overlay', function() {
        $('html').removeClass('menu-opened');
        $(this).removeClass('opened');
        $('main-wrapper').removeClass('slide-nav');
    });

    $(document).on('click', '#menu_close', function() {
        $('html').removeClass('menu-opened');
        $('.sidebar-overlay').removeClass('opened');
        $('main-wrapper').removeClass('slide-nav');
    });

    // Mobile Menu

    /*if($(window).width() <= 991){
    	mobileSidebar();
    } else {
    	$('html').removeClass('menu-opened');
    }*/

    /*function mobileSidebar() {
    	$('.main-nav a').on('click', function(e) {
    		$('.dropdown-menu').each(function() {
    		  if($(this).hasClass('show')) {
    			  $(this).slideUp(350);
    		  }
    		});
    		if(!$(this).next('.dropdown-menu').hasClass('show')) {
    			$(this).next('.dropdown-menu').slideDown(350);
    		}
    		
    	});
    }*/

    // Tooltip

    if ($('[data-toggle="tooltip"]').length > 0) {
        $('[data-toggle="tooltip"]').tooltip();
    }

    // Add More Hours

    $(".hours-info").on('click', '.trash', function() {
        $(this).closest('.hours-cont').remove();
        return false;
    });

    $(".add-hours").on('click', function() {

        var hourscontent = '<div class="row form-row hours-cont">' +
            '<div class="col-12 col-md-10">' +
            '<div class="row form-row">' +
            '<div class="col-12 col-md-3">' +
            '<div class="form-group">' +
            '<label>Start Time</label>' +
            '<select class="form-control" name="start" required>' +
            '<option>12.00 am</option>' +
            '<option>1.00 am</option>' +
            '<option>2.00 am</option>' +
            '<option>3.00 am</option>' +
            '<option>4.00 am</option>' +
            '<option>5.00 am</option>' +
            '<option>6.00 am</option>' +
            '<option>7.00 am</option>' +
            '<option>8.00 am</option>' +
            '<option>9.00 am</option>' +
            '<option>10.00 am</option>' +
            '<option>11.00 am</option>' +
            '<option>12.00 pm</option>' +
            '<option>1.00 pm</option>' +
            '<option>2.00 pm</option>' +
            '<option>3.00 pm</option>' +
            '<option>4.00 pm</option>' +
            '<option>5.00 pm</option>' +
            '<option>6.00 pm</option>' +
            '<option>7.00 pm</option>' +
            '<option>8.00 pm</option>' +
            '<option>9.00 pm</option>' +
            '<option>10.00 pm</option>' +
            '<option>11.00 pm</option>' +
            
            '</select>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="col-12 col-md-3">' +
            '<div class="form-group">' +
            '<label>End Time</label>' +
            '<select class="form-control" name="end">' +
            '<option>12.00 am</option>' +
            '<option>1.00 am</option>' +
            '<option>2.00 am</option>' +
            '<option>3.00 am</option>' +
            '<option>4.00 am</option>' +
            '<option>5.00 am</option>' +
            '<option>6.00 am</option>' +
            '<option>7.00 am</option>' +
            '<option>8.00 am</option>' +
            '<option>9.00 am</option>' +
            '<option>10.00 am</option>' +
            '<option>11.00 am</option>' +
            '<option>12.00 pm</option>' +
            '<option>1.00 pm</option>' +
            '<option>2.00 pm</option>' +
            '<option>3.00 pm</option>' +
            '<option>4.00 pm</option>' +
            '<option>5.00 pm</option>' +
            '<option>6.00 pm</option>' +
            '<option>7.00 pm</option>' +
            '<option>8.00 pm</option>' +
            '<option>9.00 pm</option>' +
            '<option>10.00 pm</option>' +
            '<option>11.00 pm</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="col-md-6" style="margin-bottom: 20px !important;">'+
            '<label>Maximum number of patients in the slot</label>'+
            '<select class="form-control" name="max_count" required>'+
            '<option>1</option>'+
            '<option>2</option>'+
            '<option>3</option>'+
            '<option>4</option>'+
            '<option>5</option>'+
            '<option>6</option>'+
            '<option>7</option>'+
            '<option>8</option>'+
            '<option>9</option>'+
            '<option>10</option>'+
            '<option>11</option>'+
            '<option>12</option>'+
            '<option>13</option>'+
            '<option>14</option>'+
            '<option>15</option>'+
            '<option>16</option>'+
            '<option>17</option>'+
            '<option>18</option>'+
            '<option>19</option>'+
            '<option>20</option>'+
            '<option>21</option>'+
            '<option>22</option>'+
            '<option>23</option>'+
            '<option>24</option>'+
            '<option>25</option>'+
            '<option>26</option>'+
            '<option>27</option>'+
            '<option>28</option>'+
            '<option>29</option>'+
            '<option>30</option>'+
            '<option>31</option>'+
            '<option>32</option>'+
            '<option>33</option>'+
            '<option>34</option>'+
            '<option>35</option>'+
            '<option>36</option>'+
            '<option>37</option>'+
            '<option>38</option>'+
            '<option>39</option>'+
            '<option>40</option>'+
            '<option>41</option>'+
            '<option>42</option>'+
            '<option>43</option>'+
            '<option>44</option>'+
            '<option>45</option>'+
            '<option>46</option>'+
            '<option>47</option>'+
            '<option>48</option>'+
            '<option>49</option>'+
            '<option>50</option>'+
            '<option>51</option>'+
            '<option>52</option>'+
            '<option>53</option>'+
            '<option>54</option>'+
            '<option>55</option>'+
            '<option>56</option>'+
            '<option>57</option>'+
            '<option>58</option>'+
            '<option>59</option>'+
            '<option>60</option>'+
            '<option>61</option>'+
            '<option>62</option>'+
            '<option>63</option>'+
            '<option>64</option>'+
            '<option>65</option>'+
            '<option>66</option>'+
            '<option>67</option>'+
            '<option>68</option>'+
            '<option>69</option>'+
            '<option>70</option>'+
            '</select>'+
            '</div>'+
            '</div>' +
            '</div>' +
            '<div class="col-12 col-md-2"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div>' +
            '</div>';

        $(".hours-info").append(hourscontent);
        return false;
    });

    // Content div min height set

    function resizeInnerDiv() {
        var height = $(window).height();
        var header_height = $(".header").height();
        var footer_height = $(".footer").height();
        var setheight = height - header_height;
        var trueheight = setheight - footer_height;
        $(".content").css("min-height", trueheight);
    }

    if ($('.content').length > 0) {
        resizeInnerDiv();
    }

    $(window).resize(function() {
        if ($('.content').length > 0) {
            resizeInnerDiv();
        }
        /*if($(window).width() <= 991){
        	mobileSidebar();
        } else {
        	$('html').removeClass('menu-opened');
        }*/
    });

    // Slick Slider

    if ($('.specialities-slider').length > 0) {
        $('.specialities-slider').slick({
            dots: true,
            autoplay: false,
            infinite: true,
            variableWidth: true,
            prevArrow: false,
            nextArrow: false
        });
    }

    if ($('.doctor-slider').length > 0) {
        $('.doctor-slider').slick({
            dots: false,
            autoplay: false,
            infinite: true,
            variableWidth: true,
        });
    }
    if ($('.features-slider').length > 0) {
        $('.features-slider').slick({
            dots: true,
            infinite: true,
            centerMode: true,
            slidesToShow: 3,
            speed: 500,
            variableWidth: true,
            arrows: false,
            autoplay: false,
            responsive: [{
                breakpoint: 992,
                settings: {
                    slidesToShow: 1
                }

            }]
        });
    }

    // Date Time Picker

    if ($('.datepicker').length > 0) {
        $('.datepicker').datetimepicker({
            viewMode: 'years',
            showTodayButton: true,
            format: 'DD-MM-YYYY',
            // minDate:new Date(),
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'bottom'
            }
        });
    }

    // Chat

    var chatAppTarget = $('.chat-window');
    (function() {
        if ($(window).width() > 991)
            chatAppTarget.removeClass('chat-slide');

        $(document).on("click", ".chat-window .chat-users-list a.media", function() {
            if ($(window).width() <= 991) {
                chatAppTarget.addClass('chat-slide');
            }
            return false;
        });
        $(document).on("click", "#back_user_list", function() {
            if ($(window).width() <= 991) {
                chatAppTarget.removeClass('chat-slide');
            }
            return false;
        });
    })();

    // Circle Progress Bar

    function animateElements() {
        $('.circle-bar1').each(function() {
            var elementPos = $(this).offset().top;
            var topOfWindow = $(window).scrollTop();
            var percent = $(this).find('.circle-graph1').attr('data-percent');
            var animate = $(this).data('animate');
            if (elementPos < topOfWindow + $(window).height() - 30 && !animate) {
                $(this).data('animate', true);
                $(this).find('.circle-graph1').circleProgress({
                    value: percent / 100,
                    size: 400,
                    thickness: 30,
                    fill: {
                        color: '#da3f81'
                    }
                });
            }
        });
        $('.circle-bar2').each(function() {
            var elementPos = $(this).offset().top;
            var topOfWindow = $(window).scrollTop();
            var percent = $(this).find('.circle-graph2').attr('data-percent');
            var animate = $(this).data('animate');
            if (elementPos < topOfWindow + $(window).height() - 30 && !animate) {
                $(this).data('animate', true);
                $(this).find('.circle-graph2').circleProgress({
                    value: percent / 100,
                    size: 400,
                    thickness: 30,
                    fill: {
                        color: '#68dda9'
                    }
                });
            }
        });
        $('.circle-bar3').each(function() {
            var elementPos = $(this).offset().top;
            var topOfWindow = $(window).scrollTop();
            var percent = $(this).find('.circle-graph3').attr('data-percent');
            var animate = $(this).data('animate');
            if (elementPos < topOfWindow + $(window).height() - 30 && !animate) {
                $(this).data('animate', true);
                $(this).find('.circle-graph3').circleProgress({
                    value: percent / 100,
                    size: 400,
                    thickness: 30,
                    fill: {
                        color: '#1b5a90'
                    }
                });
            }
        });
    }

    if ($('.circle-bar').length > 0) {
        animateElements();
    }
    $(window).scroll(animateElements);


})(jQuery);