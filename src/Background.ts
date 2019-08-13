export class Background extends Phaser.Physics.Arcade.Sprite 
{
  speed: number;

  constructor (scene: Phaser.Scene) 
  {
    // Set the scene (current scene, x and y coordinates), texture.
    super (scene, 0, 0, "background");

    // Set the speed (pixels per frame).
    this.speed = Phaser.Math.GetSpeed (Math.random() * 30 + 20, 1);         
  }

  // Method for starting the background, setting start parameters.
  launch (x: number, y: number): Background 
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'background');
    this.setScale (this.speed * 10, this.speed * 10);
    this.scene.physics.add.existing (this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.alpha *= (10 * this.speed);
    this.setTintFill (0x333399);
    this.setPosition (x, y);
    this.setActive (true);
    this.setVisible (true);
    return this;
  }

  // Method for updating the background state (moving, crashing behind the scenes).
  update (time: number, delta: number) 
  {
    // Updating the coordinates.
    this.y += this.speed * delta;
    
    // If flew offstage, deactivate.
    if (this.y > Number (this.scene.game.config.height) + 50)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}