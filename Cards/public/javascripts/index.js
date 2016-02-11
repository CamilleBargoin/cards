Zepto(function($){

    $("#showRegisterButton").click(function(){
        $("#loginForm").hide();
        $("#registerForm").show();
    });

    $("#showLoginButton").click(function(){
        $("#loginForm").show();
        $("#registerForm").hide();
    });

});
