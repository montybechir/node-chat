// Make connection

//this socket is for the front end
var socket = io.connect('http://localhost:3000');   //we have access to this on the front end

//Query the DOM

var message = document.getElementById('message');
var handle = document.getElementById('handle');
var button = document.getElementById('send');
var output = document.getElementById('output');
var allOtherUsers = document.getElementById('allOtherUsers');
var username = document.getElementById('username');
//emit events
//username.innerHTML = socket.nickName;



button.addEventListener('click', function(){
   // this emits a message down the web socket to the server
    //console.log('i have been clicked');

    // first figure out if the input is a normal message or if it is
    // a command to change the color or nickname of a user
    let msg = message.value;
    msg = msg.toLowerCase();
    //console.log("msg: "+msg + " " + msg.length);
    //let n;
    if ( (msg.startsWith('/nick ')) === true ){
        //console.log("change nickname");
        socket.emit('changeNickName', {msg:msg})
    }
    else if((msg.startsWith('/nickcolor ')) === true && msg.length === 17){
        //console.log("change nickname color");
        socket.emit('changeNickColor', {message:msg});
    }
    else{
        //console.log("just a regular message");
        socket.emit('msg', {
            message: message.value
        })
    }

});

socket.addEventListener('disconnect', function(){
   //console.log('This person disconnected:' );
});
//listen for events from our server
// if we receive a message from the server then fire the function which passes in some data
socket.on('msg', function(data){
    //console.log("\n nickcolor:"+data.nickcolor);
    var dateObject = new Date(data.timePosted);
    output.innerHTML +=  '<p style="display:inline;"><strong>' + dateObject.getHours() + ':' +
        + dateObject.getMinutes() + " " + "<p style='display:inline;color:#" + data.nickcolor + ";'>" +
        data.nickName + "</p>" + ':</strong>' + boldOrNot(data.nickName, data.message) + '</p>'
    //console.log('yo',new Date(data.timePosted).getHours());
    //console.log('value returned by boldOrNot' + boldOrNot(data.nickName, data.message));
    output.scrollTop = output.scrollHeight;
});

function boldOrNot(nickname, message){
    //console.log("in function boldOrNot");
    let indexOfUserName = document.cookie.split(/[ =]/).indexOf('nickname');
    //console.log("document.cookie" + document.cookie.split(/[ =]/));
    //console.log("indexOfUserName" + indexOfUserName);
    //console.log("username" + document.cookie.split(/[ =]/)[indexOfUserName+1]);
    if (nickname === document.cookie.split(/[ =]/)[indexOfUserName+1]) {
        //console.log('This message was sent by this socket');
        return '<strong>' + message + '</strong>';
    }
    else{
        return message;
    }
}

socket.on('loadExistingMessages', function(messages){
    console.log("loadExistingMessages called");
    //console.log(messages.messages);
    //console.log("messages.length" + messages.messages.length);
    //console.log("messages[0]" + messages.messages[0]);
    //console.log("messages[0].timePosted"+ messages.messages[0].timePosted);
    for(i = 0; i < messages.messages.length; i++){
        console.log("\n"+  messages.messages[i].timePosted + "\t" + messages.messages[i].nickName + ":" + messages.messages[i].message);
        let dateObject = new Date(messages.messages[i].timePosted);
        console.log("dateObject:"+dateObject);
        //console.log("dateObject.getMinutes()"+dateObject.getMinutes());
        //formatMinutes(dateObject.getMinutes());
        console.log("with Slice" + (('0' + dateObject.getMinutes()).slice(-2)));
        output.innerHTML +=  '<p style="display:inline;"><strong>' + dateObject.getHours() + ':' +
            + formatMinutes(dateObject.getMinutes()) + ' '  + "<p style='display:inline;color:#" + messages.messages[i].nickcolor + ";'>" +
            messages.messages[i].nickName + "</p>" +':</strong>' + boldOrNot(messages.messages[i].nickName, messages.messages[i].message)+ '</p>'
    }
    output.scrollTop = output.scrollHeight;
});
function formatMinutes(minutes){
    console.log("in formatMinutes \n"+ minutes);
    if(minutes < 10){
        let val = "0" + minutes + "";
        console.log("singledigit, number to return:" + '0' + val);
        return "0" + val +"";
    }
    else{
        console.log("double digit, return same number passed in:" + minutes);
        return minutes;
    }
}
//when the server notifies us that a user has disconnected, we upload the following users
socket.on('updateUsers', function(newListOfUsers){
    allOtherUsers.innerHTML = '';
    for(i =0; i < newListOfUsers.users.length; i++){
        allOtherUsers.innerHTML += '<p>' + newListOfUsers.users[i] + '<p>';
    }
    //allOtherUsers.innerHTML = '<p>' + newListOfUsers.users + '</p>';
});

// if we receive a message from the server telling us to update username
// then do the following
socket.on('updateUserName', function(user){
    // save this user's name in cookie
    document.cookie = "nickname=" + user.newUser;
   username.innerHTML = 'You are: ' + user.newUser;
   //console.log('updateusername'+ user.newUser);
});

socket.on('changeColor', function(data){
    // get the color that they wished to change this to
    //console.log("in the client let's change the font color");
});
