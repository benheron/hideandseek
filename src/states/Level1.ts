﻿var sentPlayersId;
var theHiderCountDown;
var theSeekerMove;
var updatePlayersServer;
var seekerWin;
var hiderWin;

module HideAndSeek {

    export class Level1 extends Phaser.State {

        background: Phaser.Sprite;
        music: Phaser.Sound;
        myPlayer: HideAndSeek.Player;
        enemy: HideAndSeek.Player;
        findHiderImg: Phaser.Sprite;
        dontGetCaughtImg: Phaser.Sprite;
        hideImg: Phaser.Sprite;

        map: Phaser.Tilemap;
        layer: Phaser.TilemapLayer;


        team: number;
        velocityModifier: number;

        endGame: Boolean;

        seekersWinImg: Phaser.Sprite;
        hiderWinsImg: Phaser.Sprite;

        playersData: any;
        players: any;

        seekers: [{}];
        hider: {};

        gotData: boolean;
        isPopulated: boolean;

        globalTimer: any;
        mainTimeEvent: any;
        text: any;

        canMove: Boolean;

        seekersWon: boolean;
        hidersWon: boolean;

        
        

        //tmpPlayers: {'seekers': [], 'hider': {}};

        


        create() {
            var that = this;
            this.gotData = false;
            this.isPopulated = false;

            this.playersData = {'seekers': [], 'hider': {}};
            this.players = {'seekers': [], 'hider': HideAndSeek.Player};

            this.canMove = false;
            

            console.log("Creating");

            clientSocket.emit('requestplayersid');

    

            let tmpPlayers = {'seekers': [], 'hider': {}};
            
            

            if(this.team == 1)
            {
                this.canMove = true;
            }

            this.clientFunctions();

            this.music = this.add.audio('music', 1, false);
            // this.music.play();

            console.log(this.team);

            this.map = this.game.add.tilemap('map1');
            this.map.addTilesetImage('ground_1x1');
           
            

            this.layer = this.map.createLayer('Tile Layer 1');
            this.layer.resizeWorld();

            this.map.setCollisionBetween(1, 12);

           
            

            this.velocityModifier = 1;
            this.endGame = false;


            var mins = 2;
            var seconds = 30;

            //timer
            this.globalTimer = this.game.time.create(false);
            this.mainTimeEvent = this.globalTimer.add(Phaser.Timer.MINUTE * mins + Phaser.Timer.SECOND * seconds, this, this);

           

            this.text = this.game.add.text(this.game.world.centerX, 10, this.formatTime(Math.round((this.mainTimeEvent.delay -  this.globalTimer.ms) / 1000)), null);
            this.text.fill ='#FFFFFF';
            this.text.fixedToCamera = true;
            this.text.anchor.setTo(0.5,0);

        }

        //taken from online
        formatTime(num: any)
        {
            var minutes: any = '0' + Math.floor(num/60);
            var seconds = '0' + (num - minutes * 60);
            return minutes.substr(-2) + ':' + seconds.substr(-2);
        }

        update()
        {
            var that = this;
            //console.log("Hit update");
            if (!this.endGame)
            {
                if (this.gotData)
                {
                    if(this.canMove)
                    {
                        this.updatePlayers();
                    }
                        
                    this.sendData();
                }
                
                if(this.globalTimer.running)
                {
                    this.text.setText(this.formatTime(Math.round((this.mainTimeEvent.delay -  this.globalTimer.ms) / 1000)));
                }
            }
            

            

            

            
        
           
            
        }

        populatePlayers()
        {
           console.log("Populating players");
            for (var i = 0; i < this.playersData['seekers'].length; i++)
            {
                var x;
                var y;
                switch(i) 
                {
                    case 0:
                        x = 800;
                        y = 450;
                        break;
                    case 1:
                        x = 900;
                        y = 450;    
                        break;
                    case 2:
                        x = 700;
                        y = 450;
                        break;
                    case 3:
                        x = 600;
                        y = 450;
                        break;
                }

                let p = new Player(this.game, x, y, 0, this.playersData['seekers'][i]['id']);
                console.log("Seeker id: " + this.playersData['seekers'][i]['id']);
                this.players['seekers'].push(p);

                console.log("Added seeker");

                if (clientSocket.id == this.playersData['seekers'][i]['id'])
                {
                    this.myPlayer = p;
                    console.log("My player allocated");
                }

                
            }

            let p = new Player(this.game, 90, 100, 1, this.playersData['hider']['id']);
            console.log("Hider id " + this.playersData['hider']['id']);
            this.players['hider'] = p;

            if (clientSocket.id == this.playersData['hider']['id'])
            {
                this.myPlayer = p;
                console.log("My player allocated. ID : " + this.myPlayer.id);
            }

            console.log("Added hider");

            this.game.camera.follow(this.myPlayer);

            this.isPopulated = true;
            clientSocket.emit('populated');
        }

