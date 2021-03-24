let vote = ($scope, type, index = -1) => {
    if ($scope.loggedOut) {
        return;
    }
    if (!$scope.voteWait) {
        $scope.voteWait = true;
    } else {
        return;
    }
    let postID = $scope.id ? $scope.id : $scope.posts[index].post._id;
    let req = '/api/vote';
    let xhttp = customHttp("POST", req, () => {
        if (xhttp.status == 205) {
            if ($scope.id) {
                $scope.post.post.upvotes -= 1;
            } else {
                $scope.posts[index].post.upvotes -= 1;
            }
        } else if (xhttp.status == 200) {
            if ($scope.id) {
                $scope.post.post.upvotes += 1;
            } else {
                $scope.posts[index].post.upvotes += 1;
            }
        } else if (xhttp.status == 201) {
            if ($scope.id) {
                $scope.post.post.upvotes += 1;
                $scope.post.post.downvotes -= 1;
            } else {
                $scope.posts[index].post.upvotes += 1;
                $scope.posts[index].post.downvotes -= 1;
            }
        } else if (xhttp.status == 202) {
            if ($scope.id) {
                $scope.post.post.downvotes -= 1;
            } else {
                $scope.posts[index].post.downvotes -= 1;
            }
        } else if (xhttp.status == 203) {
            if ($scope.id) {
                $scope.post.post.downvotes += 1;
            } else {
                $scope.posts[index].post.downvotes += 1;
            }
        } else if (xhttp.status == 204) {
            if ($scope.id) {
                $scope.post.post.downvotes += 1;
                $scope.post.post.upvotes -= 1;
            } else {
                $scope.posts[index].post.downvotes += 1;
                $scope.posts[index].post.upvotes -= 1;
            }
        }
        $scope.$apply();
        $scope.voteWait = false;
    });
    xhttp.send(JSON.stringify({
        pid: postID,
        btn: type
    }));
}

let getPosts = ($scope, endPoint, moreChange) => {
    let xhttp = customHttp('GET', endPoint, () => {
        if (xhttp.status != 200) {
            console.log(xhttp.responseText);
            return;
        }
        response = JSON.parse(xhttp.responseText);
        if (response.list) {
            $scope.postC += 1;
            for (i in response.list) {
                $scope.posts.push({
                    post: response.list[i],
                    comments: {
                        amount: response.list[i].comments,
                        comments: []
                    }
                });
            }
            $scope.numPosts = response.length;
            if (response.list.length < moreChange) {
                $scope.more = false;
            }
        } else {
            $scope.post.post = response;
        }
        $scope.$apply();
    });
    xhttp.send();
}

let getMorePosts = ($scope, endPoint, moreChange) => {
    let xhttp = customHttp('GET', endPoint, () => {
        if (xhttp.status != 200) {
            console.log(xhttp.responseText);
            return;
        }
        let response = JSON.parse(xhttp.responseText);
        $scope.postC += 1;
        for (i in response.list) {
            $scope.posts.push({
                post: response.list[i],
                comments: {
                    amount: 0,
                    comments: []
                }
            });
        }
        if (response.list.length < moreChange) {
            $scope.more = false;
        }
        $scope.$apply();
    });
    xhttp.send();
}

let loadComments = ($scope, index = -1) => {
    $scope.moreC = false;
    $scope.commentC = 1;
    let template_id = $scope.id ? $scope.id : $scope.posts[index].post._id;
    let req = `/api/comments/` + template_id + "/" + $scope.commentC;
    let xhttp = customHttp("GET", req, () => {
        $scope.commentC += 1;
        let response = JSON.parse(xhttp.responseText);
        if (!$scope.id) {
            $scope.posts[index].comments.comments = response.comments;
            $scope.posts[index].comments.amount = response.length;
            if (response.comments.length >= 10) {
                $scope.moreC = true;
            }
            if (!response.length) {
                $scope.noPost = true;
            } else {
                $scope.noPost = false;
            }
        } else {
            $scope.post.comments.comments = response.comments;
            $scope.post.comments.amount = response.length;
            if (response.comments.length >= 10) {
                $scope.moreC = true;
            }
            if (!response.length) {
                $scope.noPost = true;
            } else {
                $scope.noPost = false;
            }
        }
        $scope.$apply();
    });
    xhttp.send();
};

let loadMoreComments = ($scope, index = -1) => {
    let template_id = $scope.id ? $scope.id : $scope.posts[index].post._id;
    let req = `/api/comments/` + template_id + "/" + $scope.commentC;
    let xhttp = customHttp("GET", req, () => {
        $scope.commentC += 1;
        let response = JSON.parse(xhttp.responseText);
        if (!$scope.id) {
            $scope.posts[index].comments.comments = $scope.posts[index].comments.comments.concat(response.comments);
            if (response.comments.length >= 10) {
                $scope.moreC = true;
            } else {
                $scope.moreC = false;
            }
        } else {
            $scope.post.comments.comments = $scope.post.comments.comments.concat(response.comments);
            if (response.comments.length >= 10) {
                $scope.moreC = true;
            } else {
                $scope.moreC = false;
            }
        }
        $scope.$apply();
    });
    xhttp.send();
};
let addComment = ($scope, index = -1) => {
    let template_id = $scope.id ? $scope.id : $scope.posts[index].post._id;
    let commmentAreaID = 'commentInput_' + template_id;
    let comment = sanitizeString($("#" + commmentAreaID).val());
    if (comment == '') {
        return;
    }
    let xhttp = customHttp("POST", '/api/comments', () => {
        if (xhttp.status != 200) {
            alert("Oof there was an error!\nTry again later!");
            return;
        }
        if (!$scope.id) {
            $scope.posts[index].comments.comments.unshift({
                username: $scope.User.username,
                profilePicture: $scope.userPic,
                comment: comment
            });
            $scope.posts[index].comments.amount += 1;
        } else {
            $scope.post.comments.comments.unshift({
                username: $scope.User.username,
                profilePicture: $scope.userPic,
                comment: comment
            });
            $scope.post.comments.amount += 1;
        }
        $("#" + commmentAreaID).val("");
        $scope.$apply();
    });
    xhttp.send(JSON.stringify({
        "id": template_id,
        "comment": comment,
    }));
};