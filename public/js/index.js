var user_name = '';
var user_email = '';
var idx;
var vuser_ref_name;
var room_number = 0, room_name;
var groupRef = firebase.database().ref('numbers_of_rooms');
var cntRef = firebase.database().ref('numbers_of_rooms');
var allRef = firebase.database().ref('all_list');
var messagesRef = firebase.database().ref('all_list');
var chatroom = document.getElementById('chatroom');

var str_before_groupname = "<div class='other'><button type='button' class='btn btn-outline-light' style='width: 100%; height: 100%;' onclick='ChangeRoom(this.textContent)'>";
var str_after_groupname = "</button></div>";
var total_group = [];

var str_before_myname = "<div class='my-3 p-3 bg-warning rounded box-shadow' style='position: relative; width: 70%; left: 30%'><div class='media text-muted pt-3'><p class='media-body pb-3 mb-0 small lh-125 border-bottom border-gray'><strong class='d-block text-gray-dark'>";
var str_before_username = "<div class='my-3 p-3 bg-white rounded box-shadow' style='width: 70%'><div class='media text-muted pt-3'><p class='media-body pb-3 mb-0 small lh-125 border-bottom border-gray'><strong class='d-block text-gray-dark'>";
var str_after_content = "</p></div></div>\n";

function init() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            notification();
            chatroom.innerHTML = '';
            user_name = document.getElementById("user");
            user_email = user.email;
            user_name.textContent = user_email;
            user_ref_name = user_email.replace('.', '');
            groupRef = firebase.database().ref(user_ref_name);
            document.getElementById("logout-btn").addEventListener('click', function() {
                firebase.auth().signOut().then(function() {
                    user_name.textContent = "User";
                }).catch(function(error) {
                    user_name.textContent = "Logout failed";
                });
            });
        } else {
            user_name.textContent = "User";
            chatroom.innerHTML = "";
        }
    });
}

groupRef.once('value').then(function(snapshot) {
    document.getElementById('others').innerHTML = total_group.join('');
    groupRef.on('child_added', function(childSnapshot) {
        total_group[total_group.length] = str_before_groupname + childSnapshot.key + str_after_groupname;
        document.getElementById('others').innerHTML = total_group.join('');
    })
})

document.getElementById('create').addEventListener('click', function() {
    var group_name = document.getElementById('groupname');
    if (group_name.value != "") {
        cntRef.once('value').then(function(snapshot) {
            idx = snapshot.val();
            name_value = group_name.value;
            groupRef.child(name_value).set(idx);
            allRef.child(idx.toString()).set(0);
            group_name.value = "";
            cntRef.set(++idx);
        });
    }
    $('#createRoom').modal('hide');
});

document.addEventListener('DOMContentLoaded', function() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }
    if (Notification.permission !== "granted")
        Notification.requestPermission();
  });

function notification(){
    var instruction = new Notification('Before running...', {
        body: "Before Running, you should know...!"
    });
    instruction.onclick = function() {
        window.open("inst.html");
    };
}

function ChangeRoom(value) {
    document.getElementById('target').innerHTML = '<button type="button" class="btn btn-outline-light" id="add_friend" style="width:10%; height:100%;" data-toggle="modal" data-target="#addFriends">+</button>' + '<strong> ' +  value + '</strong>';
    room_name = value;
    chatroom.innerHTML = "";
    total_message = [];
    groupRef.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.key == value) {
                room_number = childSnapshot.val();
                messagesRef = allRef.child(room_number.toString());
            }
            messagesRef.once('value').then(function(snapshot) {
                chatroom.innerHTML = total_message.join('');
                messagesRef.off();
                messagesRef.on('child_added', function(data) {
                    var childData = data.val();
                    if (childData.email == user_email)    
                        total_message[total_message.length] = str_before_myname + childData.email + "     " + childData.time + "<br>" + childData.data + str_after_content;
                    else
                        total_message[total_message.length] = str_before_username + childData.email + childData.time + "<br>" + childData.data + str_after_content;
                    chatroom.innerHTML = total_message.join('');
                    chatroom.scrollTop = chatroom.scrollHeight;
                })
            })
        });

    })

}

document.getElementById('add').addEventListener('click', function() {
    var friend_email = document.getElementById('friendemail');
    if (friend_email.value != "") {
        var friend_ref_name = friend_email.value.replace('.', '');
        var friendRef = firebase.database().ref(friend_ref_name);
        friendRef.child(room_name);
        friendRef.child(room_name).set(room_number);
        friend_email.value = "";
    }
    $('#addFriends').modal('hide');
})

document.getElementById('send').addEventListener('click', function() {
    var txt = document.getElementById('comment');
    if (txt.value != "") {
        var txtvalue = txt.value.replace(/</g, '&lt');
        var txt_value = txtvalue.replace(/>/g, '&gt');
        var send_time = new Date();
        var hour = send_time.getHours();
        var minute = send_time.getMinutes();
        var second = send_time.getSeconds();
        var send_time = hour+':'+minute+':'+second;
        messagesRef.push({
            "email": user_email,
            "data": txt_value,
            "time": send_time
        });
        txt.value = "";
    }
});

window.onload = function() {
    init();
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user)
            location.href = "/signin.html"
    });
};