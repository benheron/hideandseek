var joinedMenu;
var addSeeker;
var addHider;
var removeSeeker;
var removeHider;
var startGame;

module HideAndSeek {

    export class MainMenuState extends Phaser.State {

        background: Phaser.Sprite;
        logo: Phaser.Sprite;
        startBtn: Phaser.Button;
        hiderBtn: Phaser.Button;
        seekerBtn: Phaser.Button;

        seekerPlayers: Phaser.Sprite;
        hiderPlayers: Phaser.Sprite;

        numSeek: number;
        numHid: number;

        isHost: Boolean;

        toStart: Boolean;

       // seekerMembers: Array<number>;
       // hiderMembers: Array<number>;

    
        playerID: any;

        joinedTeam:boolean;
        teamJoined:number; //0 is seeker, 1 is hider


        create() {
            var that = this;


            //add background
            this.background = this.add.sprite(0, 0, 'titlepage');
            this.background.alpha = 0;

          
            //intro sequence
            this.add.tween(this.background).to({ alpha: 1 }, 2000, Phaser.Easing.Bounce.InOut, true);
            // this.add.tween(this.logo).to({ y: 220 }, 2000, Phaser.Easing.Elastic.Out, true, 2000);

            this.input.onDown.addOnce(this.fadeOut, this);

            //add button start 
            this.startBtn = this.game.add.button(this.game.world.centerX - 95, 200, 'startBtn', this.sendStart, this, 2, 1, 0);

            this.seekerBtn = this.game.add.button(this.game.world.centerX - 195, 450, 'seekerbtn', this.choseSeeker, this, 2, 1, 0);
            this.hiderBtn = this.game.add.button(this.game.world.centerX + 5, 450, 'hiderbtn', this.choseHider, this, 2, 1, 0);
            

            this.seekerPlayers = this.add.sprite(this.game.world.centerX - 195, 520, 'playersSeeker');
            this.hiderPlayers = this.add.sprite(this.game.world.centerX + 5, 520, 'playersHider');

            this.numSeek = 0;
            this.numHid = 0;

            this.seekerPlayers.frame = 0;
            this.hiderPlayers.frame = 0;

            clientSocket.emit('joinedmenu');

            

            this.clientFunctions();

        }

        update()
        {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
            {
                clientSocket.emit('idcheck', "Hello, this is: ");
                this.checkIfHost();
            }

            // if (this.numHid > 0 && this.numSeek > 0)
            // {
            //     if (this.isHost)
            //     {
            //         this.startBtn = this.game.add.button(this.game.world.centerX - 95, 200, 'startBtn', this.actionOnClick, this, 2, 1, 0);
            //     }
            // }

            

            this.seekerPlayers.frame = this.numSeek;
            this.hiderPlayers.frame = this.numHid;

            
        }

        checkIfHost()
        {
            clientSocket.emit('checkhost');
            clientSocket.on('sethost', function(id)
            {
                console.log(clientSocket.id);
                if (id = clientSocket.id)
                {
                   
                    this.isHost = true;
                }
                // if (this.isHost)
                // {
                //     this.startBtn = this.game.add.button(this.game.world.centerX - 95, 200, 'startBtn', this.actionOnClick, this, 2, 1, 0);
                // }
            });

            
        }



        fadeOut() {

        //    this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
          //  var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);

          //  tween.onComplete.add(this.startGame, this);

        }

        //when clicking on seeker
        choseSeeker()
        {

            this.checkIfHost();
            //this.seekerMembers.push(0);
            //this.joinedTeam = true;

            //can't have more than 4 players 
            if (this.numSeek < 4)
            {
                //if the player has already joined a team
                if (this.joinedTeam)
                {
                    //if this team is the other one, allow a swap
                    if (this.teamJoined == 1)
                    {
                        this.teamJoined = 0;
                        clientSocket.emit('removeHider');
                        clientSocket.emit('addSeeker');
                        this.joinedTeam = true;

                        console.log('Joined team seeker');
                    }
                } else

                //if the team joined is not the current one
                if (this.teamJoined != 0)
                {
                    clientSocket.emit('addSeeker');
                    this.teamJoined = 0;
                    this.joinedTeam = true;

                    console.log('Joined team seeker');
                }
               
                
            }
            console.log(this.teamJoined);
        }

        //when clicking on hider
        choseHider()
        {
            this.checkIfHost();

            //can't have more than 1 player
            if (this.numHid < 1)
            {
                //if the player has already joined a team
                if (this.joinedTeam)
                {
                    //if this team is the other one, allow a swap
                    if (this.teamJoined == 0)
                    {
                        this.teamJoined = 1;
                        clientSocket.emit('removeSeeker');
                        clientSocket.emit('addHider');
                        this.joinedTeam = true;

                        console.log('Joined team hider');
                    }
                } else
                
                //if the team joined is not the current one
                if (this.teamJoined != 1)
                {
                    clientSocket.emit('addHider');
                    this.teamJoined = 1;
                    this.joinedTeam = true;

                    console.log('Joined team hider');
                }
            }
            console.log(this.teamJoined);
            
        }

        sendStart()
        {
            clientSocket.emit('startgame');
        }

        actionOnClick()
        {
            this.startGame();
        }

        startGame() 
        {
            if (this.teamJoined == 0 || this.teamJoined == 1)
            {
                //this.game.state.restart();
                //this.game.state.remove('MainMenu');
               // this.game.state.add('Level1', Level1, false);
                this.game.state.start('Level1', true, false);
                this.game.state.states['Level1'].team = this.teamJoined;

                

                this.clearDisplayList();
            }
            
 
        }

        clientFunctions()
        {
            var that = this;
            if (!joinedMenu)
            {
                joinedMenu = clientSocket.on('joinedmenu', function(ns, nh)
                {
                    that.numSeek = ns;
                    that.numHid = nh;
                });
            }
            
            if (!addSeeker)
            {
                addSeeker = clientSocket.on('addSeeker',  function(id)
                {
                    that.numSeek = id['seekers'].length;
                        console.log('Number of seekers: ' + that.numSeek);
                });
            }
            
            if (!addHider)
            {
                addHider = clientSocket.on('addHider', function(id)
                {
                    that.numHid = Object.keys(id['hider']).length;
                    console.log('Number of hiders: ' + that.numHid);
                });
            }

            if (!removeSeeker)
            {
                removeSeeker = clientSocket.on('removeSeeker',  function(id)
                {
                    that.numSeek = id['seekers'].length;
                    console.log('Number of seekers: ' + that.numSeek);
                }); 
            }
            
            if (!removeHider)
            {
                removeHider = clientSocket.on('removeHider', function(id)
                {
                    that.numHid = Object.keys(id['hider']).length;
                    console.log('Number of hiders: ' + that.numHid);
                });
            }

            if (!startGame)
            {
                startGame = clientSocket.on('startgame', function(team)
                {
                    that.teamJoined = team;
                    that.startGame();
                });
            }

        }

        clearDisplayList()
        {
            this.background.destroy();
            this.logo.destroy();

            this.startBtn.destroy();
            this.hiderBtn.destroy();
            this.seekerBtn.destroy();


            this.seekerPlayers.destroy();
            this.hiderPlayers.destroy();

        }

    }

}