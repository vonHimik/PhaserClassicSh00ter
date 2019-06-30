export class Background extends Phaser.Physics.Arcade.Sprite 
{
        speed: number;

       constructor( scene: Phaser.Scene ) 
       {
           super(scene, 0, 0, "background");
           this.speed = Phaser.Math.GetSpeed(Math.random() * 30 + 20, 1);         
       }
        launch(x: number, y: number) : Background 
        {
           Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'background');
          
           this.setScale(this.speed * 10, this.speed * 10);

           this.scene.physics.add.existing(this);
           this.body.height *= 0.3;
           this.body.width *= 0.3;
           this.alpha *= (10 * this.speed);

          this.setTintFill(0x333399);

           this.setPosition(x, y);

           this.setActive(true);
           this.setVisible(true);

           return this;
       }

       update(time: number, delta: number) 
       {
           this.y += this.speed * delta;

           if (this.y > Number(this.scene.game.config.height) + 50)
           {
               this.setActive(false);
               this.setVisible(false);
           }
       }
    }