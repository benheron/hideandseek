var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
var port = 4000;

var file = new nodeStatic.Server('bin',  {
    cache:0,
    gzip:true
});

var httpServer = http.createServer(function(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
}).listen(port);



var sio = socketIO();
sio.serveClient(true);
sio.attach(httpServer);


var host;
var players = {'seekers': [], 'hider': {}};


var canStart = false;
var ingame = false;
var numPopulated = 0;
var everyonePopulated = false;
var end = false;

var everyoneBack = false;
var numBack = 0;

var collide = false;

var counter = 0;

var playing = false;


var updateInterval;
var secondInterval;




function Player (id, team)
{
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.team = team;
}


function boxBoxCollision(a, b)
{
    var playerSize = 15;

    if ((a['x'] + playerSize) < b['x'] ||
		a['x'] > (b['x'] + playerSize) ||
		(a['y'] + playerSize) < b['y'] ||
		a['y'] > (b['y'] + playerSize))
	{
		return false;
	}
    return true;
}




sio.on('connection', function(socket) {
    console.log('User ' + socket.id + ' connected ');
   // players.push(socket.id);
    socket.emit('greetings', 'Hello from the server!', socket.id);

    socket.on('disconnect', function()
    {
        console.log('User ' + socket.id + ' disconnected');
        if (host == socket.id)
        {
            host = undefined;
        }


        for (var i = 0; i < players['seekers'].length; i++)
        {
            if (players['seekers'][i]['id'] == socket.id)
            {
                players['seekers'].splice(i, 1);
                sio.emit('removeSeeker', socket.id);
                console.log('Player ' + socket.id + ' removed from seeker');
                if (players['seekers'] == 0)
                {
                    sendCurrentPlayers('hiderwin');
                   

                    resetToDefaults();
                }
                break;
               
            }
        }



        if (players['hider']['id'] == socket.id)
        {
            delete players['hider'];
            players['hider'] = {};
            sio.emit('removeHider', socket.id);
            console.log('Player ' + socket.id + ' removed from hider');

            var idSend;
            for (var i = 0; i < players['seekers'].length; i++)
            {
                idSend = sio.sockets.connected[players['seekers'][i]['id']];
                idSend.emit('seekerwin');
            }

            if (Object.keys(players['hider']).length > 0)
            {
                idSend = sio.sockets.connected[players['hider']['id']];

                //send to connected hider
                idSend.emit('seekerwin');
            }
            resetToDefaults();
        }
    });


    socket.on('message', function(msg)
    {
        console.log('User ' + this.id + ' sent message "' + msg + '"');
    });


    socket.on('playerPos', function(playerX, playerY)
    {
        console.log('Player X: ' + playerX + ' Player Y: ' + playerY);
    });

    socket.on('idcheck', function(msg)
    {
        console.log(msg + socket.id);
    });

    socket.on('joinedmenu', function()
    {
        var nh = 0;
        
        //make sure exists
        if (Object.keys(players['hider']).length > 0)
        {
            nh = 1;
        }

        sio.emit('joinedmenu', players['seekers'].length, nh);

    });

    socket.on('checkhost', function()
    {
        if (host == undefined)
        {
            host = socket.id;
            socket.emit('sethost', socket.id);

            console.log("New host: " + host);
        }
    });

    //adding players
    //seekers
    socket.on('addSeeker', function()
    {
        //players['seekers'].push(socket.id);
        players['seekers'].push({'id': socket.id});
        sio.emit('addSeeker', players);
        console.log('Player ' + socket.id + ' added as seeker');
        console.log(players['seekers'].length);

        

    });

    //hider
    socket.on('addHider', function()
    {
       
        players['hider'] = {'id' : socket.id};
        sio.emit('addHider', players);
        console.log('Player ' + socket.id + ' added as hider');
    });


    //removing players
    //seekers
    socket.on('removeSeeker', function()
    {
        for (var i = 0; i < players['seekers'].length; i++)
        {
            if (players['seekers'][i]['id'] == socket.id)
            {
                players['seekers'].splice(i, 1);
                sio.emit('removeSeeker', players);
                console.log('Player ' + socket.id + ' removed from seeker');
                break;
            }
        }

       
    });

    //hider
    socket.on('removeHider', function()
    {
        
        if (players['hider']['id'] == socket.id)
        {
            delete players['hider'];
            players['hider'] = {};
            sio.emit('removeHider', players);
            console.log('Player ' + socket.id + ' removed from hider');
        }
       
    });

    socket.on('startgame', function()
    {
        canStart = false;
        //make sure the user can start the game
        
        //if there aren't already players ingame
        if(!ingame)
        {
            //has to be a player
            //either a seeker
            for (var i = 0; i < players['seekers'].length; i++)
            {
                if (players['seekers'][i]['id'] == socket.id)
                {
                    canStart = true;
                }
            }

            //or a hider
            if (players['hider']['id'] == socket.id)
            {
                canStart = true;
            }
        }

       
       
        //make sure there is at least one seeker and hider
        if (players['seekers'].length > 0 && Object.keys(players['hider']).length > 0 && canStart)
        {
            var map = Math.floor(Math.random() * 2);
            var mapName;

            if (map == 0)
            {
                mapName = 'map2';
            } else if (map == 1)
            {
                mapName = 'map5';
            } else {
                mapName = 'map5';
            }

            //send to all connected seekers
            var idSend;
            for (var i = 0; i < players['seekers'].length; i++)
            {
                idSend = sio.sockets.connected[players['seekers'][i]['id']];
                idSend.emit('startgame', 0, mapName);
                console.log('Sending start data to seeker: ' + players['seekers'][i]['id']);
            }

            idSend = sio.sockets.connected[players['hider']['id']];
            

            //send to connected hider
            idSend.emit('startgame', 1, mapName);
            console.log('Sending start data to hider: ' + players['hider']['id']);
            ingame = true;
        }

   
    });

    socket.on('requestplayersid', function()
    {
        var idSend;
        idSend = sio.sockets.connected[socket.id];
        idSend.emit('sentplayersid', players);
        console.log("Sending player ids to the player who requested it. ID: " + socket.id);
    });

    socket.on('playerdata', function(playerdata, team)
    {
        
        if (team == 0)
        {
            for (var i = 0; i < players['seekers'].length; i++)
            {
                if (socket.id == players['seekers'][i]['id'])
                {
                    players['seekers'][i] = playerdata;
                    // console.log("Update sent from seeker " +  socket.id + " New x: " + players['seekers'][i]['x'] + " New Y: " +  players['seekers'][i]['y']);
                    

                    console.log(players['seekers'][i]['id'] );
                }
            }
            
        }

        if (team == 1)
        {
            players['hider'] = playerdata;
            console.log(players['hider']['id'] );
           // console.log("Update sent from hider" + socket.id + " New x: " + players['hider']['x'] + " New Y: " +  players['hider']['y']);
        }

        if (numPopulated >= players['seekers'].length + 1)
        {
            everyonePopulated = true;
            console.log("Everyone has populated their game");
        }
    });

    socket.on('populated', function()
    {
        numPopulated += 1;
        console.log("Adding one to the populated clients");
    });

//game update

//if (!updateInterval)
{
    updateInterval = setInterval(function(){
        if (ingame)
        {
            if (everyonePopulated)
            {
                


                socket.emit('updateplayersserver', players);

                if (playing)
                {
                    for (var i = 0; i < players['seekers'].length; i++)
                    {
                        if (boxBoxCollision(players['seekers'][i], players['hider']))
                        {
                            //make sure send to everyone on the game
                            var idSend;
                            for (var i = 0; i < players['seekers'].length; i++)
                            {
                                idSend = sio.sockets.connected[players['seekers'][i]['id']];
                                idSend.emit('seekerwin');
                            }

                            if (Object.keys(players['hider']).length > 0)
                            {
                                idSend = sio.sockets.connected[players['hider']['id']];

                                //send to connected hider
                                idSend.emit('seekerwin');
                            }
                            
        
                            
                            resetToDefaults();
                        }
                    }
                }

            }
        }
        
    }, 20);
}
    

//timer update
if (!secondInterval)
{
     secondInterval = setInterval(function(){
        if (everyonePopulated)
        {
            if (counter == 0)
            {
                sendCurrentPlayers('hidercountdown');
            }
            counter += 1;

            if (counter == 10)
            {
                sendCurrentPlayers('seekermove');
                playing = true;
          
            }
            if (counter >= 160)
            {

                sendCurrentPlayers('hiderwin');
        

                resetToDefaults();
            }
        }
        
    }, 1000);
}
   


function sendCurrentPlayers(message)
{
    console.log("Sending data to all current players");
    var idSend;
    for (var i = 0; i < players['seekers'].length; i++)
    {
        idSend = sio.sockets.connected[players['seekers'][i]['id']];
        idSend.emit(message);
    }

    if (Object.keys(players['hider']).length > 0)
    {
        idSend = sio.sockets.connected[players['hider']['id']];

        //send to connected hider
        idSend.emit(message);
    }
}
    

    // socket.on('gobacktomenu', function()
    // {
    //     numBack += 1;

    //     if (numBack >= players['seekers'].length + 1)
    //     {
    //         everyoneBack = true;
    //         socket.emit('gobacktomenu');
    //     }
    // });


    // if (ingame)
    // {
    //     var t=setInterval(everyFrame, 1000/60);
    // }

    // function everyFrame()
    // {

    //      socket.emit('updateplayersserver', players);
    // }
    


    socket.on('tellEveryone', function(msg) 
    {
        sio.emit('heyEveryone', msg, socket.id);
    });

    socket.on('tellNamespace', function(msg, namespaceName)
    {
        sio.of(namespaceName).emit('heyEveryone', msg, socket.id);
    });

    socket.on('tellRoom', function(msg, roomName)
    {
        socket.to(roomName).emit('heyThere', msg, socket.id);
    });
    
});

function resetToDefaults()
{
    players = {'seekers': [], 'hider': {}};

    ingame = false;
    numPopulated = 0;
    everyonePopulated = false;
    end = false;

    everyoneBack = false;
    numBack = 0;

    collide = false;

    counter = 0;

    playing = false;

    canStart = false;

    
}