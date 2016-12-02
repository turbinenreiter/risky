function getFile() {

    var x = document.getElementById("file-input");
    file = x.files[0];

    var reader = new FileReader();
    reader.onload = function(){
          var content = reader.result;
          genReport(file, content);
        };
    reader.readAsText(file);

}
