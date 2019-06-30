export enum BulletType 
{
   Default,
   Wobbly,
   Mega,
   Fast,
}
   export class Bullet extends Phaser.Physics.Arcade.Sprite 
   {

       speed: number;
       bulletType: BulletType;
       totalTime: number = 0;
       shotMultiply: number = 1;

       constructor( scene: Phaser.Scene )
       {
           super(scene, 0, 0, "bullet");
           this.speed = Phaser.Math.GetSpeed(300, 1);
       }

       fire(x: number, y: number, bulletType: BulletType) 
       {
           this.totalTime = Phaser.Math.FloatBetween(0,7);
           this.shotMultiply = Phaser.Math.FloatBetween(0.5,1);
           this.speed = Phaser.Math.GetSpeed(300, 1);
           this.scaleX = 1;
           this.scaleY = 1;
           this.bulletType = bulletType;
           
           switch(bulletType)
           {
               case BulletType.Default:
               this.defaultBullet(x,y);
               break;

               case BulletType.Fast:
               this.fastBullet(x,y);
               break;

               case BulletType.Wobbly:
               this.wobblyBullet(x,y);
               break;

               case BulletType.Mega:
               this.defaultBullet(x,y);
               this.speed*=3;
               break;
           }

           this.setActive(true);
           this.setVisible(true);
       }

       defaultBullet(x: number, y:number)
       {
                       Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'bullet');
          
           this.scene.physics.add.existing(this);

           this.setPosition(x, y - 45);
       }

       fastBullet(x: number, y:number)
       {
           this.speed *= 5;
           Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'fastBullet');
           this.scene.physics.add.existing(this);
           this.setPosition(x, y - 45);
          
       }


       wobblyBullet(x: number, y:number)
       {
           this.speed *= 3;
           Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'wobblyBullet');
           this.scene.physics.add.existing(this);
           this.setPosition(x, y - 45);
          
       }



       update(time: number, delta: number)
       {
           this.y -= this.speed * delta;
           this.totalTime+= delta;
           if(this.bulletType == BulletType.Wobbly)
           {
             this.x += this.shotMultiply * 20 *Math.sin(this.totalTime/30);
           }

           if(this.bulletType == BulletType.Mega)
           {
             this.scaleX = 3 *Math.sin(this.totalTime/100);
             this.scaleY = 3 *Math.sin(this.totalTime/100);
           }

           if (this.y < -50)
           {
               this.setActive(false);
               this.setVisible(false);
           }
       }
    }