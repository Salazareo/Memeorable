const customHttp = (method, url, onload = null) => {
    let xhttp = new XMLHttpRequest();
    let jwtHeader = "Bearer " + (localStorage.token ? localStorage.token : "");
    xhttp.open(method, url);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("Authorization", jwtHeader);
    xhttp.onload = onload;

    return xhttp;
}

let isLoggedIn = ($scope) => {
    if ($scope.User.username && localStorage.token) {
        let xhttp = customHttp("GET", "/api/user", () => {
            if (xhttp.status == 200) {
                window.location.href = '/index.html';
            }
        });
        xhttp.send();
    }
}

let sanitizeString = (str) => {
    str = str.replace(/[^a-z0-9áéíóúñü!?$@# \.,_-]/gim, "");
    return str.trim();
}

let strongerSanitize = (str) => {
    str = str.replace(/[^a-z0-9áéíóúñü!$@# ,_-]/gim, "");
    return str.trim();
}


let getDate = (joinDate) => {
    var year;
    var month;
    var day;
    year = joinDate.substring(0, 4);
    month = joinDate.substring(5, 7);
    day = joinDate.substring(8, 10);
    var mon;
    switch (month) {
        case "01":
            mon = "January";
            break;
        case "02":
            mon = "February";
            break;
        case "03":
            mon = "March";
            break;
        case "04":
            mon = "April";
            break;
        case "05":
            mon = "May";
            break;
        case "06":
            mon = "June";
            break;
        case "07":
            mon = "July";
            break;
        case "08":
            mon = "August";
            break;
        case "09":
            mon = "September";
            break;
        case "10":
            mon = "October";
            break;
        case "11":
            mon = "November";
            break;
        case "12":
            mon = "December";
            break;

        default:
            "January";
    }
    var a = mon + " " + day + ", " + year;
    return a;
}