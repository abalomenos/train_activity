// To be able to easily modify root directory
var path = "./assets/";

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

$("#addTrain").on("click", function(event) {
    event.preventDefault();
    if ( event.target.validity.valid ) {
        var setTrainName = $("#trainName").val().trim();
        var setTrainDestination = $("#trainDestination").val().trim();
        var setTrainStartTime = $("#trainFirstTime").val().trim();
        var setTrainFrequency = $("#trainFrequency").val().trim();

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
    }

});

database.ref("/Train_Activity/").on("child_added", function(childSnapshot) {
    // $("#trainSchedule > tbody").empty();
    // setInterval(function(){
    var getTrainName = childSnapshot.val().trainName;
    var getTrainDestination = childSnapshot.val().trainDestination;
    var getTrainStartTime = childSnapshot.val().trainStartTime;
    var getTrainFrequency = childSnapshot.val().trainFrequency;
    var getKey = childSnapshot.key;

    
    
    // Time calculattions
    var startTime = moment(getTrainStartTime, "HH:mm");
    // console.log(startTime)
    var minutesFromStartTime = moment().diff(moment(startTime), "minutes");
    // console.log(minutesFromStartTime);
    var minutesPassed = minutesFromStartTime % getTrainFrequency;
    // console.log("CT " + minutesPassed);
    var minutesAway = getTrainFrequency - minutesPassed;
    // console.log(minutesAway);
    var nextTrain = moment().add(minutesAway, "minutes").format("hh:mm A");
    // console.log(nextTrain);

    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").text(getTrainName),
        $("<td>").text(getTrainDestination),
        $("<td>").text(getTrainFrequency),
        $("<td id='nextTrain'>").text(nextTrain),
        $("<td id='minutesAway'>").text(minutesAway),
        $("<td id='admin'>").append($("<img class='removeTrain' src='" + path + "images/checkmark_remove.png' width='20px' height='20px' id = '" + getKey + "'></img>"))
    );

    // Append the new row to the table
    $("#trainSchedule > tbody").append(newRow);
// }, 1000);
    
});


$(document).on("click", ".removeTrain", function() {
    console.log(this.id);
    database.ref("/Train_Activity/").child(this.id).remove();
});

$("#currentTime").text(moment().format("hh:mm A"));
setInterval(function(){
    $("#currentTime").text(moment().format("hh:mm A"));
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
    var email = $("#emailRegister").val().trim();
    var password = $("#passwordRegister").val().trim();
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        console.log(error);
      });
});

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
    if (user) {
        // User is signed in
        var email = user.email;
        var uid = user.uid;            
        database.ref("/").on("value", function(snapshot) {
            var getUID =  snapshot.child("admin/uid").val();
            if (uid == getUID) {
                console.log("Admin logged in");
                $("#addTrains").show();
                $("#admin").show();
                $("td#admin").show();
            } else {
                console.log("Not admin");
                $("#addTrains").hide();
                $("#admin").hide();
                $("td#admin").hide();
            }
        });
        
        $("#userName").text(email);
        $("#loginContainer").hide();
        $("#registerContainer").hide();
        $("#logoutContainer").show();
    } else {
        // User is signed out.
        $("#loginContainer").show();
        $("#registerContainer").show();
        $("#logoutContainer").hide();
        $("#admin").hide();
        $("td#admin").hide();
    }
});








// Login
$(function() {
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    button.mouseup(function(login) {
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
    button.mouseup(function(login) {
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


//     $.validator.addMethod(
//         "regex",
//         function(value, element, regexp) {
//             var re = new RegExp(regexp);
//             return this.optional(element) || re.test(value);
//         },
//         "Please check your input."
// );
// $("#trainFirstTime").rules("add", { regex: "^[a-zA-Z'.\\s]{1,40}$" })

// $.validator.addMethod("regx", function(value, element, regexpr) {          
//     return regexpr.test(value);
// }, "Please enter a valid pasword.");

// $("#addTrainsForm").validate({

//     rules: {
//         trainFirstTime: {
//             required: true ,
//             //change regexp to suit your needs
//             regx: ([01]?[0-9]|2[0-3]):[0-5][0-9]
//             // minlength: 5,
//             // maxlength: 8
//         }
//     }
// });


// function myFunction() {
//     // $('span.error-keyup-4').remove();
//     var inputVal = $("#trainFirstTime").val();
//     console.log(inputVal);
    
//     var characterReg = ([01]?[0-9]|2[0-3]):[0-5][0-9];
//     // if(!characterReg.test(inputVal)) {
//     //     $(this).after('<span class="error error-keyup-4">Format xxx-xxx-xxxx</span>');
//     // }
// }