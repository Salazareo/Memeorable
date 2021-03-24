var GlobalImg = new Image();

function redirect() {
  window.location = "/choosetemplate.html";
}

function renew() {
  window.location = "/editor.html";
}
var test = $(".myDIV.container").get(0);
var width = test.offsetWidth; // dom width
var height = test.offsetHeight;
var canvas = $("#myCanvas").get(0);
// to canvas
var opts = {
  allowTaint: false,
  tainttest: false,
  useCORS: true,
  logging: false, // no need
  width: 700, //dom width
};
$('#toCanvas').click(function (e) {
  html2canvas(test, opts).then(function (canvas) {
    // canvas width
    var canvasWidth = canvas.width;
    // canvas height
    var canvasHeight = canvas.height;
    canvas.setAttribute("class", "editCanvas");
    var div = $("#ParentOfDrags").get(0);
    div.appendChild(canvas);
    // render canvas
    // convert canvas to image
    GlobalImg = Canvas2Image.convertToImage(canvas, canvasWidth, canvasHeight);
    $("#myCanvas").hide();
    $("#share").prop('disabled', false);
    $("#save2Local").prop('disabled', false);
    $("#toHTML").prop('disabled', false);
    $("#addText").prop('disabled', true);
    $("#rmText").prop('disabled', true);
    $("#toCanvas").prop('disabled', true);
    // hide the editable HTML, show the canvas with edited image
    // the canvas shows automatically
    $("#MemeImage").hide();
    $("#PreviewModeTitle").show();
    $("#EditModeTitle").hide();
    $("#editorControl").hide();
    $("#publishWarning").hide();
    $("#addText").hide();
    $("#rmText").hide();
    $(".speTextbox").each(function () {
      $(this).hide();
    });
    // save
    $('#save2Local').click(function (e) {
      let type = $('#sel').val(); // image type
      let w = $('#imgW').val(); // image width
      let h = $('#imgH').val(); // image height
      let f = $('#imgFileName').val(); // file name
      w = (w === '') ? canvasWidth : w;
      h = (h === '') ? canvasHeight : h;
      // save as image
      var strData = Canvas2Image.saveAsImage(canvas, w, h, type, f);
    });
  });
});
$("#toHTML").click(function (e) {
  // delete editCanvas (will create again once click "finish" again)
  var editCan = $(".editCanvas").get(0);
  console.log("edican :" + editCan);
  $(".editCanvas").remove();
  // disable these buttons, show the image to edit
  $("#MemeImage").show();
  $("#PreviewModeTitle").hide();
  $("#EditModeTitle").show();
  $("#editorControl").show();
  $("#publishWarning").show();
  $("#addText").show();
  $("#rmText").show();
  $(".speTextbox").each(function () {
    $(this).show();
  });
  $("#share").prop('disabled', true);
  $("#save2Local").prop('disabled', true);
  $("#toHTML").prop('disabled', true);
  $("#addText").prop('disabled', false);
  $("#rmText").prop('disabled', false);
  $("#toCanvas").prop('disabled', false);
});

function public() {
  document.getElementById("publishing-modal").setAttribute('style', 'display: block;');
  document.getElementById("publishing-modal").setAttribute('aria-hidden', 'false');
  document.getElementById("publishing-modal").classList.add('fade');
  document.getElementById("publishing-modal").classList.add('show');
  document.getElementById("publishing-modal").classList.add('fadeIn');
  let RawTags = document.getElementById("tags").value;
  RawTags = RawTags.toLowerCase();
  let splitTags = RawTags.split(',');
  let Tags = '';
  for (let i = 0; i < splitTags.length; i++) {
    splitTags[i] = splitTags[i].trim();
    Tags += splitTags[i] + ",";
  }
  let FinalTag;
  if (Tags.length > 0) {
    FinalTag = Tags.substring(0, Tags.length - 1);
  } else {
    FinalTag = Tags;
  }
  let xhttp = customHttp("POST", "/api/uploadToImgur", () => {
    if (xhttp.status == 200) {
      localStorage.ImgLink = xhttp.responseText;
      window.location = "/index.html";
    }
    if (xhttp.status == 500) {
      alert("Image failed to upload :(");
    }
    if (xhttp.status == 413) {
      alert("The image size is too big for some reason (probably our fault)");
    }
  })
  localStorage.image = GlobalImg;
  xhttp.send(JSON.stringify({
    "file": GlobalImg.src,
    "username": localStorage.username,
    "database": "posts",
    pTags: FinalTag,
    tID: localStorage._id
  }));
}

/**
 *  onload function for editor.html
 */
function createImage() {
  if (localStorage.ImgLink == null) {
    localStorage.ImgLink = "assets/img/SurprisedPikachu.png";
  }
  document.getElementById('MemeImage').src = localStorage.ImgLink;
  // listener for window size on change
  $(window).resize(function () {
    setBorder($(window).width());
  });

  // use jQuery to set attributes
  $('#changeColor').change(function () {
    // if last textbox has been deleted, just set global val
    setGlobalColor($(this).val());
    let selected = selectedTextBox();
    if (selected == -1) {
      return;
    }
    $('#' + selected).css('color', $(this).val());
  });

  $('#changeSize').change(function () {
    setGlobalSize($(this).val());
    let selected = selectedTextBox();
    if (selected == -1) {
      return;
    }
    // set bottom border constraint while changing the size
    setBorderBt($(this).val());
    $('#' + selected).css('fontSize', $(this).val());
  });
  $('#changeWt').change(function () {
    setGlobalWeight($(this).val());
    let selected = selectedTextBox();
    if (selected == -1) {
      return;
    }
    $('#' + selected).css('fontWeight', $(this).val());
  });
  $('#changeStroke').change(function () {
    setGlobalStroke($(this).val());
    let selected = selectedTextBox();
    if (selected == -1) {
      return;
    }
    //$('#'+selected).css('fontWeight',$(this).val());
  });
}