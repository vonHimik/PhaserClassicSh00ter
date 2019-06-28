  export class Res extends Phaser.Scene 
  {

      constructor(){
          super("Res");
      }

      preload() {
          console.log("Res.preload()");
          this.load.setBaseURL("https://cdn.jsdelivr.net/gh/kefik/kenney/Shooter/");
          this.load.image("playership1", "playerShip1_blue.png");
          this.load.image("bullet", "lasers/laserBlue01.png");
          this.load.image("enemy", "enemies/enemyBlack1.png");
      }

      create() 
      {
        console.log("Res.create()");
        this.scene.start("Play");
      }

  }