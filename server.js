var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , util = require('util')
  , DataManager = require('./library/Common/DataManager');

var dataaccess = new DataManager();
var broadcast = 'broadcaster';
app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}
var fs = require('fs');

var usersockets = {};
var sockers = {}; 

var usersocketsnot = {}; 
var sockersnot = {}; 

var usersocketsmic = {}; 
var sockersmic = {}; 

io.sockets.on('connection',function(socket){
        socket.on("client connect", function(data){ 
            try{
                usersockets[socket.id] = data;
                sockers[socket.id] = socket;
                console.log(Object.keys(usersockets).length  + "|"+ Object.keys(sockers).length );
                var keysSorted = Object.keys(usersockets).sort(function(a,b){return usersockets[a]-usersockets[b]});

                dataaccess.setuseronline(data,true);

                var listuseronline = [];
                    for(var i=0; i < keysSorted.length;i++){
                    if(listuseronline.length == 0 || ( listuseronline.length > 0 && listuseronline[i-1] !== usersockets[keysSorted[i]])){
                        if(usersockets[keysSorted[i]] !== data)
                            listuseronline.push(usersockets[keysSorted[i]]);
                    }
                }
                
                socket.broadcast.emit("user new connect", data,listuseronline.length);
                dataaccess.getuserinfo(data,function(contactlog,result){
                    socket.emit("get userinfo",contactlog,result,listuseronline.length, new Date());
                });
            }catch (err){
                    console.log(err);
                }
        });
		
		socket.on("update all contact server",function(data){
            try {
				//console.log(data.length);
                for (var i = 0; i < data.length; i++) {
                    dataaccess.updateusercontact(data[i]);
                }
            }catch (err){console.log(err+"update all contact server erroe")}
        });

        socket.on("search name key", function(keysearch){
            try{
				//console.log(keysearch);
                dataaccess.findobjectlimitcallback('userinfo',{khongdau:new RegExp('.*' + keysearch)},{username:1,fullname:1,avatar:1},10,function(result){
                    //console.log(result);
					socket.emit("receive contact-search",result);
                })
            }catch(err){
                console.log(err+" search name key error");
            }
        });
		
        socket.on("danhba user online",function(){
            var useronlinearray = [];
            for (var key in usersockets) {
                useronlinearray.push(usersockets[key]);
            }
            if(useronlinearray.length > 0){
                socket.emit("get danhba online", useronlinearray);
            }
        });

        socket.on("get message offline", function(data,ncontact){ 
            dataaccess.getmsgoffline(data,ncontact,function(result){
                socket.emit("return message offline",result);
            });
        })

        socket.on("update contact",function(username,contact){
            dataaccess.updatecontact(username,contact,function(result){
            });
        });

        socket.on("remove contact",function(username,contact){
            dataaccess.removecontact(username,contact);
        });

        socket.on("update field contact", function(username,usercontact,field,value){ 
            dataaccess.updatefieldcontact(username,usercontact,field,value);
        });

        socket.on("update fields contact",function (username, usercontact, fields,unset){
            dataaccess.updatefieldscontact(username, usercontact,fields,unset);
        });

        socket.on("get last message", function(data){
            dataaccess.getlastmsg(data.sender,data.receiver,10,function(result){ 
                socket.emit("return last message",result);
				console.log(result+"return last message");
            });
        });

        socket.on('private msg',function(data){ 
            var recerver = data.receiver;
            data.successful = "0";
            data.time= new Date();

            dataaccess.addmessage(data, function(result){
                for (var key in usersockets){
                    if(usersockets[key] == recerver){
                        sockers[key].emit("receiver new message", result);
                    }
                }
                socket.emit("send successful", result); 
            });
        });

        socket.on("view message",function(data){ 
            dataaccess.updatemessage(data);
        });

        socket.on("view all message",function(data){ 
            dataaccess.updatemessages(data);
        });

        socket.on("get message history",function(data){ 
            dataaccess.getmessagehitory(data,function(result){ 
                socket.emit("return message history", result);
            });
        });

        socket.on("get login store", function(data){
            dataaccess.getloginstore(data,function(result){
                socket.emit("return login store",result);
            });
        });

        socket.on("get many login store", function(data){
            console.log(data.month + "_____" + data.year);
            dataaccess.getloginstores(data, function(result){
                console.log(result);
                socket.emit("return many login store", result);
            }) ;
        });

        socket.on("notification connect", function(data){ 
        try{
            usersocketsnot[socket.id] = data;
            sockersnot[socket.id] = socket;
            console.log(data);
        }catch (err){
            console.log(err);
        }
    });

        socket.on("notification v1",function(receiver, data){
            console.log('notification v1');
            try {
                for (var key in usersocketsnot) {
                    if (usersocketsnot[key] == receiver) {
                        sockersnot[key].emit("receive notification", data);
                        socket.emit("notification successfull", 'finish');
                        console.log(data);
                    }
                }
            }catch(err) {
                console.log(err);
            }
        });

        socket.on("notification v2",function(data){
            try {
                console.log('v2');
                socket.emit("receive notification", data);
                console.log(data);
            }catch(err) {
                console.log(err);
            }
        });

        socket.on("notification v3",function(receiver, data){
            try {
                console.log('v3');
                for (var u in receiver) {
                    for (var key in usersocketsnot) {
                        if (usersocketsnot[key] == receiver[u]) {
                            sockersnot[key].emit("receive notification", data);
                            console.log('receive v3' + key +"||" + usersocketsnot[key]);
                        }
                    }
                }
            }catch(err) {
                console.log(err);
            }
        });

        socket.on("mic connect", function(data){ 
        try{
            usersocketsmic[socket.id] = data;
            sockersmic[socket.id] = socket;
        }catch (err){
            console.log(err);
        }
    });

        socket.on("notification mic",function(receiver, data){
            try {
            for (var u in receiver) {
                for (var key in usersockets) {
                    if (usersockets[key] === receiver[u]) {
                        sockers[key].emit("receive notification", data);
                    }
                }
            }
        }catch(err) {
            console.log(err);
        }
    });

        socket.on('disconnect', function() { 
            try {

                if (typeof usersockets[socket.id] === 'undefined' || usersockets[socket.id] === null) {
                    if(usersocketsnot[socket.id] !== 'undefined') {
                        delete usersocketsnot[socket.id];
                        delete sockersnot[socket.id];
                    }
                    if(usersocketsmic[socket.id] !== 'undefined') {
                        delete usersocketsmic[socket.id];
                        delete sockersmic[socket.id];
                    }
                }else {
                    var disconnect = true;
                    for (var key in usersockets) {
                        if (usersockets[key] == usersockets[socket.id] && key !== socket.id) {
                            disconnect = false;
                        }
                    }
                    if (disconnect) {
                        dataaccess.setlastconnect(usersockets[socket.id]);
                        dataaccess.setuseronline(usersockets[socket.id], false);
                        socket.broadcast.emit("user disconnect", usersockets[socket.id]);
                    }
                    if(usersockets[socket.id] !== 'undefined') {
                        delete usersockets[socket.id];
                        delete sockers[socket.id];
                    }
                    if(usersocketsnot[socket.id] !== 'undefined') {
                        delete usersocketsnot[socket.id];
                        delete sockersnot[socket.id];
                    }
                    if(usersocketsmic[socket.id] !== 'undefined') {
                        delete usersocketsmic[socket.id];
                        delete sockersmic[socket.id];
                    }
                }
            }catch (err){
                console.log(err);
            }
        });
});

