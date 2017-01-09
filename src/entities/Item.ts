module HideAndSeek {

    export class Item extends Phaser.Sprite {


        

        constructor(game: Phaser.Game, x: number, y: number, t: number) {
            super(game, x, y, 'redford', 0);
            

            this.anchor.setTo(0.5, 0);

            game.add.existing(this);
            //game.physics.enable(this);

        }

        update() {
            
               


          
        }

        

    }

}