window.addEventListener("keydown", checkKeyPressed, false);

function checkKeyPressed(e) {
  if ((e.keyCode == 13 || e.code == "Enter") && document.getElementById('SearchBar').value != "") {
    searchReady();
  }
}


function SearchPost() {
  var urlreq = new URLSearchParams(location.search);
  let strTags = urlreq.get("tags");
  strTags = strTags.toLowerCase();
  if (!strTags) {
    window.location = '/public/404.html';
  }
  strTags = strTags.replace("_", ' ');
  let tags = strTags.split(',');
  document.getElementById("inputtags").innerHTML = tags;

  for (i = 0; i < tags.length; i++) {
    tags[i] = tags[i].trim();
  }
  //console.log(tags);    
  var req = {
    pTags: tags
  };

  // SEARCHING FOR USERS---------------------------------------------------------------
  var uhttp = new XMLHttpRequest();
  uhttp.open("POST", "/api/searchUsers");
  uhttp.onload = () => {
    var res_json = JSON.parse(uhttp.responseText);
    if (uhttp.responseText == "Error 400" || uhttp.responseText == "Error 401") {
      console.log("IT DOESN'T WORK");
    } else {

      if (res_json.length == 0) {
        document.getElementById("MainUserText").innerHTML = "No Users Found :(";
        document.getElementById("inputusers").innerHTML = "";
      } else {
        let usermain = document.getElementById("user_result_listing");
        for (let u = 0; u < res_json.length; u++) {
          let userSpan = document.createElement("span");
          userSpan.setAttribute('class', "user my-auto ml-3 mr-3");
          usermain.appendChild(userSpan);
          userSpan.innerHTML = '<a href="/profile.html?username=' + res_json[u].username + '">\
                                    <img src="/assets/img/avatar/avatar-black-sm.jpg" class="results_user_pic mb-2">\
                                    <p class="mb-0 mt-1">' + res_json[u].username + '</p>\
                                    </a>'




        }
        //console.log(res_json[u]);
      }
    }
  }
  uhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  uhttp.send(JSON.stringify(req));


  // NOW SEARCHING FOR POSTS-----------------------------------------------------------

  let xhttp = customHttp("GET", "/api/searchPosts/" + JSON.stringify(tags), () => {
    var res_json = JSON.parse(xhttp.responseText);
    if (xhttp.responseText == "Error 400" || xhttp.responseText == "Error 401") {
      console.log("IT DOESN'T WORK");
    } else {
      let main = document.getElementById("searchResults");
      if (res_json.length == 0) {
        document.getElementById("MainPostText").innerHTML = "No Posts Found :(";
        document.getElementById("inputtags").innerHTML = "";
      } else {
        for (let i = 0; i < res_json.length; i++) {
          //console.log(res_json[i]);
          let div = document.createElement('div');
          div.setAttribute("class", "col-lg-2 col-md-3 col-sm-4 col-6");

          let link = document.createElement('a');
          link.setAttribute('href', '');
          link.setAttribute('role', "button");
          link.setAttribute('data-toggle', "modal");
          link.setAttribute('data-target', "#modal-img" + i);
          link.setAttribute('class', 'profile_post grow-link');
          let onclickID = 'loadComments("' + res_json[i]._id + '")';
          link.setAttribute("onclick", onclickID);

          let element = document.createElement("img");
          element.setAttribute("src", res_json[i].pLink);
          element.setAttribute("class", "profile_post_sm profile_post_bg mx-auto");

          link.appendChild(element);
          div.append(link);
          main.appendChild(div);

          let modal = document.createElement("div");
          modal.setAttribute("id", "modal-img" + i);
          modal.setAttribute("class", "modal fade");
          modal.setAttribute("style", "display:none;");
          modal.setAttribute("aria-hidden", "true");
          main.appendChild(modal);
          let tags = res_json[i].pTags;
          let tagsDIV = "";
          tagcount = 0;

          while (tagcount < tags.length) {
            tagsDIV = tagsDIV + '<a href="search-results.html?tags=' + tags[tagcount] + '" class="tag">' + tags[tagcount] + '</a>';
            tagcount++;
          }


          modal.innerHTML = '<div class="modal-dialog modal-dialog-centered profile-post-img-modal"> \
                                          <div class="modal-content"> \
                                          <div class="modal-header"> \
                                          <h4 class="modal-title"><a href="profile.html?username=' + res_json[i].username + '"><img src="assets/img/avatar/avatar-black-sm.jpg" class="profile-pic">' + res_json[i].username + '</a></h4> \
                                              <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">close</span></button> \
                                          </div> \
                                          <div class="modal-body"> \
                                              <div class="row"> \
                                                <div class="col-lg-7 col-md-6 col-sm-12 col-12 mb-2"><img src="' + res_json[i].pLink + '" class="profile_post_popup_img mx-auto"><br>' + tagsDIV + '</div> \
                                                <div class="col-lg-5 col-md-6 col-sm-12 col-12 mb-2"> \
                                                  <div class="publisher publisher-multi"> \
                                                  <h5>Post a Comment</h5> \
                                                  <br> \
                                                  <textarea class="publisher-input" rows="1" id="commentInput_' + res_json[i]["_id"] + '"></textarea> \
                                                  <div class="publisher-bottom d-flex justify-content-end"> \
                                                      <button class="btn btn-gradient-01" id="postComment" onclick="addProfileComment(\'' + String(res_json[i]["_id"]) + '\')">Post Comment</button> \
                                                  </div> \
                                                  <hr class="bg-secondary mt-4 mb-4"> \
                                                  <div id="commentListFor' + res_json[i]["_id"] + '" style="overflow:scroll; height:300px;">\
                                                </div> \
                                              </div> \
                                              </div> \
                                          </div> \
                                          <div class="modal-footer"> \
                                          <span class="post-dets"> \
                                          <b><a class="la la-thumbs-o-up post-icon text-success" onClick="Vote(\'' + res_json[i]._id + '\',1)")"></a></b><span class="count" id="upVote' + res_json[i]._id + '"> ' + res_json[i].upvotes + ' </span><span class="vertical-line">&nbsp;</span>\
                                          <b><a class="la la-thumbs-o-down post-icon text-danger" onClick="Vote(\'' + res_json[i]._id + '\',0)"></a></b><span class="count" id="downVote' + res_json[i]._id + '">' + res_json[i].downvotes + ' </span><span class="vertical-line">&nbsp;</span>\
                                          <b><a class="la la-comment post-icon text-info"></a></b><span class="count" id="commentCount' + res_json[i]["_id"] + '"> ' + (res_json[i].comments).length + ' </span> \
                                          </span> \
                                          </div> \
                                          </div> \
                                      </div>';
        }
      }
    }
  });
  xhttp.send();
  // var xhttp = new XMLHttpRequest();


  // xhttp.open("POST", "/api/searchPosts");
  // xhttp.onload = () => {
  //   var res_json = JSON.parse(xhttp.responseText);
  //   if (xhttp.responseText == "Error 400" || xhttp.responseText == "Error 401") {
  //     console.log("IT DOESN'T WORK");
  //   } else {
  //     let main = document.getElementById("searchResults");
  //     if (res_json.length == 0) {
  //       document.getElementById("MainPostText").innerHTML = "No Posts Found :(";
  //       document.getElementById("inputtags").innerHTML = "";
  //     } else {
  //       for (let i = 0; i < res_json.length; i++) {
  //         //console.log(res_json[i]);
  //         let div = document.createElement('div');
  //         div.setAttribute("class", "col-lg-2 col-md-3 col-sm-4 col-6");

  //         let link = document.createElement('a');
  //         link.setAttribute('href', '');
  //         link.setAttribute('role', "button");
  //         link.setAttribute('data-toggle', "modal");
  //         link.setAttribute('data-target', "#modal-img" + i);
  //         link.setAttribute('class', 'profile_post grow-link');
  //         let onclickID = 'loadComments("' + res_json[i]._id + '")';
  //         link.setAttribute("onclick", onclickID);

  //         let element = document.createElement("img");
  //         element.setAttribute("src", res_json[i].pLink);
  //         element.setAttribute("class", "profile_post_sm profile_post_bg mx-auto");

  //         link.appendChild(element);
  //         div.append(link);
  //         main.appendChild(div);

  //         let modal = document.createElement("div");
  //         modal.setAttribute("id", "modal-img" + i);
  //         modal.setAttribute("class", "modal fade");
  //         modal.setAttribute("style", "display:none;");
  //         modal.setAttribute("aria-hidden", "true");
  //         main.appendChild(modal);
  //         let tags = res_json[i].pTags;
  //         let tagsDIV = "";
  //         tagcount = 0;

  //         while (tagcount < tags.length) {
  //           tagsDIV = tagsDIV + '<a href="search-results.html?tags=' + tags[tagcount] + '" class="tag">' + tags[tagcount] + '</a>';
  //           tagcount++;
  //         }


  //         modal.innerHTML = '<div class="modal-dialog modal-dialog-centered profile-post-img-modal"> \
  //                                         <div class="modal-content"> \
  //                                         <div class="modal-header"> \
  //                                         <h4 class="modal-title"><a href="profile.html?username=' + res_json[i].username + '"><img src="assets/img/avatar/avatar-black-sm.jpg" class="profile-pic">' + res_json[i].username + '</a></h4> \
  //                                             <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">close</span></button> \
  //                                         </div> \
  //                                         <div class="modal-body"> \
  //                                             <div class="row"> \
  //                                               <div class="col-lg-7 col-md-6 col-sm-12 col-12 mb-2"><img src="' + res_json[i].pLink + '" class="profile_post_popup_img mx-auto"><br>' + tagsDIV + '</div> \
  //                                               <div class="col-lg-5 col-md-6 col-sm-12 col-12 mb-2"> \
  //                                                 <div class="publisher publisher-multi"> \
  //                                                 <h5>Post a Comment</h5> \
  //                                                 <br> \
  //                                                 <textarea class="publisher-input" rows="1" id="commentInput_' + res_json[i]["_id"] + '"></textarea> \
  //                                                 <div class="publisher-bottom d-flex justify-content-end"> \
  //                                                     <button class="btn btn-gradient-01" id="postComment" onclick="addProfileComment(\'' + String(res_json[i]["_id"]) + '\')">Post Comment</button> \
  //                                                 </div> \
  //                                                 <hr class="bg-secondary mt-4 mb-4"> \
  //                                                 <div id="commentListFor' + res_json[i]["_id"] + '" style="overflow:scroll; height:300px;">\
  //                                               </div> \
  //                                             </div> \
  //                                             </div> \
  //                                         </div> \
  //                                         <div class="modal-footer"> \
  //                                         <span class="post-dets"> \
  //                                         <b><a class="la la-thumbs-o-up post-icon text-success" onClick="Vote(\'' + res_json[i]._id + '\',1)")"></a></b><span class="count" id="upVote' + res_json[i]._id + '"> ' + res_json[i].upvotes + ' </span><span class="vertical-line">&nbsp;</span>\
  //                                         <b><a class="la la-thumbs-o-down post-icon text-danger" onClick="Vote(\'' + res_json[i]._id + '\',0)"></a></b><span class="count" id="downVote' + res_json[i]._id + '">' + res_json[i].downvotes + ' </span><span class="vertical-line">&nbsp;</span>\
  //                                         <b><a class="la la-comment post-icon text-info"></a></b><span class="count" id="commentCount' + res_json[i]["_id"] + '"> ' + (res_json[i].comments).length + ' </span> \
  //                                         </span> \
  //                                         </div> \
  //                                         </div> \
  //                                     </div>';
  //       }
  //     }
  //   }
  // }
  // xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // xhttp.send(JSON.stringify(req));


}

function searchReady() {
  let tags = document.getElementById("SearchBar").value;
  tags = tags.replace(' ', "_");
  let redirectPage = "../../search-results.html?tags=" + tags;
  document.location = redirectPage;
}

function loadSearchComments(template_id) {
  //console.log("load comments");
  var xhttp = new XMLHttpRequest();
  let req = "/api/comments/" + template_id;
  xhttp.open("GET", req);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send();
  xhttp.onload = () => {
    var comments = JSON.parse(xhttp.responseText);

  }
}

function addSearchComment(template_id) {
  let commmentAreaID = 'commentInput_' + template_id;
  let comment = document.getElementById(commmentAreaID).value;
  document.getElementById(commmentAreaID).value = '';
  var xhttp = new XMLHttpRequest();
  let req = "/api/comments";
  xhttp.open("POST", req);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(JSON.stringify({
    "id": template_id,
    "comment": comment,
    "username": localStorage.username
  }));

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 500) {
      console.log("Failed to post");
      alert("Failed to post comment");
    } else if (xhttp.readyState == 4 && xhttp.status == 200) {
      //console.log("Fine");
      loadComments(template_id);
    }
  }
}