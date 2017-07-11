$(document).ready(function(){

    $("#signupForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 2,
                remote: {
                    url: "/users/verify/signup",
                    data:{
                    }

                }
            },
            password: {
                required: true,
            }
        },
        messages: {
            username: {
                required: "用户名不能为空",
                minlength: "长度至少为2",
                remote: "用户名已存在"
            },
            password: {
                required: "密码不能为空"
            }
        }
    })

})

function signupCheck(){
    var flag = $('#signupForm').valid()
    if(!flag){
        return;
    }

    $.ajax({
        type: "POST",
        url: "/users/signup",
        data : {
            username: $('#signupName').val(),
            password: $('#signupPassword').val()
        },
        success: function(msg) {
            if(msg.success){
                location.reload()
            }
        }
    });
}

function signinCheck(){
    $.ajax('/users/signin',{
        type: 'post',
        data:{
            username: $('#fieldName').val(),
            password: $('#fieldPassword').val()
        },
        success: function(data){
            if(data){
                if(data.success){
                    if(location.pathname !== '/signin')
                        location.reload()
                    else
                        history.back()
                }
                if(data.nameError){
                    if($('#fieldName-error').length<=0){
                        var error = '<label id="fieldName-error" class="error" for="fieldName">' + data.nameError + '</label>'
                        $('#fieldName').after(error)
                    }
                    
                }
                if(data.passwordError){
                    if($('#fieldPassword-error').length <= 0){
                               var error = '<label id="fieldPassword-error" class="error" for="fieldPassword">' + data.passwordError + '</label>'
                    $('#fieldPassword').after(error)
                    }
                }
             

            }
        }
    })

    return false
}

function newCategoryCheck(){
    var newCategory = $('#inputCategory').val().trim()
    console.log(newCategory)
    if(newCategory){
       $.ajax('/category/verify/add',{
            type: 'post',
            data:{
                newCategory: newCategory,
            },
            success: function(data){
                if(data){
                    if(data.success){
                        console.log(data)
                        $("#fieldCategory-error").remove()
                        $('#addMovieForm').submit()
                    }
                    if (data.error) {
                        console.log(data)
                        if($('#fieldCategory-error').length<=0){
                            var error = '<label id="fieldCategory-error" class="error" for="inputCategory">' + data.error + '</label>'
                            $('#inputCategory').after(error)
                        }

                    }  

                }
            }
        }) 

    }
    else{
        $('#addMovieForm').submit()
    }
}