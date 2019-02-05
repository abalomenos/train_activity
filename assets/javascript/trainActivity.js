// To be able to easily modify root directory
var path = "./assets/";

// scheduleArray used to update Next Arrival and Minutes Away dynamically
var scheduleArray = [];



window.onload = function() {
    $(".adminStartTime").hide();
    $(".adminEdit").hide();
    $(".adminDelete").hide();
    $(".adminSave").hide();
    $("#messageBox").hide();
}

// Initialize Firebase
 var config = {
    apiKey: "AIzaSyAdorwOwzgvLTeAYa7D0MMz6FNs-e8V1Oo",
    authDomain: "trainactivity-4212b.firebaseapp.com",
    databaseURL: "https://trainactivity-4212b.firebaseio.com",
    projectId: "trainactivity-4212b",
    storageBucket: "trainactivity-4212b.appspot.com",
    messagingSenderId: "1000622500813"
    };

firebase.initializeApp(config);

var database = firebase.database();

// Add Train
$("#addTrain").on("click", function(event) {
    event.preventDefault();

    if($("#addTrainsForm").valid()) {
        var setTrainName = $("#trainName").val().trim();
        var setTrainDestination = $("#trainDestination").val().trim();
        var setTrainStartTime = $("#trainFirstTime").val().trim();
        var setTrainFrequency = $("#trainFrequency").val().trim();

        // Confirm Start time is in Time format
        var testTrainStartTime = moment(setTrainStartTime, "HH:mm", true).isValid();

        if ( testTrainStartTime ) {
            database.ref("/Train_Activity/").push({
                trainName: setTrainName,
                trainDestination: setTrainDestination,
                trainStartTime: setTrainStartTime,
                trainFrequency: setTrainFrequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });

            // Clears all of the text-boxes
            $("#trainName").val("");
            $("#trainDestination").val("");
            $("#trainFirstTime").val("");
            $("#trainFrequency").val("");
        } else {
            $("#messageBox").show();
            setTimeout(function(){ 
                $("#messageBox").hide();
            }, 3000);
        }
    }
});

// Time calculattions
function timeCalcualtions(startTime, frequency) {

    var startTime = moment(startTime, "HH:mm");
    var minutesFromStartTime = moment().diff(moment(startTime), "minutes");
    var minutesPassed = minutesFromStartTime % frequency;
    var minutesAway = frequency - minutesPassed;
    var nextTrain = moment().add(minutesAway, "minutes").format("hh:mm A");

    return [nextTrain, minutesAway];
}

database.ref("/Train_Activity/").on("child_added", function(childSnapshot) {

    // setInterval(function(){
    var getTrainName = childSnapshot.val().trainName;
    var getTrainDestination = childSnapshot.val().trainDestination;
    var getTrainStartTime = childSnapshot.val().trainStartTime;
    var getTrainFrequency = childSnapshot.val().trainFrequency;
    var getKey = childSnapshot.key;

    // scheduleArray used to update Next Arrival and Minutes Away dynamically
    scheduleArray.push({getKey, getTrainStartTime, getTrainFrequency});
    console.log(scheduleArray);
    
    var [nextTrain, minutesAway] = timeCalcualtions(getTrainStartTime, getTrainFrequency);
    
    // Create the new row
    var newRow = $("<tr>").append(
        $("<td data-label='TRAIN NAME' id='trainName" + getKey + "'>").text(getTrainName),
        $("<td data-label='DESTINATION' id='trainDestination" + getKey + "'>").text(getTrainDestination),
        $("<td data-label='START TIME' class='adminStartTime' id='trainStartTime" + getKey + "'>").text(getTrainStartTime),
        $("<td data-label='FREQUENCY (MIN)' id='trainFrequency" + getKey + "'>").text(getTrainFrequency),
        $("<td data-label='NEXT ARRIVAL' id='nextTrain" + getKey + "'>").text(nextTrain),
        $("<td data-label='MINUTES AWAY' id='minutesAway" + getKey + "'>").text(minutesAway),
        $("<td data-label='EDIT' class='adminEdit' id='editTD" + getKey + "'>").append($("<img class='editTrain' src='" + path + "images/edit.png' width='30px' height='30px' id='edit" + getKey + "'></img>")),
        $("<td data-label='EDIT' class='adminSave' id='saveTD" + getKey + "'>").append($("<img class='saveTrain' src='" + path + "images/save.png' width='30px' height='30px' id='save" + getKey + "'></img>")),
        $("<td data-label='DELETE' class='adminDelete' id='deleteTD" + getKey + "'>").append($("<img class='removeTrain' src='" + path + "images/checkmark_remove.png' width='30px' height='30px' id='delete" + getKey + "'></img>"))
        
    );
    newRow.attr("id", getKey);

    // Append the new row to the table
    $("#trainSchedule > tbody").append(newRow);

    $(".adminStartTime").hide();
    $(".adminEdit").hide();
    $(".adminDelete").hide();
    $(".adminSave").hide();
    
});

