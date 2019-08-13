import { Res } from "./Res";
import { Play } from "./Play";

// Game settings.
export var gameConfig = 
{
  type: Phaser.AUTO,

  // Resolution.
  width: 480,
  height: 640,

  // Background color.
  backgroundColor: 0x000000,
  
  // Physics.
  physics: 
  {
    default: 'arcade',
    arcade: 
    {
      // The value of gravity (along the y axis).
      gravity: { y: 0 }
    }
  },

  // The order of loading scenes.
  scene: [Res, Play],        
};