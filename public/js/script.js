function alert(message, type, placeholder) {
    var alertPlaceholder = document.getElementById(placeholder)
    var wrapper = document.createElement('div')
    var html = `<div class="alert alert-${type} alert-dismissible" role="alert">
                    ${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
    wrapper.innerHTML = html;
    alertPlaceholder.append(wrapper)
    
    setTimeout(function () {
        $(".alert").fadeTo(500, 0).slideUp(500, function(){
            $(this).remove(); 
        });
    }, 2000);
    
}

function copytext(field_id) {
    var copyText = document.getElementById(field_id);
    text = $(copyText).val()
    navigator.clipboard.writeText(text);
}

function logout() {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (xhttp.status == 401) {  
        }
        location.href = "/dialog"
    };
    xhttp.open("POST", "/dialog/logout", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function makeProgress(data) {
    jsondata = JSON.parse(data)
    if (jsondata.progress == 0) {
        $("#pubprogress").css('visibility', 'visible')
    }
    if (jsondata.progress <= jsondata.total) {
        percent = (jsondata.progress / jsondata.total) * 100
        $("#pubprogress-bar").css("width", percent + "%").text(percent + "%");
    }
    if (jsondata.progress == jsondata.total) {
        $("#pubprogress").css('visibility', 'hidden')
        $("#pubprogress-bar").css("width", "0%").text("0%");
    }
}

function checkjwt() {
}