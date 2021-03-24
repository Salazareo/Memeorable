var email;
var aboutUser;
let jwtHeader = "Bearer " + localStorage.token;
// grab the user info from DB
function render() {
    var user = localStorage.getItem("username"); // not sure how to get username
    let xhttp = customHttp("GET", "/api/user", () => {
        var res_json = JSON.parse(xhttp.responseText);
        if (xhttp.responseText == "Error 400" || xhttp.responseText == "Error 401") {
            alert("Something went wrong line 12");
        } else {
            document.getElementById("set_email").value = "" + res_json.email;
            document.getElementById("set_desc").innerHTML = res_json.aboutMe;
            document.getElementById("profilePic1").setAttribute("src", res_json.profilePicture);
            document.getElementById("profilePic2").setAttribute("src", res_json.profilePicture);
            document.getElementById("profilePic3").setAttribute("src", res_json.profilePicture);
            var joinDate;
            joinDate = res_json.dateJoined.toString();
            var showDate = getDate(joinDate);
            if (document.getElementById("settingsJoinDate")) {
                document.getElementById("settingsJoinDate").placeholder = showDate;
            }
        }
    });
    // xhttp.open("POST", "/api/userProfile");

    // xhttp.onload = () => {
    //     var res_json = JSON.parse(xhttp.responseText);
    //     if (xhttp.responseText == "Error 400" || xhttp.responseText == "Error 401") {
    //         alert("Something went wrong line 12");
    //     } else {
    //         document.getElementById("set_email").value = "" + res_json.email;
    //         document.getElementById("set_desc").innerHTML = res_json.aboutMe;
    //         document.getElementById("profilePic1").setAttribute("src", res_json.profilePicture);
    //         document.getElementById("profilePic2").setAttribute("src", res_json.profilePicture);
    //         document.getElementById("profilePic3").setAttribute("src", res_json.profilePicture);
    //         var joinDate;
    //         joinDate = res_json.dateJoined.toString();
    //         var showDate = getDate(joinDate);
    //         if (document.getElementById("settingsJoinDate")) {
    //             document.getElementById("settingsJoinDate").placeholder = showDate;
    //         }
    //     }
    // }
    // xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // xhttp.setRequestHeader("Authorization", jwtHeader);
    xhttp.send();
}
// update the password and setting part
function saveChanges() {
    render();
    document.getElementById("changesSavedAlert").setAttribute('style', 'display:none;');
    document.getElementById("errorsFoundAlert").setAttribute('style', 'display:none;');
    var desc = $('#set_desc').val();
    var set_email = $('#set_email').val();
    var pw = $('#pw').val();
    var set_pw = $('#new_pw').val();
    var set_pw_con = $('#new_pw_con').val();
    let error = "";

    var user = localStorage.getItem("username"); // not sure how to get username
    var xhttp = new XMLHttpRequest();

    var req;
    if (set_email == "") {
        req = {
            username: user,
            aboutMe: desc
        };
    } else {
        req = {
            username: user,
            aboutMe: desc,
            email: set_email
        };
    }
    xhttp.open("PUT", "/api/user");

    xhttp.onload = () => {
        var res_json = JSON.parse(xhttp.responseText);
        if (xhttp.responseText == "Error 400") {
            console.log("Error 400 encountered.");
            document.getElementById("errorsFoundAlert").setAttribute('style', 'display:block;');
            document.getElementById("errormsg").innerHTML = '400. Bad Request. Seems like an issue on our end. Please try again later or contact a MEMEorable Admin.';
        } else if (xhttp.responseText == "Error 401") {
            console.log("Error 401 encountered.");
            document.getElementById("errorsFoundAlert").setAttribute('style', 'display:block;');
            document.getElementById("errormsg").innerHTML = '401. Unauthorized Access. There is an issue processing your changes. Please try again later or contact a MEMEorable Admin.';
        } else {
            if (set_pw == "" && set_pw_con == "") {
                //console.log("saved");
                document.getElementById("changesSavedAlert").setAttribute('style', 'display:block;');
            }
            email = res_json.email;
            render();
        }
    }
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(req));

    if (set_pw == "" && set_pw_con == "") {

    } else {
        if (set_pw.length < 4 || set_pw != set_pw_con) {
            document.getElementById("new_pw").style.borderColor = "red";
            document.getElementById("new_pw_con").style.borderColor = "red";
            error += "<ul style='list-style: circle inside !important;'>";
            if (set_pw != set_pw_con) {
                error += "<li style='list-style: circle inside !important;'> Passwords do not match</li>";
            }
            if (set_pw.length < 4) {
                error += "<li style='list-style: circle inside !important;'> Password has to be longer than 4 characters</li>";
            }
            error += "</ul>";
            document.getElementById("errorsFoundAlert").setAttribute('style', 'display:block;');
            document.getElementById("errormsg").innerHTML = error;
            return 1;
        }
        var xhttp3 = new XMLHttpRequest();
        var req3 = {
            username: user,
            password: CryptoJS.SHA256(pw, user).toString()
        };
        xhttp3.open("POST", "/api/login");
        xhttp3.onload = () => {
            if (xhttp3.responseText == "Error 400" || xhttp3.responseText == "Error 401") {
                document.getElementById("pw").style.borderColor = "red";
                document.getElementById("new_pw").style.borderColor = "black";
                document.getElementById("new_pw_con").style.borderColor = "black";
                //console.log("Old Password doesn't match");
                document.getElementById("errorsFoundAlert").setAttribute('style', 'display:block;');
                document.getElementById("errormsg").innerHTML = '- Your old password does not match.'
            } else {
                var xhttp2 = new XMLHttpRequest();
                var req2 = {
                    username: user,
                    password: CryptoJS.SHA256(set_pw, user).toString()
                };
                xhttp2.open("POST", "/api/resetPassword");
                xhttp2.onload = () => {
                    //console.log("New Password Changed Successfully");
                    document.getElementById("changesSavedAlert").setAttribute('style', 'display:block;');
                    document.getElementById("pw").style.borderColor = "black";
                    document.getElementById("new_pw").style.borderColor = "black";
                    document.getElementById("new_pw_con").style.borderColor = "black";
                    render();
                }
                xhttp2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhttp2.send(JSON.stringify(req2));
            }
        }
        xhttp3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp3.send(JSON.stringify(req3));
    }
}

$('#save_btn').on('click', saveChanges);