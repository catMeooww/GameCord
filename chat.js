var user = localStorage.getItem("Gamecord");
var userPass = localStorage.getItem("GamePassword");
var userClass = "";
var selectedChat = "";
var chatQuantity = 0;
var isConfigPage = false;

const firebaseConfig = {
  apiKey: "AIzaSyB4aKcBiy9PfDS42V_7CN60w3s7Lq5A8TY",
  authDomain: "text-talking.firebaseapp.com",
  databaseURL: "https://text-talking-default-rtdb.firebaseio.com",
  projectId: "text-talking",
  storageBucket: "text-talking.appspot.com",
  messagingSenderId: "488401112127",
  appId: "1:488401112127:web:0d1b551c0217b7dc963c8a"
};

firebase.initializeApp(firebaseConfig);

function loged() {
  user = document.getElementById("guri").value;
  password = document.getElementById("not_a_secret").value;
  if (user != "" && password != "") {
    var userref = firebase.database().ref("/users/" + user + "/status");
    var passref = firebase.database().ref("/users/" + user + "/password");
    var isUserCreated;
    var isJoining = false;
    userref.on("value", data => {
      isUserCreated = data.val();
      if (!isJoining) {
        isJoining = true;
        if (isUserCreated == "online" ) {
          passref.on("value", data => {
            canPass = data.val();
            if(canPass == password){
              localStorage.setItem("Gamecord", user);
              localStorage.setItem("GamePassword", password);
              document.getElementById("error").innerHTML = "Welcome to the Mato";
              redirect();
            }else{
              document.getElementById("error").innerHTML = "Incorrect Password";
            }
          })
        } else {
          document.getElementById("error").innerHTML = "Incorrect Username";
        }
      }
    });
  } else {
    document.getElementById("error").innerHTML = "All the inputs need a value";
  }
}

function create() {
  user = document.getElementById("guri").value;
  password = document.getElementById("not_a_secret").value;
  if (user != "" && password != "") {
    var userref = firebase.database().ref("/users/" + user + "/status");
    var isUserCreated;
    var isJoining = false;
    userref.on("value", data => {
      isUserCreated = data.val();
      if (!isJoining) {
        isJoining = true;
        if (isUserCreated == null) {
          firebase.database().ref("/users/").child(user).update({
            password: password,
            status: "online",
            class: "user",
            chats: ["Gamecord Chat"]
          });
          document.getElementById("error").innerHTML = "Account Sucessfuly Created";
        } else {
          document.getElementById("error").innerHTML = "This username already exists";
        }
      }
    });
  } else {
    document.getElementById("error").innerHTML = "All the inputs need a value";
  }
}

function redirect() {
  document.getElementById("log").style.borderTopColor = "greenyellow";
  setTimeout(()=>{
    window.location = "gamecord.html";
  },300)
}

function getUserData() {
  if (user == undefined || userPass == undefined) {
    window.location = "index.html";
  }
  firebase.database().ref("/users/" + user + "/class").on("value", data => {
    userClass = data.val();
    document.getElementById("user-handler").className = "msg-" + userClass;
    document.getElementById("user-handler").innerHTML = user;
    document.getElementById("class-handler").className = "msg-" + userClass;
    document.getElementById("class-handler").innerHTML = user + " | " + userClass;

    if(isConfigPage){
      configSpecial();
    }
  })
}

function getChats() {
  getUserData();
  firebase.database().ref("/users/" + user + "/chats").on('value', function (snapshot) {
    document.getElementById("allchatsoutput").innerHTML = "";
    chatQuantity = 0;
    snapshot.forEach(function (childSnapshot) {
      childKey = childSnapshot.key; childData = childSnapshot.val();

      firebaseMessageId = childKey;

      div = "<button id='"+firebaseMessageId+"' class='chatbutton' onclick='setChat(this.innerHTML,this.id)'>" + childData + "</button>"

      document.getElementById("allchatsoutput").innerHTML += div;
      chatQuantity += 1;
    });
  });
}

function setChat(chat,buttonid) {
  selectedChat = chat;
  console.log(selectedChat);
  document.getElementById("chat-sender").style.visibility = "visible";
  getData();
  for(var i = 0;i < document.getElementsByClassName("chatbutton").length;i++){
    document.getElementsByClassName("chatbutton").item(i).style.borderColor =" rgba(0, 0, 0, 0.350)";
  }
  document.getElementById(buttonid).style.borderColor = "green";
}

