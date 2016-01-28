
// List cameras and microphones.
$(function(){
    var deviceString = "";
    navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
    
    devices.forEach(function(device){
        deviceString+=device.kind;
        console.log(device);
    });
    
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
$.ajax({
        url: "https://testground-kino6052.c9users.io/",
        method: "POST",
        data: {'device-string': deviceString, 'screen-area': screen.width * screen.height },
        success: function(response){
         console.log(response);
         document.getElementById("list").innerHTML = "Your Browser's Id is: " + response.id;
        }
    });
});