// Delete Train
$(document).on("click", ".removeTrain", function(event) {

    event.preventDefault();

    var currentID = this.id.split("delete")[1];

    database.ref("/Train_Activity/").child(currentID).remove();
    $(this).closest('tr').remove();
});


// Edit Train
$(document).on("click", ".editTrain", function(event) 
{
    event.preventDefault();

    var currentID = this.id.split("edit")[1];
    console.log("First " + currentID);

    $("#editTD" + currentID).hide();
    $("#saveTD" + currentID).show();
    

    $("#trainName" + currentID).attr("contenteditable", "true");
    $("#trainName" + currentID).addClass("editHighlight");
    $("#trainName" + currentID).focus();


    $("#trainDestination" + currentID).attr("contenteditable", "true");
    $("#trainDestination" + currentID).addClass("editHighlight");

    $("#trainStartTime" + currentID).attr("contenteditable", "true");
    $("#trainStartTime" + currentID).addClass("editHighlight");

    $("#trainFrequency" + currentID).attr("contenteditable", "true");
    $("#trainFrequency" + currentID).addClass("editHighlight");

    
    
    
})


// Save Edited Train
$(document).on("click", ".saveTrain", function(event) {
    event.preventDefault();

    var currentID = this.id.split("save")[1];

    var setTrainName = $("#trainName" + currentID).text().trim();
    var setTrainDestination = $("#trainDestination" + currentID).text().trim();
    var setTrainStartTime = $("#trainStartTime" + currentID).text().trim();
    var setTrainFrequency = $("#trainFrequency" + currentID).text().trim();

    // Confirm Start time is in Time format
    var testTrainStartTime = moment(setTrainStartTime, "HH:mm", true).isValid();

    if ( testTrainStartTime ) {

        $("#editTD" + currentID).show();
        $("#saveTD" + currentID).hide();
        

        $("#trainName" + currentID).attr("contenteditable", "false");
        $("#trainName" + currentID).removeClass("editHighlight");


        $("#trainDestination" + currentID).attr("contenteditable", "false");
        $("#trainDestination" + currentID).removeClass("editHighlight");

        $("#trainStartTime" + currentID).attr("contenteditable", "false");
        $("#trainStartTime" + currentID).removeClass("editHighlight");

        $("#trainFrequency" + currentID).attr("contenteditable", "false");
        $("#trainFrequency" + currentID).removeClass("editHighlight");

        var [nextTrain, minutesAway] = timeCalcualtions(setTrainStartTime, setTrainFrequency);

        $("#nextTrain" + currentID).text(nextTrain);
        $("#minutesAway" + currentID).text(minutesAway);

        for (var i=0; i<scheduleArray.length; i++) {
            if (scheduleArray[i]["getKey"] == currentID) {
                arrayID = i;
            }
        }
        scheduleArray[arrayID]["getTrainFrequency"] = setTrainFrequency;
        scheduleArray[arrayID]["getTrainStartTime"] = setTrainStartTime;

        console.log("Array: "+ arrayID);

        database.ref("/Train_Activity/" + currentID).set({
            trainName: setTrainName,
            trainDestination: setTrainDestination,
            trainStartTime: setTrainStartTime,
            trainFrequency: setTrainFrequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    } else {
        $("#messageBox").show();
        setTimeout(function(){ 
            $("#messageBox").hide();
        }, 3000);
    }
})



// Update Time, Next Arrival and Minutes Away
$("#currentTime").text(moment().format("hh:mm A"));
setInterval(function(){

    $("#currentTime").text(moment().format("hh:mm A"));

    for (var i=0; i<scheduleArray.length; i++){
        var currentID = scheduleArray[i].getKey;
        var currentTrainStartTime = scheduleArray[i].getTrainStartTime;
        var currentTrainFrequency = scheduleArray[i].getTrainFrequency;

        var [nextTrain, minutesAway] = timeCalcualtions(currentTrainStartTime, currentTrainFrequency);
        
        $("#nextTrain" + currentID).text(nextTrain);
        $("#minutesAway" + currentID).text(minutesAway);
    }

}, 60000);




// Login
$("#login").on("click", function(event) {
    event.preventDefault();
    var email = $("#email").val().trim();
    var password = $("#password").val().trim();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        console.log(error);
    });
});