        updatePlayers()
        {
            //console.log("Hit updating players");
            var that = this;

            for (var i = 0; i < this.players['seekers'].length; i++)
            {
                this.game.physics.arcade.collide(this.players['seekers'][i], this.layer)
            }
            this.game.physics.arcade.collide(this.players['hider'], this.layer);


            console.log(this.players['seekers'].length);
            for (var i = 0; i < this.players['seekers'].length; i++)
            {
                var ray = new Phaser.Line(this.players['seekers'][i].x, this.players['seekers'][i].y, that.players['hider'].x, that.players['hider'].y);
                var tileHits = that.layer.getRayCastTiles(ray, 4, true, false);

                var distX = Math.abs(this.players['seekers'][i].x - that.players['hider'].x);
                var distY = Math.abs(this.players['seekers'][i].y - that.players['hider'].y);

                var dist = Math.sqrt((distX*distX) + (distY * distY));

                if (that.team == 0)
                {
                    if (tileHits.length > 0 || dist > 450)
                    {
                        that.players['hider'].alpha = 0;
                    } else {
                        that.players['hider'].alpha = 100;
                        break;
                    }
                }
                
            }

            
            var movement = new Phaser.Point();

            var curDirection = new Phaser.Point();
            curDirection.x = this.myPlayer.body.velocity.x;
            curDirection.y = this.myPlayer.body.velocity.y;

            var friction = 0.7;
            


            this.myPlayer.body.velocity.multiply(friction, friction);

            //this.enemy.body.velocity.multiply(friction, friction);

            if (this.myPlayer.body.velocity.getMagnitude() < 0.02)
            {
                this.myPlayer.body.velocity.x = 0;
                this.myPlayer.body.velocity.y = 0;
            }

            

            //can move as long as not diving
            if (!this.myPlayer.diving)
            {
                curDirection.multiply(friction, friction);
                if (!this.endGame)
                {
                    this.control(movement);
                }
            }
            

            movement.normalize();
            movement.multiply(this.myPlayer.speed, this.myPlayer.speed);

           

           

            //seeker only controls
            if (this.team == 0)
            {
                if (this.myPlayer.diving == false)
                {
                    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
                    {
                       
                        this.myPlayer.dive();
                        movement.multiply(7,7);
                    }
                }
            }
           

            
            this.myPlayer.body.velocity.x += movement.x;
            this.myPlayer.body.velocity.y += movement.y;

            

            //console.log("Velocity x: " + this.myPlayer.body.velocity.x);
            //console.log("Velocity y: " + this.myPlayer.body.velocity.y);

            //console.log("Player diving" + this.myPlayer.diving);
        }

        control(movement: Phaser.Point)
        {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                movement.x = -1;
                this.myPlayer.moving = true;
              
            }


