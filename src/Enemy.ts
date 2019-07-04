import { EnemyHolder } from "./EnemyHolder";
   
export class Enemy extends Phaser.Physics.Arcade.Sprite 
{
  speed:number;

  // {Honza}
  // Enemy variables to customise them and their beavior

  // Имя спрайта.
  spriteName:string = null;

  // Функция обновления.
  updateFunction:(x:number, y:number)=>void = null;

  // Конструктор объекта Враг.                         
  constructor (scene:Phaser.Scene) 
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "enemy");

    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (50, 1);
  }

  // Метод для запуска врага.
  launch (x:number, y:number) : Enemy 
  {
    // Устанавливаем спрайт.
    if (this.spriteName != null)
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, this.spriteName);
    } 
    else 
    {
      Phaser.Physics.Arcade.Sprite.call(this, this.scene, 0, 0, 'blackEnemy');
    }
    
    this.setScale (0.3, 0.3);
    this.scene.physics.add.existing (this);
    this.body.height *= 0.3;
    this.body.width *= 0.3;
    this.body.setCircle (20);
    this.setPosition (x, y);           
    this.setVelocity(0, 0).setAcceleration(0, 0);
    this.setActive  (true);
    this.setVisible (true);
    return this;
  }

// Метод для обновления состояния врага - перемещение, выход за экран.
  update (time:number, delta:number) 
  {
    if (this.updateFunction == null)
    {
      // Apply the default update
      this.y += this.speed * delta;

      if (this.y > Number (this.scene.game.config.height) + 50)
      {
        this.setActive  (false);
        this.setVisible (false);
      }
    } 
    else 
    {
      // Apply the custom update
      this.updateFunction (time, delta);
    }
  }

  // Метод для иницализации спрайта и функции обновления.
  init (holder: EnemyHolder) 
  {
    this.spriteName = holder.spriteName;
    this.updateFunction = holder.updateFunction;
  }
}