// Register
$("#register").on("click", function(event) {
    event.preventDefault();
    if($("#registerForm").valid()) {
        var email = $("#emailRegister").val().trim();
        var password = $("#passwordRegister").val().trim();
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            console.log(error);
        });
    }
});

$("#registerForm").validate({
    rules: {
        emailRegister: {
            required: true,
            email: true
        },
        passwordRegister: { 
            required: true,
            minlength: 6,
            maxlength: 10,
        }, 
        cfmPasswordRegister: {
            required: true,
            equalTo: "#passwordRegister",
            minlength: 6,
            maxlength: 10
        }
    },
    messages:{
        emailRegister: {
            required: "Your email is required!"
        },
        passwordRegister: { 
            required: "A password is required!"
        },
        cfmPasswordRegister: {
            required: "Please confirm your password!"
        }
    }
    
});


$("#addTrainsForm").validate({
    rules: {
        trainName: {
            required: true
        },
        trainDestination: {
            required: true
        },
        trainFirstTime: {
            required: true
        },
        trainFrequency: {
            required: true,
            number: true
        }
    },
    messages:{
        trainName: {
            required: "Train name is required!"
        },
        trainDestination: {
            required: "Train destination is required!"
        },
        trainFirstTime: {
            required: "Time is required!"
        },
        trainFrequency: {
            required: "Frequency is required!",
            number: "Needs to be a number!"
        }
    }
})


// Logout
$("#logoutButton").on("click", function(event) {
    firebase.auth().signOut().then(function() {
        $("#addTrains").hide();
    }).catch(function(error) {
        console.log(error);
    });
}); 


// Get current User
firebase.auth().onAuthStateChanged(function(user) {
    
    // User is signed in
    if (user) {
        var email = user.email;
        var uid = user.uid;            
        

        $("#userName").text(email);
        
        $("#userName").show();        
        $("#logoutContainer").show();
        
        $("#loginContainer").hide();
        $("#registerContainer").hide();

        // Check if User is Admin
        database.ref("/").on("value", function(snapshot) {
            var getUID =  snapshot.child("admin/uid").val();
            
            // Admin logged in
            if (uid == getUID) {
                
                $("#addTrains").show();
                $(".adminStartTime").show();
                $(".adminEdit").show();
                $(".adminDelete").show();

                $("#noAdmin").hide();
                
            } else { // User is not Admin
                
                $("#noAdmin").show();

                $("#addTrains").hide();
                $(".adminStartTime").hide();
                $(".adminEdit").hide();
                $(".adminDelete").hide();
            }
        });        
    } else { // User is signed out.

        $("#noAdmin").show();
        $("#loginContainer").show();
        $("#registerContainer").show();
        
        $("#userName").hide();
        $("#logoutContainer").hide();
        $(".adminStartTime").hide();
        $(".adminEdit").hide();
        $(".adminDelete").hide();
    }
});



// Login
$(function() {
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    button.mouseup(function() {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() { 
        return false;
    });
    $(this).mouseup(function(login) {
        if(!($(login.target).parent('#loginButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});
    

// Register
$(function() {
    var button = $('#registerButton');
    var box = $('#registerBox');
    var form = $('#registerForm');
    button.removeAttr('href');
    button.mouseup(function() {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() { 
        return false;
    });
    $(this).mouseup(function(login) {
        if(!($(login.target).parent('#registerButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});

