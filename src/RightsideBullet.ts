// List of types of ammunition.
export enum RightsideBulletType 
{
   Default,
   Wobbly,
   Mega,
   Fast,
}

export class RightsideBullet extends Phaser.Physics.Arcade.Sprite 
{
  speed: number;
  rightsideBulletType: RightsideBulletType;
  totalTime: number = 0;

  // The number of shells per salvo.
  shotMultiply: number = 1;

  constructor (scene: Phaser.Scene)
  {
    // Set the scene (current scene, x and y coordinates), texture.
    super (scene, 0, 0, "bullet");
    
    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (300, 1);
  }

  // Method for the shot, set the characteristics of the projectile.
  fire (x: number, y: number, rightsideBulletType: RightsideBulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.rightsideBulletType = rightsideBulletType;     
    
    // Switch the type of projectile.
    switch (rightsideBulletType)
    {
      case RightsideBulletType.Default:
      this.rightsideDefaultBullet (x,y);
      break;

      case RightsideBulletType.Fast:
      this.rightsideFastBullet (x,y);
      break;

      case RightsideBulletType.Wobbly:
      this.rightsideWobblyBullet (x,y);
      break;

      case RightsideBulletType.Mega:
      this.rightsideDefaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // We call on the stage a projectile of a basic type, in coordinates, add physics.
  rightsideDefaultBullet (x: number, y: number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'broadsideBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }

  // We call a fast-type projectile onto the scene, coordinate, modify the speed, add physics.
  rightsideFastBullet (x: number, y: number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }
  
  // We invoke a wobbling-type projectile onto the stage, coordinate, modify the speed, add physics.
  rightsideWobblyBullet (x: number, y: number) 
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x + 45, y);
  }

  // The method for updating the projectile is moving.
  update (time: number, delta: number)
  {
    // By x.
    this.x += this.speed * delta;
    this.totalTime += delta;

    // If the type of shell is normal.
    if (this.rightsideBulletType == RightsideBulletType.Default)
    {
      // We turn.
      this.rotation = 1.55; 
    }
    
    // If the type of projectile is wobbling.
    if (this.rightsideBulletType == RightsideBulletType.Wobbly)
    {
      // We turn.
      this.rotation = 1.55; 

      // By y.
      this.y += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // If the type of shell is mega.
    if (this.rightsideBulletType == RightsideBulletType.Mega)
    {
      // We change the sizes.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Deactivate if flew off stage.
    if (this.x >= 500)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}