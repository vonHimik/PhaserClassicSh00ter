// List of types of ammunition.
export enum LeftsideBulletType 
{
   Default,
   Wobbly,
   Mega,
   Fast,
}

export class LeftsideBullet extends Phaser.Physics.Arcade.Sprite 
{
  speed: number;
  leftsideBulletType: LeftsideBulletType;
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
  fire (x: number, y: number, leftsideBulletType: LeftsideBulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.leftsideBulletType = leftsideBulletType;     
    
    // Switch the type of projectile.
    switch (leftsideBulletType)
    {
      case LeftsideBulletType.Default:
      this.leftsideDefaultBullet (x,y);
      break;

      case LeftsideBulletType.Fast:
      this.leftsideFastBullet (x,y);
      break;

      case LeftsideBulletType.Wobbly:
      this.leftsideWobblyBullet (x,y);
      break;

      case LeftsideBulletType.Mega:
      this.leftsideDefaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // We call on the stage a projectile of a basic type, in coordinates, add physics.
  leftsideDefaultBullet (x: number, y: number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'broadsideBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x - 45, y);
  }

  // We call a fast-type projectile onto the scene, coordinate, modify the speed, add physics.
  leftsideFastBullet (x: number, y: number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x - 45, y);
  }
  
  // We invoke a wobbling-type projectile onto the stage, coordinate, modify the speed, add physics.
  leftsideWobblyBullet (x: number, y: number) 
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x - 45, y);
  }

  // The method for updating the projectile is moving.
  update (time: number, delta: number)
  {
    // By x.
    this.x -= this.speed * delta;
    this.totalTime += delta;

    // If the type of shell is normal.
    if (this.leftsideBulletType == LeftsideBulletType.Default)
    {
      // We turn.
      this.rotation = -1.55; 
    }
    
    // If the type of projectile is wobbling.
    if (this.leftsideBulletType == LeftsideBulletType.Wobbly)
    {
      // We turn.
      this.rotation = -1.55; 

      // By y.
      this.y += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // If the type of shell is mega.
    if (this.leftsideBulletType == LeftsideBulletType.Mega)
    {
      // We change the sizes.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Deactivate if flew off stage.
    if (this.x <= 0)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}