function getData() {
  if (!selectedChat == "") {
    firebase.database().ref("/chats/" + selectedChat).on('value', function (snapshot) {
      document.getElementById("the_chat").innerHTML = "";
      snapshot.forEach(function (childSnapshot) {
        childKey = childSnapshot.key; childData = childSnapshot.val();

        if (childKey != "chatstatus") {
          firebaseMessageId = childKey;
          byuser = childData["user"];
          message = childData["message"];
          senderclass = childData["userclass"];

          div = "<div class='chatmsg'><h2 class='msg-" + senderclass + "'>" + byuser + "</h2><h1>" + message + "</h1>"

          document.getElementById("the_chat").innerHTML += div;
        }
      });
      document.getElementById("the_chat").innerHTML += "<div id='chatbottom'><br><br></div><br><br><br><br>";
    });
  }
}

function goTo(to) {
  if (to == "index") {
    window.location = "index.html";
  }else if(to == "config"){
    window.location = "configurations.html";
  }else if(to == "bottom"){
    window.location = "#chatbottom";
  }else{
    window.location = "gamecord.html";
  }
}

function sendMessage() {
  sending = document.getElementById("msg").value;
  document.getElementById("msg").value = "";
  if (!sending == "") {
    firebase.database().ref("/chats/" + selectedChat).push({
      user: user,
      message: sending,
      userclass: userClass
    });
  }
}

function addChatList(){
  chatlist = document.getElementById("chatlist").value;
  if (chatlist != "") {
    var chatref = firebase.database().ref("/chats/" + chatlist + "/chatstatus");
    var isChatCreated;
    var isJoining = false;
    chatref.on("value", data => {
      isChatCreated = data.val();
      if (!isJoining) {
        isJoining = true;
        if (isChatCreated == "chat") {
          firebase.database().ref("/users/" + user + "/chats").update({
            [chatQuantity]: chatlist
          })
        } else {
          document.getElementById("chaterrors").innerHTML = "<br>This chat does not exist";
        }
      }
    });
  } else {
    document.getElementById("chaterrors").innerHTML = "<br>Chat needs a name";
  }
}

function createChat(){
  chatlist = document.getElementById("chatlist").value;
  if (chatlist != "") {
    var chatref = firebase.database().ref("/chats/" + chatlist + "/chatstatus");
    var isChatCreated;
    var isJoining = false;
    chatref.on("value", data => {
      isChatCreated = data.val();
      if (!isJoining) {
        isJoining = true;
        if (isChatCreated == null) {
          firebase.database().ref("/chats/"+chatlist).set({
           chatstatus: "chat"
          })
          firebase.database().ref("/users/" + user + "/chats").update({
            [chatQuantity]: chatlist
          })
        } else {
          document.getElementById("chaterrors").innerHTML = "<br>This chat already exists";
        }
      }
    });
  } else {
    document.getElementById("chaterrors").innerHTML = "<br>Chat needs a name";
  }
}

//config page
function getConfigData(){
  isConfigPage = true;

  getUserData();

  firebase.database().ref("/users/" + user + "/chats").on('value', function (snapshot) {
    document.getElementById("chatconfigurator").innerHTML = "";
    snapshot.forEach(function (childSnapshot) {
      childKey = childSnapshot.key; childData = childSnapshot.val();

      firebaseMessageId = childKey;

      div = "<b>" + childData + ", </b>"

      document.getElementById("chatconfigurator").innerHTML += div;
    });
    document.getElementById("chatconfigurator").innerHTML += "<button onclick='resetChats()'>Reset</button>";
  });
}

function showPassword(){
  document.getElementById("password-handler").innerHTML = userPass;
}

function resetChats(){
  firebase.database().ref("/users/" + user + "/chats").set(
    ["Gamecord Chat"]
  )
}

function configSpecial(){
  if(userClass == "youtuber" || userClass == "mod"){
    document.getElementById("class-chooser").className = "msg-" + userClass;
    document.getElementById("class-chooser").innerHTML = "<div>You have a special class! "+userClass+"</div>";
  }
}

function changeClass(yourClass){
  firebase.database().ref("/users/" + user).update({
    class: yourClass
  })
}