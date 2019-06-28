  export class Bullet extends Phaser.Physics.Arcade.Sprite 
  {
  
        speed: number;

        constructor( scene: Phaser.Scene )
        {
            super(scene, 0, 0, "bullet");
            this.speed = Phaser.Math.GetSpeed(300, 1);
        }
  
        fire(x: number, y: number) 
        {
            Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'bullet');
            
            this.scene.physics.add.existing(this);

            this.setPosition(x, y - 45);

            this.setActive(true);
            this.setVisible(true);
        }

        update(time: number, delta: number)
        {
            this.y -= this.speed * delta;

            if (this.y < -50)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    }