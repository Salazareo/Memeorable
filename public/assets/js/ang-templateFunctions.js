let toggleFave = ($scope, id, index = -1) => {
    let xhttp = customHttp("PUT", "/api/fav", () => {
        if ($scope.favourite != undefined) {
            $scope.favourite = !$scope.favourite;
        } else {
            $scope.templates[index].fave = !$scope.templates[index].fave;
        }
        $scope.$apply();
    });
    let req = {
        fav_template: id
    };
    xhttp.send(JSON.stringify(req));
}
let getNewTemplates = ($scope, endPoint) => {
    let xhttp = customHttp("GET", endPoint, () => {
        $scope.count += 1;
        response = JSON.parse(xhttp.responseText);
        if (response.length < 12) {
            $scope.more = false;
        }
        $scope.templates = response;
        $scope.$apply();
    });
    xhttp.send();
}

let getMoreTemplates = ($scope, endPoint) => {
    let xhttp = customHttp("GET", endPoint, () => {
        response = JSON.parse(xhttp.responseText);
        $scope.count += 1;
        if (response.length < 12) {
            $scope.more = false;
        }
        $scope.templates = $scope.templates.concat(response);
        $scope.$apply();
    });
    xhttp.send();
}