            if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                movement.x = 1;
                this.myPlayer.moving = true;
         

            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                movement.y = -1;
                this.myPlayer.moving = true;
                

            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                movement.y = 1;
                this.myPlayer.moving = true;
               

            }

              
        }

        sendData()
        {
           var that = this;

           clientSocket.emit('playerdata', {'x' : that.myPlayer.x, 'y' : that.myPlayer.y, 'id': clientSocket.id}, that.myPlayer.team);
           //console.log("clientSocket.id" + clientSocket.id);
        }

        updateFromData()
        {
            console.log("Updating from data")
            for (var i = 0; i < this.players['seekers'].length; i++)
            {
                if (this.myPlayer.id != this.players['seekers'][i].id)
                {
                    this.players['seekers'][i].x = this.playersData['seekers'][i]['x'];
                    this.players['seekers'][i].y = this.playersData['seekers'][i]['y'];
                } else {
                    //console.log("not me");
                   // console.log("Compared " + this.myPlayer.id + " with " + this.players['seekers'][i].id);
                }
               
            }

            if (this.myPlayer.id != this.players['hider'].id)
            {
                this.players['hider'].x = this.playersData['hider']['x'];
                this.players['hider'].y = this.playersData['hider']['y'];
            } else {
                //console.log("not me");
                //console.log("Compared " + this.myPlayer.id + " with " + this.players['hider'].id);
            }
        }

        receiveData()
        {

        }

        hiderCountDown()
        {
            var that = this;
            if (this.team == 0)
            {

            } else if (this.team == 1)
            {
                this.hideImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'hide!');
                this.hideImg.anchor.setTo(0.5,0.5);
            }
           
        }

        seekerMove()
        {
            this.globalTimer.start();
            var that = this;
            if (this.team == 0)
            {
                this.findHiderImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'findthehider');
                this.findHiderImg.anchor.setTo(0.5,0.5);
            } else if (this.team == 1)
            {
                this.hideImg.destroy();
                this.dontGetCaughtImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'dontgetcaught');
                this.dontGetCaughtImg.anchor.setTo(0.5,0.5);
            }
            setTimeout(function()
            {
                if (that.team == 0)
                {
                    that.findHiderImg.destroy();
                } else if (that.team == 1)
                {
                    that.dontGetCaughtImg.destroy();
                }
            }, 2000);
        }

        onHiderWin()
        {
            this.hiderWinsImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'hiderwins');
            this.hiderWinsImg.anchor.setTo(0.5,0.5);


            this.onEnd();
        }

        onSeekersWin()
        {
            this.seekersWinImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'seekerswin');
            this.seekersWinImg.anchor.setTo(0.5,0.5);


            this.onEnd();
        }

        onEnd()
        {
            this.globalTimer.pause();
            this.endGame = true;

            var that = this;
            
            setTimeout(function()
            {
                if (that.seekersWon)
                {
                    that.seekersWinImg.destroy();
                } else if (that.hidersWon)
                {
                    that.hiderWinsImg.destroy();
                }
                that.backToMenu();
            }, 4000);
        }

        backToMenu()
        {
            console.log("going back to menu");
            for (var i = this.players['seekers'].length; i > -1; i--)
            {
                delete this.players['seekers'][i];
            }
            delete this.players['hider'];



            //seems to be a problem with socket.io events when going back to mainmenu, so force a reload instead
            //location.reload();
            
            //this.game.state.restart()
            //this.game.state.add('MainMenu', MainMenuState, false);
            //this.game.state.remove('Level1');
            this.game.state.start('MainMenu', true);
        }


        clientFunctions()
        {
            var that = this;
            if (!sentPlayersId)
            {
                sentPlayersId = clientSocket.on('sentplayersid', function(players)
                {
                    //tmpPlayers = players;
                    that.playersData = players;
                    that.populatePlayers();


                    console.log("Getting players");

                    that.gotData = true;
                    
                });
            }

            if (!theHiderCountDown)
            {
                theHiderCountDown = clientSocket.on('hidercountdown', function()
                {
                    that.hiderCountDown();
                });
            }

            if (!theSeekerMove)
            {
                theSeekerMove = clientSocket.on('seekermove', function()
                {
                    if (that.team == 0)
                    {
                        that.canMove = true;
                    }

                    that.seekerMove();
                });
            }


            
            if (!updatePlayersServer)
            {
                updatePlayersServer = clientSocket.on('updateplayersserver', function(players)
                {
                    that.playersData = players;

                    that.updateFromData();
                });
            }

            if (!seekerWin)
            {
                seekerWin = clientSocket.on('seekerwin', function()
                {
                    that.seekersWon = true;
                    that.onSeekersWin();
                });
            }

            if (!hiderWin)
            {
                hiderWin =  clientSocket.on('hiderwin', function()
                {
                    that.hidersWon = true;
                    that.onHiderWin();
                });
            }
        }

        clearDisplayList()
        {
            

        }
    }

}

