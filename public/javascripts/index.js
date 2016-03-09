/**
 * Client-side JS for the landing page
 */

Zepto(function($){

    $("#showRegisterButton").click(function(){
        $("#loginForm").hide();
        $("#registerForm").show();
    });

    $("#showLoginButton").click(function(){
        $("#loginForm").show();
        $("#registerForm").hide();
    });


    // ARTWORK BY CONCEPT-CUBE
    var backgrounds =[ '/images/backgrounds/background2.jpg',  '/images/backgrounds/background3.jpg', '/images/backgrounds/background4.jpg'];

    $("#index").css({
        background: "url(" + backgrounds[Math.floor(Math.random() * 3)] + ")"
    });

    var visibleCredits = false;


    $(".creditsButton").mouseenter(function() {
        $(this).animate({
            width: "80px"
        }, 'slow', 'ease-out', function() {
            $(".creditsButton p").text("Crédits");
        });
    });

    $(".creditsButton").click(function() {

        if (visibleCredits) {
            $("#credit-container").animate({
                bottom: "-200px"
            }, 'fast', 'ease-out', function() {
                console.log( "down");
                visibleCredits = false;
                $("#credit-container img").animate({
                    rotate: '0deg'
                }, 'fast', 'ease-out');
            });
        }else {
            $("#credit-container").animate({
                bottom: 0
            }, 'fast', 'ease-out', function() {
                console.log( "up");
                visibleCredits = true;
                $("#credit-container img").animate({
                    rotate: '180deg'
                }, 'fast', 'ease-out');
            });
        }
         
    });

});
