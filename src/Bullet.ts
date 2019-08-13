// List of types of ammunition.
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

  // The number of shells per salvo.
  shotMultiply: number = 1;

  constructor (scene: Phaser.Scene)
  {
    // Set the scene (current scene, x and y coordinates), texture.
    super (scene, 0, 0, "bullet");
    
    // Set the speed (pixels per frame).
    this.speed = Phaser.Math.GetSpeed (300, 1);
  }

  // Method for the shot, set the characteristics of the projectile.
  fire (x: number, y: number, bulletType:BulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.bulletType = bulletType;     
    
    // Switch the type of projectile.
    switch (bulletType)
    {
      case BulletType.Default:
      this.defaultBullet (x,y);
      break;

      case BulletType.Fast:
      this.fastBullet (x,y);
      break;

      case BulletType.Wobbly:
      this.wobblyBullet (x,y);
      break;

      case BulletType.Mega:
      this.defaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // We call on the stage a projectile of a basic type, in coordinates, add physics.
  defaultBullet (x: number, y: number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'bullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // We call a fast-type projectile onto the scene, coordinate, modify the speed, add physics.
  fastBullet (x: number, y: number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }
  
  // We invoke a wobbling-type projectile onto the stage, coordinate, modify the speed, add physics.
  wobblyBullet (x: number, y: number)
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // The method for updating the projectile is moving.
  update (time: number, delta: number)
  {
    // By y.
    this.y -= this.speed * delta;
    this.totalTime += delta;
    
    // If the type of projectile is wobbling.
    if (this.bulletType == BulletType.Wobbly)
    {
      // By х.
      this.x += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // If the type of shell is mega.
    if (this.bulletType == BulletType.Mega)
    {
      // We change the sizes.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Deactivate if flew off stage.
    if (this.y <= 0)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}