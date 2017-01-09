var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var clientSocket = io();
window.onload = function () {
    var game = new HideAndSeek.Game();
};
function equivalent(a, b) {
    if (a == b) {
        return true;
    }
    else {
        return false;
    }
}
var HideAndSeek;
(function (HideAndSeek) {
    var Item = (function (_super) {
        __extends(Item, _super);
        function Item(game, x, y, t) {
            var _this = _super.call(this, game, x, y, 'redford', 0) || this;
            _this.anchor.setTo(0.5, 0);
            game.add.existing(_this);
            return _this;
            //game.physics.enable(this);
        }
        Item.prototype.update = function () {
        };
        return Item;
    }(Phaser.Sprite));
    HideAndSeek.Item = Item;
})(HideAndSeek || (HideAndSeek = {}));
var HideAndSeek;
(function (HideAndSeek) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y, t, id) {
            var _this;
            if (t == 0) {
                _this = _super.call(this, game, x, y, 'redford', 0) || this;
                _this.speed = 135;
                _this.maxSpeed = 250;
            }
            else if (t == 1) {
                _this = _super.call(this, game, x, y, 'green', 1) || this;
                _this.speed = 125;
                _this.maxSpeed = 225;
            }
            _this.anchor.setTo(0.5, 0.5);
            game.add.existing(_this);
            game.physics.enable(_this);
            _this.team = t;
            _this.diving = false;
            //this.speed = 150;
            _this.maxSpeed = 250;
            _this.id = id;
            return _this;
        }
        Player.prototype.update = function () {
            if (!this.diving) {
                if (this.body.velocity.x > this.maxSpeed) {
                    this.body.velocity.x = this.maxSpeed;
                }
                if (this.body.velocity.x < -this.maxSpeed) {
                    this.body.velocity.x = -this.maxSpeed;
                }
                if (this.body.velocity.y > this.maxSpeed) {
                    this.body.velocity.y = this.maxSpeed;
                }
                if (this.body.velocity.y < -this.maxSpeed) {
                    this.body.velocity.y = -this.maxSpeed;
                }
            }
            else {
                //this.body.velocity.multiply(0.9, 0,9);
                if (this.body.velocity.getMagnitude() < 0.01) {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                    this.diving = false;
                }
            }
        };
        Player.prototype.dive = function () {
            this.diving = true;
            //this.body.velocity.x += 800;
        };
        return Player;
    }(Phaser.Sprite));
    HideAndSeek.Player = Player;
})(HideAndSeek || (HideAndSeek = {}));
var HideAndSeek;
(function (HideAndSeek) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            var _this = _super.call(this, 1280, 720, Phaser.AUTO, 'content', null) || this;
            _this.state.add('Boot', HideAndSeek.Boot, false);
            _this.state.add('Preloader', HideAndSeek.Preloader, false);
            _this.state.add('MainMenu', HideAndSeek.MainMenuState, false);
            _this.state.add('Level1', HideAndSeek.Level1, false);
            _this.state.start('Boot');
            return _this;
        }
        return Game;
    }(Phaser.Game));
    HideAndSeek.Game = Game;
})(HideAndSeek || (HideAndSeek = {}));
var HideAndSeek;
(function (HideAndSeek) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            return _super.apply(this, arguments) || this;
        }
        Boot.prototype.preload = function () {
            this.game.load.image('preloadBar', 'assets/loader.png');
        };
        Boot.prototype.create = function () {
            //  Unless you specifically need to support multitouch I would recommend setting this to 1
            this.input.maxPointers = 1;
            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.stage.disableVisibilityChange = true;
            this.game.state.start('Preloader', true, false);
        };
        return Boot;
    }(Phaser.State));
    HideAndSeek.Boot = Boot;
})(HideAndSeek || (HideAndSeek = {}));
var Gametate = (function (_super) {
    __extends(Gametate, _super);
    function Gametate() {
        return _super.call(this) || this;
    }
    Gametate.prototype.create = function () {
        this.titleScreenImage = this.add.sprite(0, 0, 'titleimage');
        this.titleScreenImage.scale.setTo(this.game.width / this.titleScreenImage.width, this.game.height / this.titleScreenImage.height);
    };
    return Gametate;
}(Phaser.State));
var sentPlayersId;
var theHiderCountDown;
var theSeekerMove;
var updatePlayersServer;
var seekerWin;
var hiderWin;
var HideAndSeek;
(function (HideAndSeek) {
    var Level1 = (function (_super) {
        __extends(Level1, _super);
        function Level1() {
            return _super.apply(this, arguments) || this;
        }
        //tmpPlayers: {'seekers': [], 'hider': {}};
        Level1.prototype.create = function () {
            var that = this;
            this.gotData = false;
            this.isPopulated = false;
            this.playersData = { 'seekers': [], 'hider': {} };
            this.players = { 'seekers': [], 'hider': HideAndSeek.Player };
            this.canMove = false;
            console.log("Creating");
            clientSocket.emit('requestplayersid');
            var tmpPlayers = { 'seekers': [], 'hider': {} };
            if (this.team == 1) {
                this.canMove = true;
            }
            this.clientFunctions();
            this.music = this.add.audio('music', 1, false);
            // this.music.play();
            console.log(this.team);
            this.map = this.game.add.tilemap(this.mapToUse);
            this.map.addTilesetImage('ground_1x1');
            this.layer = this.map.createLayer('Tile Layer 1');
            this.layer.resizeWorld();
            this.map.setCollision(1);
            //this.map.setCollisionBetween(1, 12);
            this.velocityModifier = 1;
            this.endGame = false;
            var mins = 2;
            var seconds = 30;
            //timer
            this.globalTimer = this.game.time.create(false);
            this.mainTimeEvent = this.globalTimer.add(Phaser.Timer.MINUTE * mins + Phaser.Timer.SECOND * seconds, this, this);
            this.text = this.game.add.text(this.game.world.centerX, 10, this.formatTime(Math.round((this.mainTimeEvent.delay - this.globalTimer.ms) / 1000)), null);
            this.text.fill = '#FFFFFF';
            this.text.fixedToCamera = true;
            this.text.anchor.setTo(0.5, 0);
            this.distText = this.game.add.text(this.game.world.centerX + 250, 10, "", null);
            this.distText.fill = '#FFFFFF';
            this.distText.fixedToCamera = true;
            this.distText.anchor.setTo(0.5, 0);
            this.tests();
        };
        //taken from online
        Level1.prototype.formatTime = function (num) {
            var minutes = '0' + Math.floor(num / 60);
            var seconds = '0' + (num - minutes * 60);
            return minutes.substr(-2) + ':' + seconds.substr(-2);
        };
        Level1.prototype.distance = function (a, b) {
            var distX = Math.abs(a.x - b.x);
            var distY = Math.abs(a.y - b.y);
            return Math.sqrt((distX * distX) + (distY * distY)).toFixed(2);
        };
        Level1.prototype.update = function () {
            var that = this;
            //console.log("Hit update");
            if (!this.endGame) {
                if (this.gotData) {
                    this.updatePlayers();
                    this.sendData();
                    if (this.team == 0) {
                        this.distText.setText("Distance: " + this.distance(this.myPlayer, this.players['hider']));
                    }
                }
                if (this.globalTimer.running) {
                    this.text.setText(this.formatTime(Math.round((this.mainTimeEvent.delay - this.globalTimer.ms) / 1000)));
                }
            }
        };
        Level1.prototype.populatePlayers = function () {
            console.log("Populating players");
            var xMid = 720;
            var yMid = 400;
            for (var i = 0; i < this.playersData['seekers'].length; i++) {
                var x;
                var y;
                switch (i) {
                    case 0:
                        x = xMid - 32;
                        y = yMid - 32;
                        break;
                    case 1:
                        x = xMid + 32;
                        y = yMid - 32;
                        break;
                    case 2:
                        x = xMid - 32;
                        y = yMid + 32;
                        break;
                    case 3:
                        x = xMid + 32;
                        y = yMid + 32;
                        break;
                }
                var p_1 = new HideAndSeek.Player(this.game, x, y, 0, this.playersData['seekers'][i]['id']);
                console.log("Seeker id: " + this.playersData['seekers'][i]['id']);
                this.players['seekers'].push(p_1);
                console.log("Added seeker");
                if (clientSocket.id == this.playersData['seekers'][i]['id']) {
                    this.myPlayer = p_1;
                    console.log("My player allocated");
                }
            }
            var p = new HideAndSeek.Player(this.game, 720, 400, 1, this.playersData['hider']['id']);
            console.log("Hider id " + this.playersData['hider']['id']);
            this.players['hider'] = p;
            if (clientSocket.id == this.playersData['hider']['id']) {
                this.myPlayer = p;
                console.log("My player allocated. ID : " + this.myPlayer.id);
            }
            console.log("Added hider");
            this.game.camera.follow(this.myPlayer);
            this.isPopulated = true;
            clientSocket.emit('populated');
            for (var i = 0; i < this.players['seekers'].length; i++) {
                console.log("Seekers should exist now: " + this.players['seekers'][i].exist);
            }
            console.log("Hider should exist now: " + this.players['hider'].exist);
        };
        Level1.prototype.updatePlayers = function () {
            console.log("Hit updating players");
            var that = this;
            console.log();
            for (var i = 0; i < this.players['seekers'].length; i++) {
                this.game.physics.arcade.collide(this.players['seekers'][i], this.layer);
            }
            this.game.physics.arcade.collide(this.players['hider'], this.layer);
            console.log(this.players['seekers'].length);
            for (var i = 0; i < this.players['seekers'].length; i++) {
                //casting a ray
                console.log("Hider should be visible to seekers only when in line of sight and within 450 units");
                var ray = new Phaser.Line(this.players['seekers'][i].x, this.players['seekers'][i].y, that.players['hider'].x, that.players['hider'].y);
                var tileHits = that.layer.getRayCastTiles(ray, 4, true, false);
                var distX = Math.abs(this.players['seekers'][i].x - that.players['hider'].x);
                var distY = Math.abs(this.players['seekers'][i].y - that.players['hider'].y);
                var dist = Math.sqrt((distX * distX) + (distY * distY));
                if (that.team == 0) {
                    if (tileHits.length > 0 || dist > 450) {
                        that.players['hider'].alpha = 0;
                    }
                    else {
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
            if (this.myPlayer.body.velocity.getMagnitude() < 0.02) {
                this.myPlayer.body.velocity.x = 0;
                this.myPlayer.body.velocity.y = 0;
            }
            //can move as long as not diving
            if (!this.myPlayer.diving) {
                curDirection.multiply(friction, friction);
                if (!this.endGame) {
                    if (this.canMove) {
                        this.control(movement);
                    }
                }
            }
            movement.normalize();
            movement.multiply(this.myPlayer.speed, this.myPlayer.speed);
            //seeker only controls
            if (this.team == 0) {
                if (this.myPlayer.diving == false) {
                    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                        this.myPlayer.dive();
                        movement.multiply(7, 7);
                    }
                }
            }
            this.myPlayer.body.velocity.x += movement.x;
            this.myPlayer.body.velocity.y += movement.y;
            //console.log("Velocity x: " + this.myPlayer.body.velocity.x);
            //console.log("Velocity y: " + this.myPlayer.body.velocity.y);
            //console.log("Player diving" + this.myPlayer.diving);
        };
        Level1.prototype.control = function (movement) {
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
        };
        Level1.prototype.sendData = function () {
            var that = this;
            clientSocket.emit('playerdata', { 'x': that.myPlayer.x, 'y': that.myPlayer.y, 'id': clientSocket.id }, that.myPlayer.team);
            //console.log("clientSocket.id" + clientSocket.id);
        };
        Level1.prototype.updateFromData = function () {
            console.log("Updating from data");
            for (var i = 0; i < this.players['seekers'].length; i++) {
                if (this.myPlayer.id != this.players['seekers'][i].id) {
                    this.players['seekers'][i].x = this.playersData['seekers'][i]['x'];
                    this.players['seekers'][i].y = this.playersData['seekers'][i]['y'];
                }
                else {
                }
            }
            if (this.myPlayer.id != this.players['hider'].id) {
                this.players['hider'].x = this.playersData['hider']['x'];
                this.players['hider'].y = this.playersData['hider']['y'];
            }
            else {
            }
        };
        Level1.prototype.receiveData = function () {
        };
        Level1.prototype.hiderCountDown = function () {
            var that = this;
            if (this.team == 0) {
            }
            else if (this.team == 1) {
                this.hideImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'hide!');
                this.hideImg.anchor.setTo(0.5, 0.5);
            }
        };
        Level1.prototype.seekerMove = function () {
            this.globalTimer.start();
            var that = this;
            if (this.team == 0) {
                this.findHiderImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'findthehider');
                this.findHiderImg.anchor.setTo(0.5, 0.5);
            }
            else if (this.team == 1) {
                this.hideImg.destroy();
                this.dontGetCaughtImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'dontgetcaught');
                this.dontGetCaughtImg.anchor.setTo(0.5, 0.5);
            }
            setTimeout(function () {
                if (that.team == 0) {
                    that.findHiderImg.destroy();
                }
                else if (that.team == 1) {
                    that.dontGetCaughtImg.destroy();
                }
            }, 2000);
        };
        Level1.prototype.onHiderWin = function () {
            this.hiderWinsImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'hiderwins');
            this.hiderWinsImg.anchor.setTo(0.5, 0.5);
            this.onEnd();
        };
        Level1.prototype.onSeekersWin = function () {
            this.seekersWinImg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'seekerswin');
            this.seekersWinImg.anchor.setTo(0.5, 0.5);
            this.onEnd();
        };
        Level1.prototype.onEnd = function () {
            this.globalTimer.pause();
            this.endGame = true;
            this.myPlayer.body.velocity = 0;
            var that = this;
            setTimeout(function () {
                if (that.seekersWon) {
                    that.seekersWinImg.destroy();
                }
                else if (that.hidersWon) {
                    that.hiderWinsImg.destroy();
                }
                that.backToMenu();
            }, 4000);
        };
        Level1.prototype.backToMenu = function () {
            console.log("going back to menu");
            for (var i = this.players['seekers'].length; i > -1; i--) {
                delete this.players['seekers'][i];
            }
            delete this.players['hider'];
            //seems to be a problem with socket.io events when going back to mainmenu, so force a reload instead
            //location.reload();
            //this.game.state.restart()
            //this.game.state.add('MainMenu', MainMenuState, false);
            //this.game.state.remove('Level1');
            this.game.state.start('MainMenu', true);
        };
        Level1.prototype.clientFunctions = function () {
            var that = this;
            if (!sentPlayersId) {
                sentPlayersId = clientSocket.on('sentplayersid', function (players) {
                    //tmpPlayers = players;
                    that.playersData = players;
                    that.populatePlayers();
                    console.log("Getting players");
                    that.gotData = true;
                });
            }
            if (!theHiderCountDown) {
                theHiderCountDown = clientSocket.on('hidercountdown', function () {
                    that.hiderCountDown();
                });
            }
            if (!theSeekerMove) {
                theSeekerMove = clientSocket.on('seekermove', function () {
                    if (that.team == 0) {
                        that.canMove = true;
                    }
                    that.seekerMove();
                });
            }
            if (!updatePlayersServer) {
                updatePlayersServer = clientSocket.on('updateplayersserver', function (players) {
                    that.playersData = players;
                    that.updateFromData();
                });
            }
            if (!seekerWin) {
                seekerWin = clientSocket.on('seekerwin', function () {
                    that.seekersWon = true;
                    that.onSeekersWin();
                });
            }
            if (!hiderWin) {
                hiderWin = clientSocket.on('hiderwin', function () {
                    that.hidersWon = true;
                    that.onHiderWin();
                });
            }
        };
        Level1.prototype.clearDisplayList = function () {
        };
        Level1.prototype.tests = function () {
            console.log("There should be no seekers right now:" + equivalent(this.players['seekers'].length, 0));
            console.log("Timer text should exist: " + this.text.exists);
            var tmp = (this.mainTimeEvent.delay - this.globalTimer.ms) / 1000;
            console.log("Timer should read 2:30 until the game starts. Then should count down." + equivalent("2:30", this.formatTime(Math.round(tmp))));
        };
        return Level1;
    }(Phaser.State));
    HideAndSeek.Level1 = Level1;
})(HideAndSeek || (HideAndSeek = {}));
var joinedMenu;
var addSeeker;
var addHider;
var removeSeeker;
var removeHider;
var startGame;
var HideAndSeek;
(function (HideAndSeek) {
    var MainMenuState = (function (_super) {
        __extends(MainMenuState, _super);
        function MainMenuState() {
            return _super.apply(this, arguments) || this;
        }
        MainMenuState.prototype.create = function () {
            var that = this;
            //add background
            this.background = this.add.sprite(0, 0, 'titlepage');
            // this.background.alpha = 0;
            //intro sequence
            // this.add.tween(this.background).to({ alpha: 1 }, 2000, Phaser.Easing.Bounce.InOut, true);
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
            this.tests();
        };
        MainMenuState.prototype.update = function () {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                clientSocket.emit('idcheck', "Hello, this is: ");
                this.checkIfHost();
            }
            this.seekerPlayers.frame = this.numSeek;
            this.hiderPlayers.frame = this.numHid;
        };
        MainMenuState.prototype.checkIfHost = function () {
            clientSocket.emit('checkhost');
            clientSocket.on('sethost', function (id) {
                console.log(clientSocket.id);
                if (id = clientSocket.id) {
                    this.isHost = true;
                }
                // if (this.isHost)
                // {
                //     this.startBtn = this.game.add.button(this.game.world.centerX - 95, 200, 'startBtn', this.actionOnClick, this, 2, 1, 0);
                // }
            });
        };
        MainMenuState.prototype.fadeOut = function () {
            //    this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
            //  var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);
            //  tween.onComplete.add(this.startGame, this);
        };
        //when clicking on seeker
        MainMenuState.prototype.choseSeeker = function () {
            this.checkIfHost();
            //this.seekerMembers.push(0);
            //this.joinedTeam = true;
            //can't have more than 4 players 
            if (this.numSeek < 4) {
                //if the player has already joined a team
                if (this.joinedTeam) {
                    //if this team is the other one, allow a swap
                    if (this.teamJoined == 1) {
                        this.teamJoined = 0;
                        clientSocket.emit('removeHider');
                        clientSocket.emit('addSeeker');
                        this.joinedTeam = true;
                        console.log('Joined team seeker');
                    }
                }
                else 
                //if the team joined is not the current one
                if (this.teamJoined != 0) {
                    clientSocket.emit('addSeeker');
                    this.teamJoined = 0;
                    this.joinedTeam = true;
                    console.log('Joined team seeker');
                }
            }
            console.log("Your current team: " + this.teamJoined);
        };
        //when clicking on hider
        MainMenuState.prototype.choseHider = function () {
            this.checkIfHost();
            //can't have more than 1 player
            if (this.numHid < 1) {
                //if the player has already joined a team
                if (this.joinedTeam) {
                    //if this team is the other one, allow a swap
                    if (this.teamJoined == 0) {
                        this.teamJoined = 1;
                        clientSocket.emit('removeSeeker');
                        clientSocket.emit('addHider');
                        this.joinedTeam = true;
                        console.log('Joined team hider');
                    }
                }
                else 
                //if the team joined is not the current one
                if (this.teamJoined != 1) {
                    clientSocket.emit('addHider');
                    this.teamJoined = 1;
                    this.joinedTeam = true;
                    console.log('Joined team hider');
                }
            }
            console.log("Your current team: " + this.teamJoined);
        };
        MainMenuState.prototype.sendStart = function () {
            clientSocket.emit('startgame');
        };
        MainMenuState.prototype.startGame = function () {
            if (this.teamJoined == 0 || this.teamJoined == 1) {
                //this.game.state.restart();
                //this.game.state.remove('MainMenu');
                //this.game.state.add('Level1', Level1, false);
                this.game.state.start('Level1', true, false);
                this.game.state.states['Level1'].team = this.teamJoined;
                this.game.state.states['Level1'].mapToUse = this.map;
                this.clearDisplayList();
            }
        };
        MainMenuState.prototype.clientFunctions = function () {
            var that = this;
            if (!joinedMenu) {
                joinedMenu = clientSocket.on('joinedmenu', function (ns, nh) {
                    that.numSeek = ns;
                    that.numHid = nh;
                });
            }
            if (!addSeeker) {
                addSeeker = clientSocket.on('addSeeker', function (id) {
                    that.numSeek = id['seekers'].length;
                    console.log('Number of seekers: ' + that.numSeek);
                });
            }
            if (!addHider) {
                addHider = clientSocket.on('addHider', function (id) {
                    that.numHid = Object.keys(id['hider']).length;
                    console.log('Number of hiders: ' + that.numHid);
                });
            }
            if (!removeSeeker) {
                removeSeeker = clientSocket.on('removeSeeker', function (id) {
                    that.numSeek = id['seekers'].length;
                    console.log('Number of seekers: ' + that.numSeek);
                });
            }
            if (!removeHider) {
                removeHider = clientSocket.on('removeHider', function (id) {
                    that.numHid = Object.keys(id['hider']).length;
                    console.log('Number of hiders: ' + that.numHid);
                });
            }
            if (!startGame) {
                startGame = clientSocket.on('startgame', function (team, map) {
                    that.teamJoined = team;
                    that.map = map;
                    that.startGame();
                });
            }
        };
        MainMenuState.prototype.clearDisplayList = function () {
            this.background.destroy();
            this.startBtn.destroy();
            this.hiderBtn.destroy();
            this.seekerBtn.destroy();
            this.seekerPlayers.destroy();
            this.hiderPlayers.destroy();
            console.log("Seeker button should not exist. Does seeker button exist? " + this.seekerBtn.exists);
            console.log("Hider button should not exist. Does hider button exist? " + this.hiderBtn.exists);
            console.log("Start button should notexist. Does start button exist? " + this.startBtn.exists);
            console.log("Background should  notexist. Does background exist? " + this.background.exists);
            console.log("Should show the number of seekers on the server. " + equivalent(this.numSeek, this.seekerPlayers.frame));
            console.log("Should show the number of hiders on the server. " + equivalent(this.numHid, this.hiderPlayers.frame));
        };
        MainMenuState.prototype.tests = function () {
            console.log("Main Menu Tests");
            console.log("Seeker button should exist. Does seeker button exist? " + this.seekerBtn.exists);
            console.log("Hider button should exist. Does hider button exist? " + this.hiderBtn.exists);
            console.log("Start button should exist. Does start button exist? " + this.startBtn.exists);
            console.log("Background should exist. Does background exist? " + this.background.exists);
            console.log("");
            console.log("Should show the number of seekers on the server. " + equivalent(this.numSeek, this.seekerPlayers.frame));
            console.log("Should show the number of hiders on the server. " + equivalent(this.numHid, this.hiderPlayers.frame));
            console.log("All buttons should be able to be pressed. Clicking on one moves you to that team as long as there is an available space.");
            console.log("Pressing start game will not work until there are at least one seeker and one hider, never before");
        };
        return MainMenuState;
    }(Phaser.State));
    HideAndSeek.MainMenuState = MainMenuState;
})(HideAndSeek || (HideAndSeek = {}));
var HideAndSeek;
(function (HideAndSeek) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            return _super.apply(this, arguments) || this;
        }
        Preloader.prototype.preload = function () {
            //  Set-up our preloader sprite
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);
            //  Load our actual games assets
            this.load.image('titlepage', 'assets/img/TitleScreenImage.png');
            this.load.image('logo', 'assets/img/logo.png');
            this.load.audio('music', 'assets/audio/title.mp3', true);
            this.load.image('redford', 'assets/img/redford.png');
            this.load.image('green', 'assets/img/green.png');
            this.load.image('level1', 'assets/img/level1.png');
            this.load.image('ground_1x1', 'assets/img/ground_1x1.png');
            this.load.image('tile', 'assets/img/solidtile.png');
            this.load.image('seekerswin', 'assets/img/seekerswin.png');
            this.load.image('hiderwins', 'assets/img/hiderwins.png');
            this.load.image('hide!', 'assets/img/hide.png');
            this.load.image('dontgetcaught', 'assets/img/dontgetcaught.png');
            this.load.image('findthehider', 'assets/img/findthehider.png');
            this.load.spritesheet('playersSeeker', 'assets/img/playersSeeker.png', 80, 20, 5);
            this.load.spritesheet('playersHider', 'assets/img/playersHider.png', 80, 20, 2);
            this.load.spritesheet('startBtn', 'assets/img/startbutton.png', 190, 65);
            this.load.spritesheet('seekerbtn', 'assets/img/seekerbtn.png', 190, 65);
            this.load.spritesheet('hiderbtn', 'assets/img/hiderbtn.png', 190, 65);
            //  this.game.load.tilemap('map2', "maps/collision_test.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('map1', "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('map2', "maps/map2.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('map5', "maps/map5.json", null, Phaser.Tilemap.TILED_JSON);
        };
        Preloader.prototype.create = function () {
            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);
        };
        Preloader.prototype.startMainMenu = function () {
            this.game.state.start('MainMenu', true, false);
        };
        return Preloader;
    }(Phaser.State));
    HideAndSeek.Preloader = Preloader;
})(HideAndSeek || (HideAndSeek = {}));
var TitleScreenState = (function (_super) {
    __extends(TitleScreenState, _super);
    function TitleScreenState() {
        return _super.call(this) || this;
    }
    TitleScreenState.prototype.create = function () {
        this.titleScreenImage = this.add.sprite(0, 0, 'titleimage');
        this.titleScreenImage.scale.setTo(this.game.width / this.titleScreenImage.width, this.game.height / this.titleScreenImage.height);
    };
    TitleScreenState.prototype.update = function () {
    };
    return TitleScreenState;
}(Phaser.State));
///// <reference path="../../typings/main.d.ts" />
describe("MainMenuState", function () {
    describe("The main menu state", function () {
        it("Holds the main menu state information", function () {
            // Arrange
            var mms = new HideAndSeek.MainMenuState();
            // Act
            var result = mms.create();
            // Assert
            //expect(result).
        });
    });
});
//# sourceMappingURL=game.js.map