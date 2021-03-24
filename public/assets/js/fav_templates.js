function displayTemplates(username) {
  localStorage.fave = 1;
  let xhttp = customHttp("GET", "/api/templates/" + localStorage.fave, () => {
    let res_json = JSON.parse(xhttp.responseText);
    if (res_json.length < 12) {
      document.getElementById("more").innerHTML = "";
    }
    localStorage.temp = parseInt(localStorage.fave) + 1;
    let main = document.getElementById("templateList");
    for (var count in res_json) {
      let div = document.createElement('div');
      div.setAttribute("class", "col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-1 container-fav");

      let figure = document.createElement('figure');
      figure.setAttribute("class", "d-flex discovery-img-box");

      let innerDIV = document.createElement('div');
      innerDIV.setAttribute("class", "discover_img my-auto mx-auto");

      let a1 = document.createElement("a");
      let onclickID = 'onSelect("' + res_json[count].tLink + '","' + res_json[count]._id + '");';
      a1.setAttribute("onclick", onclickID);
      a1.setAttribute("href", "javascript:void(0);");

      let image = document.createElement("img");
      image.setAttribute("src", res_json[count].tLink);
      image.setAttribute("class", "templateChooserThumbnail");
      a1.appendChild(image);

      let a2 = document.createElement("a");
      a2.setAttribute("role", "button");
      a2.setAttribute("href", "javascript:void(0);");
      a2.setAttribute("class", "favTemplate");

      let span = document.createElement("span");
      let toggle = 'toggleFav("' + res_json[count]._id + '","' + count + '");';

      console.log(res_json[count]);
      if (res_json[count].fave == true) {
        span.setAttribute("class", "ion-star bottom-right-fav is-fav");
        span.setAttribute("onclick", toggle);
        span.setAttribute("id", "star_" + count);
      } else {
        span.setAttribute("class", "ion-star bottom-right-fav");
        span.setAttribute("onclick", toggle);
        span.setAttribute("id", "star_" + count);
      }
      a2.appendChild(span);
      innerDIV.appendChild(a1);
      innerDIV.appendChild(a2);

      figure.appendChild(innerDIV);
      div.appendChild(figure);
      main.appendChild(div);

    }
  });
  xhttp.send();
}

function onSelect(link, id) {
  localStorage.ImgLink = link;
  localStorage._id = id;
  window.location = "/editor.html";
}

function more() {
  let xhttp = customHttp("GET", "/api/templates/" + localStorage.fave, () => {
    let res_json = JSON.parse(xhttp.responseText);
    if (res_json.length < 12) {
      document.getElementById("more").innerHTML = "";
    }
    localStorage.temp = parseInt(localStorage.fave) + 1;
    let main = document.getElementById("templateList");
    for (var count in res_json) {
      let div = document.createElement('div');
      div.setAttribute("class", "col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-1 container-fav");

      let figure = document.createElement('figure');
      figure.setAttribute("class", "d-flex discovery-img-box");

      let innerDIV = document.createElement('div');
      innerDIV.setAttribute("class", "discover_img my-auto mx-auto");

      let a1 = document.createElement("a");
      let onclickID = 'onSelect("' + res_json[count].tLink + '","' + res_json[count]._id + '");';
      a1.setAttribute("onclick", onclickID);
      a1.setAttribute("href", "javascript:void(0);");

      let image = document.createElement("img");
      image.setAttribute("src", res_json[count].tLink);
      image.setAttribute("class", "templateChooserThumbnail");
      a1.appendChild(image);

      let a2 = document.createElement("a");
      a2.setAttribute("role", "button");
      a2.setAttribute("href", "javascript:void(0);");
      a2.setAttribute("class", "favTemplate");

      let span = document.createElement("span");
      let toggle = 'toggleFav("' + res_json[count]._id + '","' + (parseInt(localStorage.temp) - 1) * 12 + count + '");';
      if (res_json[count].fave) {
        span.setAttribute("class", "ion-star bottom-right-fav is-fav");
        span.setAttribute("onclick", toggle);
        span.setAttribute("id", "star_" + (parseInt(localStorage.temp) - 1) * 12 + count);
      } else {
        span.setAttribute("class", "ion-star bottom-right-fav");
        span.setAttribute("onclick", toggle);
        span.setAttribute("id", "star_" + (parseInt(localStorage.temp) - 1) * 12 + count);
      }
      a2.appendChild(span);
      innerDIV.appendChild(a1);
      innerDIV.appendChild(a2);

      figure.appendChild(innerDIV);
      div.appendChild(figure);
      main.appendChild(div);
    }
  });
  xhttp.send();
}


function toggleFav(_id, count) {
  var body = {
    username: localStorage.username,
    fav_templates: _id
  };

  let xhttp;
  let req = "/api/fav";
  if (document.getElementById('star_' + count).className == "ion-star bottom-right-fav is-fav") {
    xhttp = customHttp("DELETE", req, () => {
      if (xhttp.status != 200) {
        alert("something went wrong, try again later");
        return;
      }
      document.getElementById('star_' + count).className = "ion-star bottom-right-fav";
    });
  } else {
    xhttp = customHttp("POST", req, () => {
      if (xhttp.status != 200) {
        alert("something went wrong, try again later");
        return;
      }
      document.getElementById('star_' + count).className = "ion-star bottom-right-fav is-fav";
    });
  }
  xhttp.send(JSON.stringify(body));
}