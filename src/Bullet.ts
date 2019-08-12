// Список типов боеприпасов.
export enum BulletType 
{
   Default,
   Wobbly, // Вихляющие
   Mega,
   Fast,
}

export class Bullet extends Phaser.Physics.Arcade.Sprite 
{
  speed:number;
  bulletType:BulletType;
  totalTime:number = 0;

  // Число снарядов за залп.
  shotMultiply:number = 1;

  // Конструктор объекта Снаряд.
  constructor (scene:Phaser.Scene)
  {
    // Настраиваем место появления (текущая сцена, координаты х и у), текстуру.
    super (scene, 0, 0, "bullet");
    
    // Настраиваем скорость (пикселей за фрейм).
    this.speed = Phaser.Math.GetSpeed (300, 1);
  }

  // Метод для выстрела, устанаваливаем характеристики снаряда.
  fire (x:number, y:number, bulletType:BulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.bulletType = bulletType;     
    
    // Переключаем тип снаряда.
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

  // Вызываем на сцену снаряд базового типа, по координатам, добавляем физику.
  defaultBullet (x:number, y:number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'bullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // Вызываем на сцену снаряд быстрого типа, по координатам, модифицируем скорость, добавляем физику.
  fastBullet (x:number, y:number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }
  
  // Вызываем на сцену снаряд вихляющего типа, по координатам, модифицируем скорость, добавляем физику.
  wobblyBullet (x:number, y:number)
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y - 45);
  }

  // Метод для обновления снаряда - перермещение.
  update (time:number, delta:number)
  {
    // По у.
    this.y -= this.speed * delta;
    this.totalTime += delta;
    
    // Если тип снаряда - вихляющий.
    if (this.bulletType == BulletType.Wobbly)
    {
      // По х.
      this.x += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // Если тип снаряда - мега.
    if (this.bulletType == BulletType.Mega)
    {
      // Меняем размеры.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Деактивируем, если улетел за сцену.
    if (this.y <= 0)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}