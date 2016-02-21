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
});
