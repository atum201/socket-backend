/**
 * Created by Administrator on 4/26/14.
 */

var DatabaseConfig = require('../Config/DatabaseConfig');
var Common = require('./Common.js');
var MongoClient = require('mongodb').MongoClient;
var ObjectID=require('mongodb').ObjectID;
var Backbone = require('backbone');
var util = require('util');

var DataManager = Backbone.Model.extend({
	getcollection : function(colname){
        if(typeof colname == 'string'){
            var ObjectResult = { Result:[]}
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log(err);
            var collection = db.collection(colname);

            collection.find({}).toArray()(function(err,docs){

            });
            db.close();
        });
            return ObjectResult;
        }
    },
    getuserinfo : function(username, callback){
        var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getuserinfo1");
            var collection = db.collection('userinfo');
            collection.find({username:username})
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            var lastconnect = docs[0].lastconnect;
                            var loginstore = docs[0].loginstore;
                            var result = [];
                            if(typeof lastconnect !== 'undefined'){
                                var timelastconnect = new Date(lastconnect);
                                var drefresh = new Date();
                                drefresh.setMinutes(drefresh.getMinutes() - 20); 
                                if(timelastconnect > drefresh){
                                    var contacts = docs[0].contact;
                                    for(var i = 0; i < contacts.length; i ++){ 
                                        if(typeof contacts[i].contacting !== 'undefined' && typeof  contacts[i].index !== 'undefined' && typeof  contacts[i].view !== 'undefined'){
                                            result.push(contacts[i]);
                                        }
                                    }
                                    if(typeof  callback == "function") callback(result,docs[0]);
                                }else{ 
                                    try{

                                        var contact1s = docs[0].contact;
                                        for(var i = 0; i < contact1s.length; i ++){
                                            if(typeof contact1s[i].contacting !== 'undefined'){
                                                delete  contact1s[i].contacting;
                                            }
                                            if(typeof contact1s[i].index !== 'undefined'){
                                                delete  contact1s[i].index;
                                            }
                                            if(typeof contact1s[i].view !== 'undefined'){
                                                delete  contact1s[i].view;
                                            }
                                        }
                                        //_this.updatesetutil('userinfo',{_id: docs[0]._id},{contact: contact1s});
                                        _this.updateobject('userinfo',{_id:docs[0]._id},{$set:{contact:contact1s}});
                                        //collection.update({_id: docs[0]._id}, {$set:{contact: contact1s}},function(err){
                                          //  if (err) {
                                            //    console.log("getuserinfo2");
                                            //}
                                        //});
                                        //_this.callbackaddition('userinfo',{username:username},callback);
                                        _this.findobjectcallback('userinfo',{username:username},callback);
                                        //collection.find({username:username})
                                          //  .toArray(function (err, docs){
                                            //    if(!err){
                                              //      var rc = docs.length;
                                                //    if(rc>0){
                                                  //      if(typeof  callback == "function") callback([],docs[0]);
                                                    //}
                                                //}
                                            //});
                                    }catch (errr){console.log(errr+"getuserinfo3")};
                                }
                            }

                            if(typeof loginstore !== 'undefined'){
                                try {
                                    var firstconn = new Date(loginstore.firstconnect);
                                    var store = loginstore.store;
                                    var timelastconnect = new Date(lastconnect);
                                    var drefresh = new Date();
                                    var indexstore = new Common().monthdiff(firstconn, new Date());
                                    drefresh.setMinutes(drefresh.getMinutes() - 20); 
                                    if (timelastconnect < drefresh) {
                                        
                                        if (store.length < indexstore) {
                                            for (var i = store.length; i < indexstore; i++) {
                                                store.push(0);
                                            }
                                            store.push(1);
                                        } else if (store.length === indexstore) {
                                            store.push(1);
                                        } else {
                                            var v = store[indexstore];
                                            store[indexstore] = (v + 1);
                                        }
                                        //_this.updatesetutil('userinfo',{username: username},{loginstore: {firstconnect: firstconn,store: store}});
                                        _this.updateobject('userinfo',{username:username},{$set:{loginstore: {firstconnect: firstconn,store: store}}});
                                        //collection.update({username: username}, {$set: {loginstore: {firstconnect: firstconn,store: store}}}, function (err, docs1) {
                                          //  if (err)
                                            //    console.log("getuserinfo12");
                                        //});
                                    } else {
                                        
                                    }
                                }catch (errrr){
                                    console.log(errrr+"getuserinfo13");
                                }
                            }else{
                                //_this.updatesetutil('userinfo',{username:username},{loginstore:{firstconnect: new Date(), store:[1]}});
                                _this.updateobject('userinfo',{username:username},{$set:{loginstore:{firstconnect: new Date(), store:[1]}}});
                                //collection.update({username:username},{$set:{loginstore:{firstconnect: new Date(), store:[1]}}},function(err,docs1){
                                  //  if(err)
                                    //    console.log("getuserinfo4");
                                    //isclose = true;
                                    //db.close();
                                //});
                            }
                        }
                        else{
                            //_this.insertutil('userinfo',{username:username,contact:[],loginstore:{firstconnect: new Date(), store:[1]}});
                            _this.insertobjectoption('userinfo',{username:username,contact:[],loginstore:{firstconnect: new Date(), store:[1]}},{continueOnError: true});
                            //collection.insert({username:username,contact:[],loginstore:{firstconnect: new Date(), store:[1]}},{continueOnError: true}, function(err, docs) {
                             //   if(typeof  callback == "function") callback([],docs);
                               // isclose = true;
                                //db.close();
                            //});
                        }
                    }
                    db.close();
                });
        });
    },
    updateusercontact : function(usercontact){
        var _this = this;
		//console.log(usercontact);
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updateusercontact");
            var collection = db.collection('userinfo');
			//console.log(usercontact);
            collection.find({username: usercontact.username})
                .toArray(function (err, docs) {
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            _this.updateobject('userinfo',{username:usercontact.username},{$set:{fullname: usercontact.fullname,avatar:usercontact.avatar}});
							//console.log('update: '+usercontact.username);
                        }else{
                            _this.insertobjectoption('userinfo',{username:usercontact.username,fullname:usercontact.fullname,avatar:usercontact.avatar,contact:[],loginstore:{firstconnect: new Date(), store:[1]}},{continueOnError: true});
							//console.log('insert: '+usercontact.username);
                        }
                    }
                    db.close();
                });
        });
    },
    updatesetutil : function(col,addition,update){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            var collection = db.collection(col);
            try {
                collection.update(addition, {$set: update}, function (err, docs) {
                        if (err)
                            console.log("updatesetutil");
                        db.close();
                    });
            }catch (errr){
                console.log("updatesetutil"+errr);
            }
        });
    },
    callbackaddition : function(col,addition,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            var collection = db.collection(col);
            try {
                collection.find(addition)
                    .toArray(function (err, docs){
                        if(!err){
                            var rc = docs.length;
                            if(rc>0){
                                if(typeof  callback == "function") callback([],docs[0]);
                            }
                        }
                        db.close();
                    });
            }catch (errr){
                console.log("callbackaddition"+errr);
            }
        });
    },
    insertutil : function(col,insertitem){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            var collection = db.collection(col);
            try {
                collection.insert(insertitem,{continueOnError: true}, function(err, docs) {
                    if(typeof  callback == "function") callback([],docs);
                    db.close();
                });
            }catch (errr){
                console.log("insertutil"+errr);
            }
        });
    },
    getmsgoffline : function(data,ncontact,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getmsgoffline");
            var collection = db.collection('msgstore');
            if(ncontact.length > 0){
                collection.find({receiver:data,successful:"0",sender:{$nin:ncontact}})
                    .toArray(function (err, docs){
                        if(!err){
                            var rc = docs.length;
                            if(rc>0){
                                if(typeof  callback == "function") callback(docs);
                            }
                        }
                        db.close();
                    });
            }else{
            collection.find({receiver:data,successful:"0"})
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            if(typeof  callback == "function") callback(docs);
                        }
                    }
                    db.close();
                });
            }

        });
    },
    updatecontact : function(username, contact,callback){
        var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatecontact1");
            var collection = db.collection('userinfo');
            collection.find({username:username})
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        try {
                            if (rc > 0) {
                                var contacts = docs[0].contact;
                                var contactupdate = [];
                                if (Array.isArray && Array.isArray(contact)) {
                                    contactupdate = contact;
                                } else {
                                    contactupdate.push(contact);
                                }
                                for (var j = 0; j < contactupdate.length; j++) {
                                    var exit = false;
                                    for (var i = 0; i < contacts.length; i++) {
                                        console.log(contacts.length);
                                        if (contacts[i].username === contactupdate[j].username) {
                                            contacts[i] = contactupdate[j];
                                            exit = true;
                                        }
                                    }
                                    if (!exit)
                                        contacts.push(contactupdate[j]);
                                }
								//collection.update({_id: docs[0]._id}, {$set:{contact: contacts}},function(err){
									//if (err) {
									//	console.log("updatecontact22");
									//}
									//db.close();
								//});
                                _this.updatecontact2(docs[0]._id, contacts); 
                            }
                        }catch(errr){
                            console.log("updatecontact2"+ errr);
                        }
                    }
                    db.close();
                });

        });
    },
    updatecontact2 : function(id, contacts){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatecontact21");
            console.log(id);
            var collection = db.collection('userinfo');
            collection.update({_id: id}, {$set:{contact: contacts}},function(err){
                if (err) {
                    console.log("updatecontact22");
                }
                db.close();
            });
        });
    },
    removecontact : function(username, contact){
        console.log("removecontactsdsdsd");
        var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("removecontact");
            var collection = db.collection('userinfo');
            collection.find({username:username})
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        try {
                            if (rc > 0) {
                                var contacts = docs[0].contact;
                                var index = -1;
                                for (var j = 0; j < contacts.length; j++) {

                                    if (contacts[j].username === contact.username)
                                        index = j;
                                }
                                    if (index !== -1)
                                        contacts.splice(index,1);

                                _this.updatecontact2(docs[0]._id, contacts); 
                                console.log(contacts + "____"+ index);
                            }
                        }catch(errr){
                            console.log("removecontact"+ errr);
                        }
                    }
                    db.close();
                });

        });
    },
    updatefieldcontact : function(username,usercontact,field,value){
		var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatefieldcontact");
            var collection = db.collection('userinfo');
            var contactupdate = {};
            try {
                if (field === "timeclean") {
                    contactupdate["contact.$.timeclean"] = new Date();
                } else {
                    contactupdate["contact.$." + field] = value;
                }
                if (value === "" || value === null) {
					_this.updateobject("userinfo",{username: username, "contact.username": usercontact},{$unset: contactupdate});
                    //collection.update({username: username, "contact.username": usercontact}, {$unset: contactupdate}, function (err, docs) {
                        //if (err)
                          //  console.log("updatefieldcontact1");
                        //db.close();
                    //});
                } else {
					_this.updateobject("userinfo",{username: username, "contact.username": usercontact},{$set: contactupdate});
                    //collection.update({username: username, "contact.username": usercontact}, {$set: contactupdate}, function (err, docs) {
                      //  if (err)
                        //    console.log("updatefieldcontact2");
                        //db.close();
                    //});
                }
            }catch (errr){
                console.log("updatefieldcontact2"+errr);
            }
        });
    },
    updatefieldscontact : function(username,usercontact,fields,unset){
		var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatefieldscontact");
            var collection = db.collection('userinfo');
            try {
                if (unset) {
					_this.updateobject("userinfo",{username: username, "contact.username": usercontact},{$unset: fields});
                    //collection.update({username: username, "contact.username": usercontact}, {$unset: fields}, function (err, docs) {
                    //    if (err)
                    //        console.log("updatefieldscontact1");
                    //    db.close();
                    //});
                } else {
					_this.updateobject("userinfo",{username: username, "contact.username": usercontact},{$set: fields});
                    //collection.update({username: username, "contact.username": usercontact}, {$set: fields}, function (err, docs) {
                    //    if (err)
                    //        console.log("updatefieldscontact2");
                    //    db.close();
                    //});
                }
            }catch(errr){
                console.log("dauptefielsdcontact23"+ errr);
            }
        });
    },
    
    addmessage : function (message, callback){
		//var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("addmessage1");
            var collection = db.collection('msgstore');
            collection.insert(message, {continueOnError: true}, function(err, docs) {
                if(typeof  callback == "function") callback(docs[0]);
                db.close();
            });

        });
    },
    getlastmsg : function(user1, user2, numbermsg, callback){
		var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getlastmsg1");
            var colluser = db.collection('userinfo');
            var collection = db.collection('msgstore');
            if(numbermsg == null){
                numbermsg = 10;
            }
            colluser.find({username: user1, "contact.username": user2}, {'contact.$': 1})
                    .toArray(function (err, docs) {
                        var isclose = false;
                        if (!err) {
                            var rc = docs.length;
                            if (rc > 0) {
                                var contacttimeclean = docs[0].contact;
                                if (typeof contacttimeclean[0].timeclean === 'undefined') {
									_this.findobjectsortlimitcallback('msgstore',{ $or:[{receiver:user1,sender:user2},{receiver:user2,sender:user1}]},{time:-1},numbermsg,
									callback);
                                    //collection.find({ $or:[{receiver:user1,sender:user2},{receiver:user2,sender:user1}]})
                                    //    .sort({time:-1})
                                    //    .limit(numbermsg)
                                    //    .toArray(function (err, docs){
                                    //        if(!err){
                                    //           var rc = docs.length;
                                    //            if(rc>0){
                                    //                callback(docs);
                                    //            }
                                    //        }else
                                    //            console.log("getlastmsg2"+err);
                                    //        isclose = true;
                                    //        db.close();
                                    //    });
                                }else{
									_this.findobjectsortlimitcallback('msgstore',{ $or:[{receiver:user1,sender:user2},{receiver:user2,sender:user1}],time:{$gt:new Date(contacttimeclean[0].timeclean)}},{time:-1},numbermsg,
									callback);
                                    //collection.find({ $or:[{receiver:user1,sender:user2},{receiver:user2,sender:user1}],time:{$gt:new Date(contacttimeclean[0].timeclean)}})
                                    //    .sort({time:-1})
                                    //    .limit(numbermsg)
                                    //    .toArray(function (err, docs){
                                    //        if(!err){
                                    //            var rc = docs.length;
                                    //            if(rc>0){
                                    //                callback(docs);
                                    //            }
                                    //        }else
                                    //            console.log("getlastmsg3");
                                    //        isclose = true;
                                    //        db.close();
                                    //    });
                                }
                            }
                        }
                        db.close();
                    });

        });
    },//*
    updatemessage : function(data){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatemessage");
            var collection = db.collection('msgstore');
            collection.update({_id:ObjectID(data)},{$set:{successful:"1"}},function(err){
                if (err) {
                    console.log("updatemessage1");
                }
                db.close();
            });

        });
    },
    updatemessages : function(data){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updatemessages");
            var collection = db.collection('msgstore');
            collection.update({sender:data.sender,receiver:data.receiver},{$set:{successful:"1"}},{ multi: true },function(err){
                if (err) {
                    console.log("updatemessages1");
                }
                db.close();
            });

        });
    },
    getmessagehitory : function(data, callback){
        var _this = this;
		MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getmessagehitory");
            var colluser = db.collection('userinfo');
            var collection = db.collection('msgstore');

            colluser.find({username:data.sender,"contact.username":data.receiver},{'contact.$':1})
                .toArray(function (err, docs){
                    var isclose = false;
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            var contacttimeclean = docs[0].contact;
                            if (typeof contacttimeclean[0].timeclean === 'undefined') {
                                _this.findobjectsortlimitcallback('msgstore',{ $or:[{receiver:data.receiver,sender:data.sender},{receiver:data.sender,sender:data.receiver}],time:{$lt:new Date(data.time)}},{time:-1},10,callback);
								//collection.find({ $or:[{receiver:data.receiver,sender:data.sender},{receiver:data.sender,sender:data.receiver}],time:{$lt:new Date(data.time)}})
                                //    .sort({time:-1})
                                //    .limit(10)
                                 //   .toArray(function (err, docs){
                                //        if(!err){
                                //            var rc = docs.length;
                                //            if(rc>0){
                                //                callback(docs);
                                //            }
                                //       }else
                                //        {console.log("getmessagehitory1");}
                                //        isclose = true;
                                //        db.close();
                                //    });
                            }else{
								_this.findobjectsortlimitcallback("msgstore",{ $or:[{receiver:data.receiver,sender:data.sender},{receiver:data.sender,sender:data.receiver}],time:{$lt:new Date(data.time),$gt:new Date(contacttimeclean[0].timeclean)}},{time:-1},10,callback);
                                //collection.find({ $or:[{receiver:data.receiver,sender:data.sender},{receiver:data.sender,sender:data.receiver}],time:{$lt:new Date(data.time),$gt:new Date(contacttimeclean[0].timeclean)}})
                                //    .sort({time:-1})
                                //    .limit(10)
                                //    .toArray(function (err, docs){
                                //        if(!err){
                                //            var rc = docs.length;
                                //            if(rc>0){
                                //                callback(docs);
                                //            }
                                //        }else
                                //        {console.log("getmessagehitory2");}
                                //        isclose = true;
                                //        db.close();
                                //    });
                            }
                        }
                    }else
                        console.log("getmessagehitory3");
                    //if(!isclose)
                        db.close();

                });

        });
    },
    getmsgbyid : function(idmsg,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log(err);
            var collection = db.collection('msgstore');
            collection.find({ _id:ObjectID(idmsg)})
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            callback(docs[0]);
                        }
                    }
                    db.close();
                });

        });
    },
    setlastconnect : function(data){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("setlastconnect");
            var collection = db.collection("userinfo");
            var d = new Date();
            collection.update({ username:data},{$set:{lastconnect:d}},function(err,docs){
                if (err) {
                    console.log("setlastconnect1"+err);
                }
                db.close();
            });

        });
        this.setlastconnect2(data);
    },
    setlastconnect2 : function(data){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("setlastconnect");
            var collection = db.collection("userinfo");
            var d = new Date();
            var contactupdate = {};
            contactupdate["contact.$.lastconnect"] = d;
            var contactquery = {};
            contactquery["contact.username"] = data;
            collection.update(contactquery,{$set:contactupdate},{multi:true},function(err,docs){
                if (err) {
                    console.log("setlastconnect2");
                }
                db.close();
            });

        });
    },
    setuseronline : function(data,online){
        var _this = this;
		MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("setuseronline");
            var collection = db.collection("userinfo");
            var contactupdate = {};
            contactupdate["contact.$.online"] = online;
            var contactquery = {};
            contactquery["contact.username"] = data;

            if(!online){ 
                contactupdate["contact.$.online"] = "";
				_this.updateobjectoption("userinfo",contactquery,{$unset:contactupdate},{multi:true});
                //collection.update(contactquery,{$unset:contactupdate},{multi:true},function(err,docs){
                //    if (err) {
                //        console.log("setuseronline2");
                //    }
                //    db.close();
                //});
            }else{
				_this.updateobjectoption("userinfo",contactquery,{$set:contactupdate},{multi:true});
                //collection.update(contactquery,{$set:contactupdate},{multi:true},function(err,docs){
                //    if (err) {
                //        console.log("setuseronline3");
                //    }
                //    db.close();
                //});
            }

        });
    },
    getloginstore : function (data, callback){ 
		var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getloginstore");
            var collection = db.collection("userinfo");
            var month = data.month;
            var year = data.year;
            var datareturn = 0;
            var cm = new Common();
            collection.find({username:data.username})
                .toArray(function (err, docs) {
                    if (!err) {
                        var rc = docs.length;
                        if(rc > 0){
                            var loginstore = docs[0].loginstore;
                            var firstconn = new Date(loginstore.firstconnect);
                            var store = loginstore.store;
                            if(year === "all" || year === '' || year === 'undefined'){
                                for(var j = 0; j < store.length; j ++)
                                    datareturn += store[j];
                            }else{
                                if(month === "all" || month === '' || month === 'undefined'){
                                    if(firstconn.getFullYear <= year){
                                        var index = cm.monthdiff(firstconn,new Date(year,12,1));
                                        for(var j = index; j > 0; j --){
                                            var k = 0;
                                            if(k < 12 && typeof store[j] !== 'undefined')
                                                datareturn += store[j];
                                            k++;
                                        }
                                    }
                                }else{
                                    var index = cm.monthdiff(firstconn, new Date(year,month,1));
                                    if(typeof store[index] !== 'undefined')
                                        datareturn = store[index];
                                }
                            }
                        }
                        db.close();
                    }
                });
            if(typeof callback === 'function'){
                callback(datareturn);
            }

        });
    },
    getloginstores : function(data, callback){ 
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("getloginstores");
            var collection = db.collection("userinfo");
            var month = data.month;
            if(typeof data.month === 'undefined')
                month = "all";
            var year = data.year;
            if(typeof data.year=== 'undefined')
                year = 'all';
            var datareturn  = [];
            var cm = new Common();
            console.log(data);
            collection.find({username:{$in:data.users}})
                .toArray(function (err, docs) {
                    if (!err) {
                        var rc = docs.length;
                        if(rc > 0){
                            try {
                                console.log(docs);
                                for (var i = 0; i < docs.length; i++) {
                                    var userstore = {username: docs[i].username, login: 0};
                                    var loginstore = docs[i].loginstore;
                                    var firstconn = new Date(loginstore.firstconnect);
                                    var store = loginstore.store;
                                    if (year === "all" || year === '' || year === 'undefined') {
                                        for (var j = 0; j < store.length; j++)
                                            userstore.login += store[j];
                                    } else {
                                        if (month === "all"  || month === '' || month === 'undefined') {
                                            if (firstconn.getFullYear() <= year) {
                                                var index = cm.monthdiff(firstconn, new Date(year, 11, 1));
                                                for (var j = index; j > 0; j--) {
                                                    console.log(j+'-----');
                                                    var k = 0;
                                                    if (k < 12 && typeof store[j] !== 'undefined')
                                                        userstore.login += store[j];
                                                    k++;
                                                }
                                            }else{
                                                console.log(firstconn.getFullYear +"-"+ year);
                                            }
                                        } else {
                                            var index = cm.monthdiff(firstconn, new Date(year, month-1, 1));
                                            
                                            if (typeof store[index] !== 'undefined')
                                                userstore.login = store[index];
                                        }
                                    }
                                    console.log(userstore);
                                    datareturn.push(userstore);
                                    console.log(datareturn + "1sdsdsad");
                                }
                            }catch (eere){console.log("getloginstores2"+ eere);}
                        }
                        if(typeof callback === 'function')
                            callback(datareturn);
                        db.close();
                    }
                });


        });
    },
    addsocket: function(username, socket){
		var _this = this;
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("addsocket");
            var collection = db.collection("socketstore");
            collection.find({username: username}).toArray(function (err, docs){
                    var isclose = false;
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            var sk = docs[0].socket;
                            sk.push(socket);
							_this.updateobject("socketstore",{username:username},{$set:{socket:sk}});
                            //collection.update({username:username},{$set:{socket:sk}},function (err, docs1) {
                            //    if (err)
                            //        console.log("addsocket2");
                            //    isclose = true;
                            //    db.close();
                            //});
                        }else{
							_this.insertobjectoption("socketstore",{username:username,socket:[socket]},{continueOnError: true});
                            //collection.insert({username:username,socket:[socket]},{continueOnError: true}, function(err, docs) {
                            //    if(typeof  callback == "function") callback([],docs);
                            //    isclose = true;
                            //    db.close();
                            //});
                        }
                    }
                //if(!isclose)
                    db.close();
            });

        });
    },
    removesocket: function(username, socketid){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log(err);
            var collection = db.collection("socketstore");
            collection.find({username: username}).toArray(function (err, docs){
                if(!err){
                    var rc = docs.length;
                    if(rc>0){
                        var sk = docs[0].socket;
                        var index;
                        for(var i = 0; i < sk.length; i ++){
                            if(sk[i].id === socketid)
                                index = i;
                        }
                        if(typeof index !== 'undefined')
                            sk.splice(index,1);
                        collection.update({username:username},{$set:{socket:sk}},function (err, docs1) {
                            if (err)
                                console.log(err);
                        });
                    }
                }
                db.close();
            });

        });
    },
    getsocketofuser: function(username, callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log(err);
            var collection = db.collection("socketstore");
            collection.find({username: username}).toArray(function (err, docs){
                if(!err){
                    var rc = docs.length;
                    if(rc>0){
                        if(typeof callback === 'function')
                            callback(docs[0]);
                    }
                }
                db.close();
            });

        });
    },
    // workshop database util
    // <-- collection name -->: broadcaster
    // <-- document struct -->:{docid:1,workshop:'apectel45',hoatdong:1,ten:'thông báo',noidung:'thông báo họp',batdau:ISODate("2014-12-27T16:56:03.164Z"),ketthuc:ISODate("2014-12-27T16:56:03.164Z"),biendo:(+)5,baolai:10,donvibaolai:"M/W/d/h/m",baotruoc:10,donvibaotruoc:'M/W/d/h/m',trangthai:0/1}

    // end workshop database util

    // database core
    createcollection:function(colname){},
    createcollectionoption:function(colname,option){},

    updateobject : function(col,query, update){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updateobject : "+col+"                         ");
            var collection = db.collection(col);
                collection.update(query, update,function(err){
                    if (err) {
                    	console.log("updateobject  error" + col+"    "+err+"                                      ");
                    }
                    db.close();
                });
        });
    },
    updateobjectoption : function(col,query,update,option){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updateobjectoption : "+col+"                         ");
            var collection = db.collection(col);
            collection.update(query, update,option,function(err){
                if (err) {
                    console.log("updateobjectoption  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    updateobjectcallback : function(col,query,update,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updateobjectcallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.update(query, update,function(err){
                if (err) {
                    console.log("updateobjectcallback  error" + col+"    "+err+"                                      ");
                }
                if(typeof callback === 'function'){
                    callback();
                }
                db.close();
            });
        });
    },
    updateobjectoptioncallback: function(col, query, update,option, callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("updateobjectoptioncallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.update(query, update,option,function(err){
                if (err) {
                    console.log("updateobjectoptioncallback  error" + col+"    "+err+"                                      ");
                }
                if(typeof callback === 'function'){
                    callback();
                }
                db.close();
            });
        });
    },

    insertobject : function(col, object){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("insertobject : "+col+"                         ");
            var collection = db.collection(col);
            collection.insert(object, function(err, docs) {
                if (err) {
                    console.log("insertobject  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    insertobjectoption : function(col, object, option){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("insertobjectoption : "+col+"                         ");
            var collection = db.collection(col);
            collection.insert(object,option, function(err, docs) {
                if (err) {
                    console.log("insertobjectoption  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    insertobjectcallback : function (col, object, callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("insertobjectcallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.insert(object, function(err, docs) {
                if (!err) {
                    var rc = docs.length;
                    if(rc>0){
                        if(typeof callback === 'function')
                            callback(docs[0]);
                    }

                }else{
                    console.log("insertobjectcallback  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    insertobjectoptioncallback : function(col, object, option,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("insertobjectoptioncallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.insert(object,option, function(err, docs) {
                if (!err) {
                    var rc = docs.length;
                    if(rc>0){
                        if(typeof callback === 'function')
                            callback(docs[0]);
                    }

                }else{
                    console.log("insertobjectoptioncallback  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },

    removeobject:function (col,query){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("removeobject : "+col+"                         ");
            var collection = db.collection(col);
            collection.remove(query,function(err){
                if (err) {
                    console.log("removeobject  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    removeobjectoption:function(col,query, option){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("removeobjectoption : "+col+"                         ");
            var collection = db.collection(col);
            collection.remove(query,option,function(err){
                if (err) {
                    console.log("removeobjectoption  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
        });
    },
    removeobjectcallback:function(col, query, callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("removeobjectcallback : "+col+"                         ");
            var collection = db.collection(col);
            var result = collection.remove(query,function(err){
                if (err) {
                    console.log("removeobjectcallback  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
            if(typeof callback === 'function')
                callback(result);
        });
    },
    removeobjectoptioncallback:function(col,query,option, callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("removeobjectoptioncallback : "+col+"                         ");
            var collection = db.collection(col);
            var result = collection.remove(query,option,function(err){
                if (err) {
                    console.log("removeobjectoptioncallback  error" + col+"    "+err+"                                      ");
                }
                db.close();
            });
            if(typeof callback === 'function')
                callback(result);
        });
    },

    findobjectcallback:function(col,query,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("findobjectcallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.find(query)
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            if(typeof  callback == "function") callback(docs);
                        }
                    }else{
                        console.log("findobjectcallback  error" + col+"    "+err+"                                      ");
                    }
                    db.close();
                });
        });
    },
    findobjectoptioncallback:function(col,query,option,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("findobjectoptioncallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.find(query,option)
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            if(typeof  callback == "function") callback(docs);
                        }
                    }else{
                        console.log("findobjectoptioncallback  error" + col+"    "+err+"                                      ");
                    }
                    db.close();
                });
        });
    },
    findobjectlimitcallback:function(col, query,select,limit,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("findobjectcallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.find(query,select).limit(limit)
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            if(typeof  callback == "function") callback(docs);
                        }
						//console.log(query);
                    }else{
                        console.log("findobjectcallback  error" + col+"    "+err+"                                      ");
                    }
                    db.close();
                });
        });
    },
	findobjectsortlimitcallback:function(col, query,sort,limit,callback){
        MongoClient.connect(DatabaseConfig.getConnectionString(), function(err, db) {
            if (err) console.log("findobjectsortlimitcallback : "+col+"                         ");
            var collection = db.collection(col);
            collection.find(query).sort(sort).limit(limit)
                .toArray(function (err, docs){
                    if(!err){
                        var rc = docs.length;
                        if(rc>0){
                            if(typeof  callback == "function"){ 
								callback(docs);
							}
                        }
						//console.log(docs);
                    }else{
                        console.log("findobjectsortlimitcallback  error" + col+"    "+err+"                                      ");
                    }
                    db.close();
                });
        });
    }
    // end database core

});

module.exports = DataManager;