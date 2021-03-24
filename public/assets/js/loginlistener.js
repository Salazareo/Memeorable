window.addEventListener("keydown", checkKeyPressed, false);

function checkKeyPressed(e) {
  //console.log(e);
  //console.log(document.getElementById('username').value);
  //console.log(e.code);
    if ((e.keyCode == 13 ||e.code == "Enter") && document.getElementById('username').value != "" && document.getElementById('password').value != "") {
        login();
        //console.log("Login was clicked");
    }
}
