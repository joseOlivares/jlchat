var express= require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public')); //serving statics files like css, js, images
var port=process.env.PORT || 3000; //this is for heroku
var serverTime = require('./public/js/jlfunctions.js'); //importing my functions for time
//---------------------------------
var mysql = require('mysql');

var pool= mysql.createPool({
  host     : 'remotemysql.com',
  port	   : 3306,
  user     : 'Z0C7OZ6vDm',
  password : 'DN1Vic28Jf',
  insecureAuth: true,
  database : 'Z0C7OZ6vDm'
});

// Define/initialize our global vars
var dataRows= [];
var isInitMsgs = false;
var socketCount = 0;
var userInfo={}; //creando un objeto para almacenar los datos de los usuarios en el server
let listConnectedUsers=[];
//-------------------------------
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
//####################falta implementar eliminar usuarios de la lista al desconectarse del server
io.on('connection', function(socket){
	console.log('an user connected... Socket id: '+socket.id);
	  //console.log(socket);
    socketCount++;// Socket has connected, increase socket count
    io.sockets.emit('users connected', socketCount);    // Let all sockets know how many are connected

    socket.on('login user',function(nickUser){ //loading info from logged user
  		//userInfo=userx;
      //validando que usuario no exista
  		const checkUserQuery='SELECT * FROM user WHERE nickname=?';
  		pool.getConnection(function(err, connection) {
  		  // Use the connection
  		  connection.query(checkUserQuery,[nickUser],function(err,rows) {
  		  		if(err){
  		  			console.log(err);
  		  			return;
  		  		}

            console.log('Usuarios encontrados ='+rows.length);
            const userQueryResult=rows.length;

            if (userQueryResult===0){ //si no existe lo insertamos
              const strInsertUser='INSERT INTO user (nickname,pass,email) VALUES(?)';
              const userFields=[];
              nickUser=nickUser.trim();
              userFields[0]=nickUser;//nickname
              userFields[1]='1234';//pass default
              userFields[2]='myemail@test.com'; //email default
                // Use the connection
                connection.query(strInsertUser,[userFields],function(err, rows) {
                    if(err){
                      console.log(err);
                      return;
                    }else{
                      console.log('New user inserted on database!');
                    }
                });

                connection.query('SELECT * FROM user WHERE nickname=?',[nickUser],function(err, rows2) {
                    if(err){
                      console.log(err);
                      return;
                    }else{
                      userInfo[nickUser]={
                        socketId: socket.id, //sockeid del cliente
                        idNickuser: rows2[0].iduser // id de usurio de tabla base de datos
                      };

                      loadData(rows2[0].iduser); //cargando data segun el idusuario de tabla de base de datos
                      io.sockets.emit('update userslist',userInfo); //actualizando listado de usuarios conectados par todos
                    }
                });
            }else if (userQueryResult===1){ //If user already exist
                userInfo[nickUser]={
                  socketId: socket.id, //sockeid del cliente
                  idNickuser: rows[0].iduser //user id from database
                };
                loadData(rows[0].iduser); //cargando data segun el idusuario de tabla de base de datos
                io.sockets.emit('update userslist',userInfo); //actualizando listado de usuarios conectados par todos

            }else {
              console.log("User query result length is not 0 or 1, check the query...");
            }
            console.log("UserInfo= ",userInfo);
          //listConnectedUsers.push({idNickuser:userInfo[nickUser].idNickuser,nickname:nickUser});
          //io.sockets.emit('update userslist',userInfo); //actualizando listado de usuarios conectados par todos
  		    // release connection
  		    connection.release();
  		    // Don't use the connection here, it has been returned to the pool.
  		  });
  		});
  	});

	socket.on('chat message', function(msg){ //broadcasting msgs
	    //console.log(msg);
      msg.time=serverTime.myTime(); //agregamos propiedad tiempo
		const msgContent=[];
		msgContent[0]=msg.senderId;//idsender
		msgContent[1]=msg.receiverId;//idreceiver
		msgContent[2]=msg.msg; //message
		msgContent[3]=serverTime.myTime(); //adding server time to msg
		msgContent[4]=0; //message forall= 0 (private message)
    //enviando mensaje a dstinatario privado

    socket.emit('chat newmsg', msg );
    //estas dos opciones funionan biune tambien
    //socket.broadcast.to(userInfo[msg.senderNick].socketId).emit( 'chat newmsg', msg );
    socket.broadcast.to(userInfo[msg.receiverNick].socketId).emit( 'chat newmsg', msg );

	  console.log('idSender= '+ msg.senderId + ' idReceiver=' + msg.receiverId + ' Msg='+ msg.msg + ' Time=' +msgContent[3]);
	  const insertMsg='INSERT INTO message (idsender,idreceiver,msg,datetime,forall) VALUES(?)';

		pool.getConnection(function(err, connection) {
		  // Use the connection
		  connection.query(insertMsg,[msgContent],function(err, rows) {
		  		if(err){
		  			console.log(err);
		  			return;
		  		}else{
		  			console.log('Msg inserted on database!');
		  			//probar llamar desde aqui
		  		}
		    // release connection
		    connection.release();
		    // Don't use the connection here, it has been returned to the pool.
		  });
		});

	});//end socket.on 'chat message'


	function loadData(myUserId){
		var selectMsgs='SELECT message.idmsg, message.idsender, user.nickname, message.idreceiver,user.email, message.msg,'+
		' message.datetime FROM message INNER JOIN user ON (message.idsender = user.iduser)'+
		' WHERE message.idSender=? or message.idreceiver=? ORDER BY message.idmsg ';

		//HACER UN EMIT CON EL NICK DEU USUARIO LOGUEADO PARA PROCESAR LA INFO
		//userInfo[0].iduser; //this param will be send from index.html when user starts session on chat
		//console.log('idUsuario Actual Logeado: '+myUser)
		pool.getConnection(function(err, connection) {
		  // Use the connection
		  connection.query(selectMsgs,[myUserId,myUserId],function(err, zrows) {
		  		if(err){
		  			console.log(err);
		  			return;
		  		}else{
		  			dataRows.push(zrows); //copying data from rows to array dataRows
		  			socket.emit('initial msgs',zrows); //sending msgs to index.html for first load
		  			console.log('Msg loaded from database!');
		  			//console.log(zrows);
		  		}
		    // release connection
		    connection.release();
		    // Don't use the connection here, it has been returned to the pool.
		  });
		});
	//-----------------------------------END of bloque IF
}//end function loadData;

    socket.on('disconnect', function () {

        socketCount--; // Decrease the socket count on a disconnect
        io.sockets.emit('users connected', socketCount);    // Let all sockets know how many are connected
        console.log('user disconnected');
    });

});


http.listen(port, function(){
  console.log('listening on *:'+port);
});
