var selected;
//default value as window size 1680
var imageBorderLeft = 255;
// right size is decided by textbox size
var imageBorderRight;
var imageBorderBottom = 98;
var win_width = $(window).width();

function setBorderBt(x){
  var s = parseInt(x, 10);
    imageBorderBottom = 128 - s;
}
// set the global border constraints while the window is resizing
function setBorder(size){
  if(size >= 1200){
    imageBorderLeft =  (size - 1170)/2;
  }else if (size < 1200 && size >= 992){
      imageBorderLeft =  (size - 990)/2;
  }else if(size <992 && size >= 768){
      imageBorderLeft =  (size - 750)/2;
  }else if(size < 768 && size >= 577){
      imageBorderLeft =  (size - 576)/2;
  }else{ //size < 577
      imageBorderLeft = 0;
  }
  imageBorderRight = imageBorderLeft + 700;
}
// init the border cons
setBorder(win_width);
// settings & listener for textbox
var Draggable = function (id,parentId, MemeImage) {
  var parent = document.getElementById(parentId);
  win_width = $(window).width();
  // when created a new textbox, means this textbox is being selected
  selected = id;
  var el = document.getElementById(id),
    isDragReady = false,
    isSelected = false,
    wasDragged = false,
    dragoffset = {
      x: 0,
      y: 0
    };
  this.init = function () {
    this.initPosition();
    this.events();
  };
  //only for this demo
  this.initPosition = function () {
    el.style.position = "absolute";
    el.style.top = "20%";
    el.style.left = "25%";
  };
  //events for the element
  this.events = function () {
    var self = this;
    _on(el, 'mousedown', function (e) {
      isDragReady = true;
      // clientX/Y is what our mouth is at
      // pageX: relative to the left edge of the entire document.
      // This includes any portion of the document not currently visible.
      e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
      // these 2 values are the position of textbox no matter which part of the textbox you click on the values are the same
      dragoffset.x = e.pageX - el.offsetLeft;
      dragoffset.y = e.pageY - el.offsetTop;
      // set id here to notify which textbox is being selected
      selected = id;
    });
    _on(el, 'touchstart', function (e) {
      if(isSelected){
        e.preventDefault();
      }
      else{
        isSelected = 1;
      }
      e = e.changedTouches[0];
      isDragReady = true;
      // clientX/Y is what our mouth is at
      // pageX: relative to the left edge of the entire document.
      // This includes any portion of the document not currently visible.
      e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
      // these 2 values are the position of textbox no matter which part of the textbox you click on the values are the same
      dragoffset.x = e.pageX - el.offsetLeft;
      dragoffset.y = e.pageY - el.offsetTop;
      // set id here to notify which textbox is being selected
      selected = id;
    });
    _on(document, 'touchend', function () {
      isDragReady = false;
      if(wasDragged){
        isSelected = false;
      }
    });
    _on(document, 'mouseup', function () {
      isDragReady = false;
      isSelected = false;
    });
    _on(document, 'touchcancel', (e)=>{
      isDragReady = false;
    });
    _on(document, 'mousemove', function (e) {
      if (isDragReady) {
        wasDragged = 1;
        //isSelected = 1;
        e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        // left/right constraint
        if (e.pageX - dragoffset.x < imageBorderLeft) {//left
          offsetX = imageBorderLeft;
        } else if (e.pageX - dragoffset.x  > imageBorderRight){ //right constraint
          offsetX = imageBorderRight;
        } else {
          offsetX = e.pageX - dragoffset.x;
        }

        // top/bottom constraint
        if (e.pageY - dragoffset.y < 125) { // top constraint
          offsetY = 125;
        } else if (e.pageY - dragoffset.y > parent.clientHeight +imageBorderBottom) { //bottom
          offsetY = parent.clientHeight +imageBorderBottom;
        } else {
          offsetY = e.pageY - dragoffset.y;
        }
        el.style.top = offsetY + "px";
        el.style.left = offsetX + "px";
      }
    });
    _on(document, 'touchmove', function (e) {
      //e.preventDefault();
      if (isDragReady) {
        //isSelected = true;
        
        //console.log(e.changedTouches);
        e = e.changedTouches[0];
        //console.log(e.pageX);
        e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        // left/right constraint
        if (e.pageX - dragoffset.x < imageBorderLeft) {//left
          offsetX = imageBorderLeft;
        } else if (e.pageX - dragoffset.x  > imageBorderRight){ //right constraint
          offsetX = imageBorderRight;
        } else {
          offsetX = e.pageX - dragoffset.x;
        }

        // top/bottom constraint
        if (e.pageY - dragoffset.y < 125) { // top constraint
          offsetY = 125;
        } else if (e.pageY - dragoffset.y > parent.clientHeight +imageBorderBottom) { //bottom
          offsetY = parent.clientHeight +imageBorderBottom;
        } else {
          offsetY = e.pageY - dragoffset.y;
        }
        el.style.top = offsetY + "px";
        el.style.left = offsetX + "px";
      }
    });
  };
  //cross browser event Helper function
  var _on = function (el, event, fn) {
    document.attachEvent ? el.attachEvent('on' + event, fn) : el.addEventListener(event, fn, !0);
  };
  this.init();
}
function selectedTextBox(){
  if(selected != -1){
    return selected;
  }else{
    return -1;
  }
}
function setSelected(){
  selected = -1;
}
