// Список типов боеприпасов.
export enum BacksideBulletType 
{
   Default,
   Wobbly, // Вихляющие
   Mega,
   Fast,
}

export class BacksideBullet extends Phaser.Physics.Arcade.Sprite 
{
  speed:number;
  backsideBulletType:BacksideBulletType;
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
  fire (x:number, y:number, backsideBulletType:BacksideBulletType) 
  {
    this.totalTime = Phaser.Math.FloatBetween (0,7);
    this.shotMultiply = Phaser.Math.FloatBetween (0.5,1);
    this.speed = Phaser.Math.GetSpeed (300, 1);
    this.scaleX = 1;
    this.scaleY = 1;
    this.backsideBulletType = backsideBulletType;     
    
    // Переключаем тип снаряда.
    switch (backsideBulletType)
    {
      case BacksideBulletType.Default:
      this.backsideDefaultBullet (x,y);
      break;

      case BacksideBulletType.Fast:
      this.backsideFastBullet (x,y);
      break;

      case BacksideBulletType.Wobbly:
      this.backsideWobblyBullet (x,y);
      break;

      case BacksideBulletType.Mega:
      this.backsideDefaultBullet (x,y);
      this.speed *= 3;
      break;
    }

    this.setActive  (true);
    this.setVisible (true);
  }

  // Вызываем на сцену снаряд базового типа, по координатам, добавляем физику.
  backsideDefaultBullet (x:number, y:number)
  {
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'bullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y + 45);
  }

  // Вызываем на сцену снаряд быстрого типа, по координатам, модифицируем скорость, добавляем физику.
  backsideFastBullet (x:number, y:number)
  {
    this.speed *= 5;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'fastBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y + 45);
  }
  
  // Вызываем на сцену снаряд вихляющего типа, по координатам, модифицируем скорость, добавляем физику.
  backsideWobblyBullet (x:number, y:number)
  {
    this.speed *= 3;
    Phaser.Physics.Arcade.Sprite.call (this, this.scene, 0, 0, 'wobblyBullet');
    this.scene.physics.add.existing (this);
    this.setPosition (x, y + 45);
  }

  // Метод для обновления снаряда - перермещение.
  update (time:number, delta:number)
  {
    // По у.
    this.y += this.speed * delta;
    this.totalTime += delta;

    // Если тип снаряда - обычный.
    if (this.backsideBulletType == BacksideBulletType.Default)
    {
      // Поворачиваем.
      this.rotation = -3.15; 
    }
    
    // Если тип снаряда - вихляющий.
    if (this.backsideBulletType == BacksideBulletType.Wobbly)
    {
      // Поворачиваем.
      this.rotation = -3.15; 

      // По х.
      this.x += this.shotMultiply * 20 * Math.sin (this.totalTime/30);
    }
    
    // Если тип снаряда - мега.
    if (this.backsideBulletType == BacksideBulletType.Mega)
    {
      // Меняем размеры.
      this.scaleX = 2 * Math.sin (this.totalTime/100);
      this.scaleY = 2 * Math.sin (this.totalTime/100);
    }

    // Деактивируем, если улетел за сцену.
    if (this.y >= 00)
    {
      this.setActive  (false);
      this.setVisible (false);
    }
  }
}