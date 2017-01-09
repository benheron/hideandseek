module HideAndSeek {

    export class Preloader extends Phaser.State {

        preloadBar: Phaser.Sprite;

        preload() {
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
            this.load.image('seekerswin', 'assets/img/seekerswin.png');
            this.load.image('hiderwins', 'assets/img/hiderwins.png');
            this.load.image('hide!', 'assets/img/hide.png');
            this.load.image('dontgetcaught', 'assets/img/dontgetcaught.png');
            this.load.image('findthehider', 'assets/img/findthehider.png')

            this.load.spritesheet('playersSeeker', 'assets/img/playersSeeker.png', 80, 20, 5);
            this.load.spritesheet('playersHider', 'assets/img/playersHider.png', 80, 20, 2);
            this.load.spritesheet('startBtn', 'assets/img/startbutton.png', 190, 65);
            this.load.spritesheet('seekerbtn', 'assets/img/seekerbtn.png', 190, 65);
            this.load.spritesheet('hiderbtn', 'assets/img/hiderbtn.png', 190, 65);


          //  this.game.load.tilemap('map2', "maps/collision_test.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('map1', "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);

            this.game.load.tilemap('map1', "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('map1', "maps/map1.json", null, Phaser.Tilemap.TILED_JSON);


        }

        create() {

            var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(this.startMainMenu, this);

        }

        startMainMenu() {

            this.game.state.start('MainMenu', true, false);

        }

    }

}