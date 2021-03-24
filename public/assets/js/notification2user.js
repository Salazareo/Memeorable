// Display the first 3 notifications for the user
function displayNotification() {
    let user = localStorage.username;
    if (!user) {
        return;
    }
    var xhttp = new XMLHttpRequest();
    let req = "/api/notifications/" + user;
    xhttp.open("GET", req);
    xhttp.onload = () => {
        var res_json = JSON.parse(xhttp.responseText);
        if (xhttp.status == 404 || xhttp.status == 500) {
            console.log("notification not 200");
        }
        else {
            // dont have any unread notifications, or dont have notification at all
            var bell = document.getElementById("bell");
            if (res_json == null || res_json.notifications.length == 0 || xhttp.status == 201) {
                // HTML obj settings
                bell.setAttribute('class', 'la la-bell');
                noUnread();
                appendViewAll();
                return;
            }
            var ntfNum = res_json.notifications.length;
            let parent = document.getElementById("ntfList");
            var limit = 0;
            var counter = 0;
            var added = false;
            var addable = true;
            while (addable) {
                // if the message from here is read, skip it
                if (counter == ntfNum) {
                    addable = false;
                    break;
                }
                if (res_json.notifications[counter].isRead == true) {
                    counter++;
                    if (counter == ntfNum) {
                        addable = false;
                    }
                    continue;
                }
                added = true;
                let msg = res_json.notifications[counter].message;
                let ntfID = res_json.notifications[counter]._id;
                counter++;
                limit++;
                // HTML obj settings
                let li = document.createElement("li");
                parent.appendChild(li);
                // might want to add date/time for the notification as: <span class="date">10 hours ago</span>
                li.innerHTML = '<a value= ' + ntfID + ' id=nid' + counter + ' name=msg' + counter + '>\
                                    <div class="message-icon">\
                                    <i class="la la-star-o"></i>\
                                    </div>\
                                    <div class="message-body">\
                                    <div class="message-body-heading noti-text" id=msg'+ counter + '>' + msg + '</div>\
                                    </div>\
                                </a>';
                // set the notification read if click on it
                $('#nid' + counter).click(function () {
                    // gey the id of that message HTML obj
                    var test = $(this)[0].name;
                    let msgg = document.getElementById(test);
                    msgg.setAttribute('class', 'message-body-heading noti-text-after');
                    var xhttp1 = new XMLHttpRequest();
                    let req1 = {
                        username: user,
                        nID: ntfID
                    };
                    xhttp1.open("POST", "/api/notifications");
                    xhttp1.onload = () => {
                        if (xhttp1.status != 200) {
                            console.log("something's wrong");
                        } else {
                            $(this).css('color', '#a3a1a2');
                        }
                    }
                    xhttp1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhttp1.send(JSON.stringify(req1));
                });
                // we only want newest 3 notifications
                if (limit == ntfNum || limit == 3 || counter == ntfNum) {
                    addable = false;
                }
            }
            // append the "no notifications" HTML obj
            if (!added) {
                bell.setAttribute('class', 'la la-bell');
                noUnread();
                appendViewAll();
            } else {
                bell.setAttribute('class', 'la la-bell animated infinite swing');
                redSpot.setAttribute('class', 'badge-pulse');
                appendViewAll();
            }
        }
    }
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send();
}


function setRead() {
    let user = localStorage.username;
    var xhttp = new XMLHttpRequest();
    let req = "/api/notifications";
    xhttp.open("POST", req);
    xhttp.onload = () => {
        setBell(false);
        noUnread();
    }
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({ username: user }));


}
// the view all notification HTML obj
function appendViewAll() {
    let parent = document.getElementById("ntfList");
    let viewAll = document.createElement("li");
    parent.appendChild(viewAll);
    viewAll.innerHTML = '\
            <a rel="nofollow" href="notifications.html" class="dropdown-item all-notifications text-center">View All Notifications</a>';
}
//"no notifications" HTML obj
function noUnread() {
    let parent = document.getElementById("ntfList");
    let li = document.createElement("li");
    parent.appendChild(li); //<span class="date">10 hours ago</span>\
    li.innerHTML = '<a>\
                        <div class="message-icon">\
                        <i class="la la-star-o"></i>\
                        </div>\
                        <div class="message-body">\
                        <div class=message-body-heading"> No unread notifications</div>\
                        </div>\
                    </a>';
}

