
app.directive("ngFileSelect",function(){
  return {
    link: function($scope,el){
      el.bind("change", function(e){
        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      })
    }
  }
})

app.controller("UploadController", function($scope, fileReader) {
  $scope.getFile = function () {
     $scope.progress = 0;
     fileReader.readAsDataUrl($scope.file, $scope)
                   .then(function(result) {
                       $scope.imageSrc = result;
                       $scope.user = localStorage.username;

                   });
  };

  $scope.$on("fileProgress", function(e, progress) {
     $scope.progress = progress.loaded / progress.total;
  });
  $scope.push = function push(imageSrc, desc, tags, user) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //console.log(xhttp.responseText);
        localStorage.ImgLink = xhttp.responseText;
        window.location="/editor.html";
        //alert("Uploaded successfully! Link is: " + xhttp.responseText);
      }
      if(this.readyState == 4 && this.status == 500) {
        alert("Image failed to upload :(");
      }
    };
    localStorage.image=imageSrc;
    xhttp.open("POST", "/api/uploadToImgur");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({file: imageSrc, username: user.toString(), tDesc: desc, tTags: tags, database: "template"}));

  }
});
