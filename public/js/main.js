var app={ //'https://chat2016.herokuapp.com/'
	serverUrl:'https://chat2016.herokuapp.com/',

	listenSocket:function(){
	   var socket = io.connect(this.serverUrl); //creating socket connection
	   var usericon='<span uk-icon="commenting"></span> ';
	   var senderId=-1;//current user Id
 		 var senderNick=-1;	//initial default value
 		 var userImg='<img src="img/user.gif" class="img-responsive img-circle center-block" alt="user image">';

		$('#senderNick').prop('disabled', false);//enabling input sender login
		$('#m').prop('disabled',true);//disabling  send
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
				//socket.emit('user logged',senderNick); //enviando el nickname del usuario logeado
				socket.emit('login user',senderNick); //enviando usernick para ser validado e insertado
				//toReceivers(senderNick);//adding posible receiver to html select, calling a function
				$('#btnLogin').prop('disabled',true);//disabling btnLogin
				$('#btnLogout').prop('disabled',false);//enabling btnLogout
		});

		socket.on('update userslist',function(users){//Adding user to Receiver's List
				//	var receivers = document.getElementById('receiverNick').options;
				//	var totalReceivers=receivers.length;
				//$('#receiverNick').empty(); 			//limpiando select
				$('#receiverNick').find('option').not(':first').remove();

					for (const key in users) {
					  let value = users[key];
							//debugger;
						let propName=key.toString();
						if (senderNick===propName) {
								senderId=value.idNickuser; //guardamos el id del usuario actual
								$('#m').prop('disabled', false); //enabling input message
						}else if (senderNick!==propName) {
							$('#receiverNick').append($('<option>', {
									value: value.idNickuser,
									text: propName.toString()
							}));
						}

					}
		});


    // Loading stored messages from this current chat user
	    socket.on('initial msgs', function(data){
	    	//alert('Cargando datos...'+data.length);
	    	//alert(data[0][12].msg); //mensaje del registro numero 13     style="text-align: right;"
	        for (var i = 0; i < data.length; i++){
			       if(data[i].idsender===senderId){ //right allingment for my messages
							  //debugger;
				 				$('#messages').append('<div class="bubble2 me"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-auto">'+userImg +'</div><div class="uk-width-expand">'+data[i].nickname+' '+usericon+' </br>'+data[i].msg + '    ' + '<h6><small class="uk-text-right">  '+data[i].datetime + '</small></h6></div></div></div>');
			       }else{
							 debugger;
				 				//$('#messages').append('<div class="bubble you"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-expand">'+data[i].nickname+' '+usericon+' </br>'+data[i].msg + '    ' + '<h6><small>  '+data[i].datetime + '</small></h6></div><div class="uk-width-auto">'+userImg+'</div></div></div>');
				 		}
	        }
	 	    $('#txtChat').scrollTop($('#txtChat')[0].scrollHeight);//moving to the last msg
		    $('#m').focus(); //set focus to input
	    });


		//Form Submitt  Event
	      $('form').submit(function(){ //sending data
					const receiverId=$("#receiverNick").val();
					const receiverNick=$("#receiverNick option:selected").text();
					const msg=$('#m').val();

					if (receiverId==='-1') {
						UIkit.notification("<div class='uk-text-center'>Select a valid receiver <span uk-icon='icon:ban'></span></div>",{pos: 'bottom-center',status:'warning',timeout:2000});
						return false;
					}

	      	if(msg==='' || msg===' '){
	      		$('#m').focus();
	      		return false;
	      	}else{
	      		socket.emit('chat message', {senderId:senderId,senderNick:senderNick,receiverId:receiverId,receiverNick:receiverNick,msg:msg}); //envindo mensaje a node
	      		//showMsg(arraymsg);
	      	}

	      	$('#m').val('');
	      	$('#m').focus();
	        return false;
	      });
	     //---------------------------------------------------

	      socket.on('chat newmsg', function(msg2){ //recive informacion ingresda en chat
	      	alert('Nuevo mensaje acaba de llegar');
	      //	var timenow=getDateTime(); //getting time from personal function in jlfunctions.js
					//debugger;
		 			if(msg2.senderId===senderId){//right allingment for my messages
						//debugger;
						$('#messages').append('<div class="bubble2 me"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-auto">'+userImg +'</div><div class="uk-width-expand">'+msg2.senderNick+' '+usericon+' </br>'+msg2.msg + '    ' + '<h6><small class="uk-text-right">  '+msg2.time + '</small></h6></div></div></div>');
		     	}else {
						//debugger;
			 			$('#messages').append('<div class="bubble you"><div class="uk-flex-row uk-flex-middle" uk-grid><div class="uk-width-expand">'+msg2.senderNick+' '+usericon+' </br>'+msg2.msg + '    ' + '<h6><small>  '+msg2.time + '</small></h6></div><div class="uk-width-auto">'+userImg+'</div></div></div>');
		     	}


	        $('#txtChat').scrollTop($('#txtChat')[0].scrollHeight);//moving to the last msg
	      	$('#m').val('');
	        $('#m').focus(); //set focus to input
	      });

	      function toReceivers(otherUser){
						var receivers = document.getElementById('receiverNick').options;
						var totalReceivers=receivers.length;

						if (senderNick===otherUser.nickname) {
								senderId=otherUser.iduser; //guardamos el id del usuario actual
								$('#m').prop('disabled', false); //enabling input message
						}

						for(var v=0;v<totalReceivers;v++){//agregando nickname al select destino
								if(senderNick!==otherUser.nickname && otherUser.iduser!==receivers[v].value ){
									//si no es el actual y si no existe lo agregamos a la lista
										$('#receiverNick').append($('<option>', {
		    								value: otherUser.iduser,
		    								text: otherUser.nickname.toString()
										}));
								}
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
