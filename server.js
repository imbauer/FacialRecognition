//Importing relevant libraries (npm)
var express = require('express');
var bodyParser = require('body-parser'); //The bodyParser() module is used for parsing the request body, so you can read post data
var fileUpload = require('express-fileupload');
var fs = require('fs');
var path = require('path');
var server = express();
var najax = require('najax');

server.get("/", function (req, res) {
    res.sendFile(__dirname + "/client.html");
})

// Endpoint Test
server.get("/test", function (req, res) {
    console.log("it worked");
    res.send("test");
})

//Sends input URL to the command prompt
server.use(bodyParser());

//First Callback level
server.get('/getRaceData', function (req, res) {
    console.log(req.query.image); //Logs the image url that is to be dealt with
    console.log(req.query);
    var obj = {
        image: req.query.image
    }
    console.log(obj)
    console.log("/////////////////////////////////////")

    //Use of KAIROS API to send image inforamtion to 

    //API ID and Key for usage of API
    var headers = {
        //"app_id": "27de2072",
        //"app_key": "160b0ac70dfd81d946905c82e0c03309"
        "app_id": req.query.app_id,
        "app_key": req.query.key
    };

    var url = "http://api.kairos.com/detect";

    // make request 
    var options = {
        headers: headers,
        type: "POST",
        data: JSON.stringify(obj),
        dataType: "text"
    };

    //Second Callback Level
    najax(url, options, function (response) { //Gets the object info in a single variable 'response'
        //Third Callback level
        formatKairosData(response, function (kairosObject) { //Formats Kairos Data to return the race that is most observable in the facial complexion of the image
            res.send(kairosObject);
        });
    });
});

//Read output.JSON file and display contents on console
function formatKairosData(kairosResponse, callback) {
    //Splitting JSON file containing human analytics by \"
    console.log(JSON.parse(kairosResponse).images[0].faces)
    console.log("/////////////////////////////////////")

    var face = JSON.parse(kairosResponse).images[0].faces[0];

    //Defining arrays to store race and correlation value
    var raceData = {
        asian: face.attributes.asian,
        white: face.attributes.white,
        hispanic: face.attributes.hispanic,
        black: face.attributes.black,
        other: face.attributes.other
    }

    var requiredData = {
        race: null,
        max: 0
    };

    for (var race in raceData) {
        if (requiredData.max < raceData[race]) {
            requiredData.race = race;
            requiredData.max = raceData[race];
        }
    }

    console.log(requiredData);
    console.log("/////////////////////////////////////")
    callback(requiredData);
}



//Create Server
server.listen(3000, function () {
    console.log("Uploaded server listening on port 3000");
})
