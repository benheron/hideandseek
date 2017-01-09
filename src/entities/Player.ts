module HideAndSeek {

    export class Player extends Phaser.Sprite {


        moving: boolean;
        team: number;
        speed: number;
        diving: boolean;
        maxSpeed: number;
        id: string;

        constructor(game: Phaser.Game, x: number, y: number, t: number, id: string) {

            if (t == 0)
            {
                super(game, x, y, 'redford', 0);
                this.speed = 135;
            } else if (t == 1) {
                super(game, x, y, 'green', 1);
                this.speed = 125;
            }

            this.anchor.setTo(0.5, 0);

            game.add.existing(this);
            game.physics.enable(this);

            this.team = t;

            this.diving = false;

            //this.speed = 150;
            this.maxSpeed = 250;

            this.id = id;
        }

        update() {
            if (!this.diving)
            {
                if (this.body.velocity.x > this.maxSpeed)
                {
                    this.body.velocity.x = this.maxSpeed;
                }

                if (this.body.velocity.x < -this.maxSpeed)
                {
                    this.body.velocity.x = -this.maxSpeed;
                }

                if (this.body.velocity.y > this.maxSpeed)
                {
                    this.body.velocity.y = this.maxSpeed;
                }

                if (this.body.velocity.y < -this.maxSpeed)
                {
                    this.body.velocity.y = -this.maxSpeed;
                }
            } else {
              //this.body.velocity.multiply(0.9, 0,9);
              if (this.body.velocity.getMagnitude() < 0.01)
                {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                    this.diving = false;
                }
                
            }
              


          
        }

        dive()
        {
            this.diving = true;
            //this.body.velocity.x += 800;
        }

    }

}