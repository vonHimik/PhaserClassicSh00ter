import { Res } from "./Res";
import { Play } from "./Play";

// Игровые настройки.
export var gameConfig = 
{
  type: Phaser.AUTO,

  // Разрешение.
  width: 480,
  height: 640,

  // Цвет фона.
  backgroundColor: 0x000000,
  
  // Физика.
  physics: 
  {
    default: 'arcade',
    arcade: 
    {
      // Значение гравитации (по оси у).
      gravity: { y: 0 }
    }
  },

  // Порядок загрузки сцен.
  scene: [Res, Play],        
};