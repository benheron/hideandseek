class Gametate extends Phaser.State {
    game: Phaser.Game;
    music: Phaser.Sound;
    titleScreenImage: Phaser.Sprite;

    constructor() {
        super();
    }

    create() {
        this.titleScreenImage = this.add.sprite(0, 0, 'titleimage');
        this.titleScreenImage.scale.setTo(this.game.width / this.titleScreenImage.width, this.game.height / this.titleScreenImage.height);


    }
}