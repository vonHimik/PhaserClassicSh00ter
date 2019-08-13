export class Asteroid extends Phaser.Physics.Arcade.Sprite 
{
  speed: number;
  size: number;

  constructor (scene: Phaser.Scene) 
  {
    // Set the scene (current scene, x and y coordinates), texture.
    super (scene, 0, 0, "asteroid");

    // Set the speed (pixels per frame).
    this.speed = Phaser.Math.GetSpeed (50, 1);
  }

  xdif: number;
  ydif: number;

  // Method for launching an asteroid, setting start parameters.
  launch (x: number, y: number, size: number, xd: number, yd: number): Asteroid 
  {
    this.size = size;
    this.setSprite();
    this.xdif = xd;
    this.ydif = yd;
    this.setScale (0.3, 0.3);
    this.scene.physics.add.existing (this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.setPosition (x, y);
    this.setActive  (true);
    this.setVisible (true);
    return this;
  }

  // Method for updating the state of the asteroid (moving, take-off behind the scenes).
  update (time: number, delta: number) 
  {
    // Updating the coordinates.
    var t: number = this.ydif * this.speed * delta/100;
    this.y += this.speed * delta + t/2;
    this.x += this.xdif * this.speed * delta/100;
    
    // If flew offstage, deactivate.
    if (this.y > Number (this.scene.game.config.height) + 50)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }

  // Method for obtaining the Y coordinates.
  get Y(): number
  {
    return this.y;
  }
  // Method for obtaining the X coordinate.
  get X(): number
  {
    return this.x;
  }

  // A method for setting a sprite to an asteroid, depending on its size (large, medium, small).
  setSprite(): void
  {
    if (this.size == 1)
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y,'asteroidBig');
    }
    else if (this.size == 2)
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, 'asteroidMed');
    }
    else
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, 'asteroidSmall');
    }
  }
}