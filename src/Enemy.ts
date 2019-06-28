export class Enemy extends Phaser.Physics.Arcade.Sprite 
{
  
        speed: number;

        constructor( scene: Phaser.Scene ) 
        {
            super(scene, 0, 0, "enemy");
            this.speed = Phaser.Math.GetSpeed(50, 1);
        }
  
        launch(x: number, y: number) : Enemy 
        {
            Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'enemy');
            
            this.setScale(0.3, 0.3);
            

            this.scene.physics.add.existing(this);
            this.body.height *= 0.3;
            this.body.width *= 0.3;

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