function setBell(swing) {
    var bell = document.getElementById("bell");
    var redSpot = document.getElementById("redSpot");
    if (swing) {
        bell.setAttribute('class', 'la la-bell animated infinite swing');
        redSpot.setAttribute('class', 'badge-pulse');
    } else {
        bell.setAttribute('class', 'la la-bell');
        redSpot.setAttribute('class', '');
    }
}

function redirect2notification(allNotifications) {
    wondow.location = "notifications.html";
}
function ntfHistory() {
    var user = localStorage.username;
    var xhttp = new XMLHttpRequest();
    let req = "/api/notifications/" + user;
    xhttp.open("GET", req);
    xhttp.onload = () => {
        var res_json = JSON.parse(xhttp.responseText);
        if (xhttp.status == 404 || xhttp.status == 500) {
            console.log("notification not 200");
            //shuold lead to 404 page
        }
        else {
            var parent = document.getElementById("allNtf");
            if (res_json == null || res_json.notifications.length == 0 || xhttp.status == 201) {
                // HTML obj settings
                emptyNtf();
                return;
            }
            var counter = 0;
            while (counter < res_json.notifications.length) {
                let msg = res_json.notifications[counter].message;
                let ntfID = res_json.notifications[counter]._id;
                counter++;
                // HTML obj settings
                let li = document.createElement("li");
                li.setAttribute('class', 'list-group-item');
                parent.appendChild(li);
                // might want to add date/time for the notification as: <span class="date">10 hours ago</span>
                li.innerHTML = '<div class="media" value= ' + ntfID + ' id=nid' + counter + ' name=msg' + counter + ' text=tid' + counter + '>\
                                   <div class="media-left align-self-center mr-5">\
                                      <span class="ti-medium ion-person-add"></span>\
                                   </div>\
                                   <div class="media-body align-self-center">\
                                      <h5 class="m-0" id=tid'+ counter + '>' + msg + '</h5>\
                                   </div>\
                                   <div class="media-right align-self-center">\
                                   <button id=msg'+ counter + ' name=nid' + counter + ' type="button" class="ion-close-round" data-toggle="tooltip" data-placement="top" title="Delete Notification"></button>\
                                   </div>\
                                </div>';
                if (res_json.notifications[counter - 1].isRead == true) {
                    li.setAttribute('color', '#a3a1a2');
                } else {
                    li.setAttribute('color', '#bc104f');
                }
                // onclicke function for delete btn in each message
                $('#msg' + counter).click(function () {
                    // gey the id of that message HTML obj
                    var test = $(this)[0].name;
                    var xhttp1 = new XMLHttpRequest();
                    let req1 = {
                        username: user,
                        nID: ntfID
                    };
                    xhttp1.open("DELETE", "/api/notifications");
                    xhttp1.onload = () => {
                        if (xhttp1.status != 200) {
                            console.log("something's wrong");
                        } else {
                            var parent = document.getElementById("allNtf");
                            var child = document.getElementById(test).parentElement;
                            parent.removeChild(child);
                        }
                    }
                    xhttp1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhttp1.send(JSON.stringify(req1));
                });
            }
        }
    }
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send();
}
// HTML form for user that dont have any notifications
function emptyNtf() {
    let parent = document.getElementById("allNtf");
    let li = document.createElement("li");
    li.setAttribute('class', 'list-group-item');
    parent.appendChild(li); //<span class="date">10 hours ago</span>\
    li.innerHTML = '<div class="media">\
                    <div class="media-left align-self-center mr-5">\
                        <span class="ti-medium ion-person"></span>\
                            </div>\
                            <div class="media-body align-self-center">\
                            No notifications\
                            </div>\
                    </div>';
}
// for clear all btn
function clearAll() {
    let req = "/api/notifications/" + localStorage.username;
    var xhttp = new XMLHttpRequest();

    xhttp.open("DELETE", req);
    xhttp.onload = () => {
        if (xhttp.status != 200) {
            alert("Something went wrong! Please try again later!");
        } else {
            let parent = document.getElementById("allNtf");
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            emptyNtf();
        }
    }
    xhttp.send();
}

function redirect2notification() {
    wondow.location = "notifications.html";
}
