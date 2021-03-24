let count = 0;
let GlobalSize = 30;
let GlobalColor = "white";
let GlobalWeight = "900";
let GlobalStroke = "off";
function addText() {
    //Create an input type dynamically.
    div_name = 'drag' + count;
    let div = document.createElement('div');
    div.setAttribute("id",div_name);
    
    let element = document.createElement("input");
    let textbox_name = 'textbox' + count;
    //Assign different attributes to the element.
    element.setAttribute("type", "text");
    element.setAttribute("id", textbox_name);
    element.setAttribute("class", "speTextbox");
    element.setAttribute("placeholder", "Input Text");
    element.setAttribute("overflow", "auto");
    element.setAttribute("resize", "both");
    element.style.fontSize = GlobalSize;
    element.style.color = GlobalColor;
    element.style.textAlign = "left";
    element.style.fontWeight=GlobalWeight;
    if(GlobalStroke == "on" && GlobalColor == 'black'){
        element.style.textShadow="2px 2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff, -2px -2px 0px #fff";
    }else if(GlobalStroke == "on"){
        element.style.textShadow="2px 2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, -2px -2px 0px #000";
    }
    element.addEventListener("keydown", function() {
        element.size = ((element).value.length + 1)*1.3;
    });
    count++;
    // 'foobar' is the div id, where new fields are to be added
    let main = document.getElementById("ParentOfDrags");
    div.appendChild(element);
    main.appendChild(div);
    new Draggable(div_name,'ParentOfDrags', 'MemeImage');
}
// remove the selected textbox
function removeText(){
    let selected = selectedTextBox();
    if(selected == -1){
        return;
    }
    var element = document.getElementById(selected);
    element.parentNode.removeChild(element);
    setSelected();
}
//set global attributes for the next textbox
function setGlobalColor(color){
    GlobalColor = color;
}
function setGlobalWeight(weight){
    GlobalWeight = weight;
}
function setGlobalSize(size){
    GlobalSize = size;
}
function setGlobalStroke(stroke){
    GlobalStroke = stroke;
}