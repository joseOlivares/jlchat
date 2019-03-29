var app={
	serverUrl:'https://chat2016.herokuapp.com/',

	listenSocket:function(){
	   var socket = io.connect(this.serverUrl); //creating socket connection
	   var usericon='<span uk-icon="commenting"></span> ';
	   var currentUser='nobody';//current user nickname
 		 var senderNick=-1;	//initial default value
 		 var userImg='<img src="img/user.gif" class="img-responsive img-circle center-block" alt="user image">';

		$('#senderNick').prop('disabled', false);//enabling input sender login
		$('#m').prop('disabled',true);//disabling btn send
		$('#btnLogin').prop('disabled',true);//disabling btnLogin
		$('#btnLogout').prop('disabled',true);//disabling btnLogout
			//$('#receiverNick').prop('disabled',true);//disabling input receiver

    socket.on('users connected', function(data){
        $('#usersConnected').html(data); //displaying how many connections are.
    });

		$('#btnLogin').on('click',function(){
				senderNick=$('#senderNick').val();//nickname current logged user
				senderNick=senderNick.trim();
				$('#senderNick').prop('disabled', true); //disabling input senderNick
				$('#m').prop('disabled', false); //enabling input message
				socket.emit('user logged',senderNick); //enviando el nickname del usuario logeado
				toReceivers(senderNick);//adding posible receiver to html select, calling a function
				$('#btnLogin').prop('disabled',true);//disabling btnLogin
				$('#btnLogout').prop('disabled',false);//enabling btnLogout
		});

		socket.on('user logged',function(myInfo){//receives current user data, this is an array
			currentUser=myInfo[0].nickname;
			//senderNick=myInfo[0].iduser; //iduser logged
			$('#m').prop('disabled',false);//enabling btn send
			$('#m').focus();
			//alert(currentUser);
		});

    // Loading stored messages from this current chat user
	    socket.on('initial msgs', function(data){
	    	//alert('Cargando datos...'+data.length);
	    	//alert(data[0][12].msg); //mensaje del registro numero 13     style="text-align: right;"
	        for (var i = 0; i < data.length; i++){
	        	if(data[i].senderNick==senderNick){ //right allingment for my messages
		 			$('#messages').append('<div class="bubble2 me"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-auto">'+userImg +'</div><div class="uk-width-expand">'+data[i].nickname+' '+usericon+' </br>'+data[i].msg + '    ' + '<h6><small class="uk-text-right">  '+data[i].datetime + '</small></h6></div></div></div>');
	        	}else{
		 			$('#messages').append('<div class="bubble you"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-expand">'+data[i].nickname+' '+usericon+' </br>'+data[i].msg + '    ' + '<h6><small>  '+data[i].datetime + '</small></h6></div><div class="uk-width-auto">'+userImg+'</div></div></div>');
		 			}
	        }
	 	    $('#txtChat').scrollTop($('#txtChat')[0].scrollHeight);//moving to the last msg
		    $('#m').focus(); //set focus to input
	    });


		//Form Submitt  Event
	      $('form').submit(function(){ //sending data
	      	var arraymsg=[$('#senderNick').val(),$('#receiverNick').val(),$('#m').val(),currentUser];
	      	if($('#m').val()==''){
	      		$('#m').focus();
	      		return false;
	      	}else{
	      		socket.emit('chat message', arraymsg); //envindo mensaje a node
	      		//showMsg(arraymsg);
	      	}
	      	$('#m').val('');
	      	$('#m').focus();
	        //socket.emit('chat message', $('#m').val()); //emitiendo mensaje a node
	        return false;
	      });
	     //---------------------------------------------------

	      socket.on('chat message', function(msg2){ //recive informacion ingresda en chat
	      	//alert('current id '+senderNick);
	      	var timenow=getDateTime(); //getting time from personal function in jlfunctions.js

		 			if(msg2[0]===senderNick){//right allingment for my messages
				 		$('#messages').append('<div class="bubble2 me"><div class="row"><div class="col-xs-3 col-sm-2">'+userImg +'</div><div class="col-xs-9 col-sm-10">'+usericon +' '+msg2[3]+': </br>'+msg2[2] + '    ' + '<h6><small class="text-right">  '+msg2[4]+ '</small></h6></div></div></div>');
		 			}else{
				 		$('#messages').append('<div class="bubble you"><div class="row"><div class="col-xs-9 col-sm-10">'+usericon+' '+msg2[3]+': </br>'+msg2[2] + '    ' + '<h6><small>  '+msg2[4] + '</small></h6></div><div class="col-xs-3 col-sm-2">'+userImg+'</div></div></div>');
					}

	        $('#txtChat').scrollTop($('#txtChat')[0].scrollHeight);//moving to the last msg
	      	$('#m').val('');
	        $('#m').focus(); //set focus to input
	      });

	      function toReceivers(takenNick){
						//agregando nickname al select destino
						if (takenNick!==senderNick) { //si el emisor no es el mismo receptor, lo agregamos a la lista
								$('#receiverNick').append($("<option></option>").val(takenNick).html(takenNick));
						}
	      }

	      //Listeners
	      $('#btnLogout').on('click',function(){
	      		location.reload(true);
	      });

	      $('#senderNick').on('keyup',function(){
	      		var tmpNick=$('#senderNick').val()||-1;
						const testNick=/^[a-zA-Z]{3,}/;  //validando nick con lettras y/o numeros
						var testResult=testNick.test(tmpNick);
						//debugger;
						if (tmpNick.trim().length>2 && testResult === true ) {
							$('#btnLogin').prop('disabled',false);//enabling btnLogin
	      			$('#btnLogin').addClass('uk-animation-shake');
						//	debugger;
						}else{
							$('#btnLogin').prop('disabled',true);//disabling btnLogin
	      			$('#btnLogin').removeClass('uk-animation-shake');
						}

	      });

	      $('#receiverNick').on('change',function(){
	   			$('#m').focus();
	      });
	      //--End listeners

	}, //close listenSocket

    initialize: function(){ //inicializando el objeto
    	var self=this;
    	//UIkit.notification("<div class='uk-text-center'>Choose a sender <span uk-icon='icon:arrow-right'></span></div>",{pos: 'top-left',status:'primary',timeout:2000});
    	self.listenSocket();
    }
};

app.initialize();
