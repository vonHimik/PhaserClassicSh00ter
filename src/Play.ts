import { Asteroid } from "./Asteroid";
import { Bullet, BulletType } from "./Bullet";
import { LeftsideBullet, LeftsideBulletType } from "./LeftsideBullet";
import { RightsideBullet, RightsideBulletType } from "./RghtsideBullet";
import { Enemy } from "./Enemy";
import { Background } from "./Background";
import { Upgrade } from "./Upgrade";
import { EnemyHolder } from "./EnemyHolder";

// Класс управляющий процессом игры.
export class Play extends Phaser.Scene 
{
  // Переменная представляющая игрока.
  player : Phaser.Physics.Arcade.Sprite;

  // Переменная для подбираемого обЪекта.
  pickup : Phaser.Physics.Arcade.Sprite;

  // Переменная для масштабирования того, на сколько кусков распадётся корабль игрока.
  pc : number = 8;

  // Куски игрока.
  playerPieces : Phaser.Physics.Arcade.Sprite[];

  // Создаём группы с физикой для отдельных типов объектов.
  asteroids : Phaser.Physics.Arcade.Group;
  lasers : Phaser.Physics.Arcade.Group;
  leftsideLasers : Phaser.Physics.Arcade.Group;
  enemies : Phaser.Physics.Arcade.Group;
  background : Phaser.Physics.Arcade.Group;

  // Переменная для команд управления.
  moveKeys : {[key:string]:Phaser.Input.Keyboard.Key};

  // List of predefined enemies.
  enemyHolders : EnemyHolder[];

  // Переменные для отсчитывания времени с момента последнего спавна (врага, снаряжения).
  lastSpawn : number = 0;
  lastPickupSpawn : number = 0;

  // Значения элементов интерфейса (характеристик игрока).
  score : number = 0;
  health : number = 3;
  healthSprites : {[key:number]:Phaser.Physics.Arcade.Sprite};
  healthText : Phaser.GameObjects.Text;

  // Щит.
  shieldActive : boolean = true;
  shieldReloadTime : number = 3;
  shieldTimer : number = 0;
  shield : Phaser.Physics.Arcade.Sprite;

  // Вооружение.
  gunType : number = 0;
  lastSideShooted : number = 0;
  upgrades : Phaser.Physics.Arcade.Group;
  currentBullet : BulletType;
  currentLeftsideBullet : LeftsideBulletType;
  shootCooldown : number = 300;
  upgradeCooldown : number = 0;
  
  scoreText : Phaser.GameObjects.Text;

  playerEnemyCollier : Phaser.Physics.Arcade.Collider;

  constructor() 
  {
    super ("Play");
  }

  // Метод инициализирующий игру.
  create() 
  {
    console.log("Play.create()");

    this.background = this.physics.add.group
    ({
      classType:Background,
      maxSize:300,
      runChildUpdate:true
    });

    // Добавляем и настраиваем корабль игрока.
    this.player = this.physics.add.sprite(320, 500, "playership1").setScale(0.5, 0.5);
    this.player.body.collideWorldBounds = true;
    this.player.body.width *= 0.5;
    this.player.body.height *= 0.5;
    this.player.body.setCircle (27);
    this.player.depth = 10;
    this.gunType = 0;
    this.currentBullet = BulletType.Default;
    this.currentLeftsideBullet = LeftsideBulletType.Default;

    // Добавляем на сцену спрайт щита.
    this.shield = this.physics.add.sprite(320, 500, "shield1").setScale(0.5, 0.5);
    this.shield.body.width *= 0.5;
    this.shield.body.height *= 0.5;
    
    // Добавляем и настраиваем золотые звёзды (усиления).
    this.pickup = this.physics.add.sprite(320, 500, "star").setScale(0.5, 0.5);
    this.pickup.body.collideWorldBounds = true;
    this.pickup.body.width *= 0.5;
    this.pickup.body.height *= 0.5;
    this.pickup.setActive(false).setVisible(false);
    this.lastPickupSpawn = 0;
    
    // Определяем размер кусочков, на которые будет разделяться корабль игрока, на основе его размера и коэффициента масштабирования.
    let pw : number = this.player.width / this.pc;
    let ph : number = this.player.height / this.pc;
    this.playerPieces = [];
    
    // В цикле проходимся по кораблю игрока, разделяя его на части.
    for (let i : number = 0; i < this.pc; ++i) 
    {
      for (let j : number = 0; j < this.pc; ++j) 
      {
        // Выполняем обрезку корабля игрока, отделив от него в отдельный спрайт кусочек указанного размера.
        let pp:Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(320, 500, "playership1").setScale(0.5, 0.5).setCrop(i*pw, j*ph, pw, ph);

        // Этот кусочек невидим.
        pp.setActive(false).setVisible(false);

        // Добавляем кусочек в массив для кусков корабля игрока.
        this.playerPieces.push (pp);
      }
    }

    // Считываем ввод.
    this.moveKeys = <{[key:string]:Phaser.Input.Keyboard.Key}> this.input.keyboard.addKeys
    ({
      'up':Phaser.Input.Keyboard.KeyCodes.W,
      'down':Phaser.Input.Keyboard.KeyCodes.S,
      'left':Phaser.Input.Keyboard.KeyCodes.A,
      'right':Phaser.Input.Keyboard.KeyCodes.D,
      'fire':Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Enables movement of player with WASD keys.
    this.input.keyboard.on('keydown_W', function (event:object) 
    {
      this.scene.player.setAccelerationY(-800);
    });
    
    this.input.keyboard.on('keydown_S', function (event:object) 
    {
      this.scene.player.setAccelerationY(800);
    });

    this.input.keyboard.on('keydown_A', function (event:object) 
    {
      this.scene.player.setAccelerationX(-800);
    });
    
    this.input.keyboard.on('keydown_D', function (event:object) 
    {
      this.scene.player.setAccelerationX(800);
    });           

    // Stops player acceleration on uppress of WASD keys.
    this.input.keyboard.on('keyup_W', function (event:object) 
    {
      if (this.scene.moveKeys['down'].isUp)
      this.scene.player.setAccelerationY(0);
    });
    
    this.input.keyboard.on('keyup_S', function (event: object) 
    {
      if (this.scene.moveKeys['up'].isUp)
      this.scene.player.setAccelerationY(0);
    });

    this.input.keyboard.on('keyup_A', function (event: object) 
    {
      if (this.scene.moveKeys['right'].isUp)
      this.scene.player.setAccelerationX(0);
    });
       
    this.input.keyboard.on('keyup_D', function (event: object) 
    {
      if (this.scene.moveKeys['left'].isUp)
      this.scene.player.setAccelerationX(0);
    });
      

    // BULLET GROUP
    this.lasers = this.physics.add.group
    ({
      classType: Bullet,
      maxSize: 20,
      runChildUpdate: true
    });

    this.leftsideLasers = this.physics.add.group
    ({
      classType: LeftsideBullet,
      maxSize: 20,
      runChildUpdate: true
    });               
      
    // Upgrades
    this.upgrades = this.physics.add.group
    ({
      classType: Upgrade,
      maxSize: 1,
      runChildUpdate: true
    });   

    // ENEMY GROUP
    this.enemies = this.physics.add.group
    ({
      classType: Enemy,
      maxSize: 50,
      runChildUpdate: true
    });

    // ASTEROID GROUP
    this.asteroids = this.physics.add.group
    ({
      classType: Asteroid,
      maxSize: 60,
      runChildUpdate: true
    });

      
    // LASERS kill ENEMIES
    this.physics.add.collider(this.lasers, this.enemies, this.collideLaserEnemy, null, this); // last parameter is the context passed into the callback

    this.physics.add.collider(this.leftsideLasers, this.enemies, this.collideBroadsideLaserEnemy, null, this);

    // PLAYER is killed by ENEMIES
    this.playerEnemyCollier = this.physics.add.collider(this.player, this.enemies, this.collidePlayerEnemy, null, this); 
    // last parameter is the context passed into the callback

    this.physics.add.collider(this.player, this.pickup, this.collidePickup, null, this); 
    // last parameter is the context passed into the callback

    // PLAYER is killed by UPGRADE
    this.physics.add.collider(this.player, this.upgrades, this.collidePlayerPowerup, null, this); 
    // last parameter is the context passed into the callback

    this.physics.add.collider(this.player, this.asteroids, this.collidePlayerEnemy, null, this);

    this.physics.add.collider(this.lasers, this.asteroids, this.collideLaserAsteroid, null, this);

    this.physics.add.collider(this.leftsideLasers, this.asteroids, this.collideBroadsideLaserAsteroid, null, this);
    
    // SCORE TEXT
    this.scoreText = this.add.text(5, 5, "Score: 0", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // Health text
    this.health = 3;
    this.healthText = this.add.text(5, 20, "Health:", { fontFamily: "Arial Black", fontSize: 12, color: "#33ff33", align: 'left' }).setStroke('#333333', 1);

    // Вызываем методы инициализации интерфейса и списка врагов.
    this.initializeHealthUI();
    this.InitializeEnemiesList();
  }

// Метод для инициализации списка врагов.
InitializeEnemiesList()
{
  // Список типов противников
  this.enemyHolders = [
    // Чёрный
    new EnemyHolder ("blackEnemy", function (time:number, delta:number)
    {
      // Поведение
      this.y += this.speed * delta;
      this.x += 1*this.speed*Math.sin(0.02*this.y)*delta;

      // Обработка выхода за экран.
      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.setActive(false);
        this.setVisible(false);
      }
       }),

    // Голубой
    new EnemyHolder("blueEnemy", function(x:number, y:number)
    {
      this.y += this.speed * y;

      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.setActive(false);
        this.setVisible(false);
      }
    }),

    // Зелёный
    new EnemyHolder("greenEnemy", function(x: number, delta: number)
    {
      this.y += this.speed * delta;
      this.x += Phaser.Math.Between(-this.speed, this.speed)*delta;

      if (this.y > Number(this.scene.game.config.height) + 50)
      {
        this.setActive(false);
        this.setVisible(false);
      }
    }),

    // Красный
    new EnemyHolder("redEnemy", null)
    ];
}

// Метод обновляющий состояния игры (спавны, состояния, выбор оружия и т.д.).
update (time:number, delta:number) 
{
  // Отсчитываем время с последнего спавна.
  this.lastSpawn -= delta;
  
  // Если прошло некоторое время и активных астероидов меньше пяти, то запустим новый.
  if (this.lastSpawn < 0) 
  {
    if (this.asteroids.countActive()<5)
    {
      (this.asteroids.get() as Asteroid).launch(Phaser.Math.Between(50,400),-50,1,0,0);
    }
  }
  
  // Размещаем щит в нужном месте и следим, чтобы он следовал за игроком.
  this.shield.setPosition(this.player.x, this.player.y);
  this.constrainVelocity(this.player, 100);
  
  // Оффсеты стрельбы.
  const xGunOffset = 35;
  const yGunOffset = 20;

  // Переключение типа оружия.
  switch(this.gunType) 
  {
    case 0: 
    {
      // Проверяем нажатие кнопки "огонь". Число - время до возможности повторного нажатия.
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 500))
      {
        // Настраиваем объект типа боеприпас.
        let b: Bullet = this.lasers.get() as Bullet;
        let bb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
        
        // Если удачно, то выполняем функцию стрельбы им.
        if (b) 
        {
          b.fire(this.player.x, this.player.y, this.currentBullet);  
        }

        if (bb) 
        {
          bb.fire(this.player.x, this.player.y, this.currentLeftsideBullet);  
        }
      }
    break;
    }
     
    case 1: 
    {
      // Проверяем нажатие кнопки "огонь".
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 400))
      {
        // Настраиваем объект типа боеприпас.
        let b: Bullet = this.lasers.get() as Bullet;
        let bb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
        
        // Если удачно, то выполняем функцию стрельбы им.
        if (b) 
        {
          b.fire(this.player.x + this.lastSideShooted * xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet);
        }

        if (bb) 
        {
          bb.fire(this.player.x + this.lastSideShooted * xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentLeftsideBullet);
        }
        
        // Фиксируем что произведён подобный выстрел.
        this.lastSideShooted = (this.lastSideShooted + 1) % 2;
      } 
    break;
    }
         
    case 2: 
    {
      // Проверяем нажатие кнопки "огонь".
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 300))
      {
        // Если прошло достаточно времени с момента последнего выстрела.
        if (this.lastSideShooted % 2 == 0) 
        {
          // Настраиваем объект типа боеприпас.
          let b: Bullet = this.lasers.get() as Bullet;
          let bb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
          
          // Если удачно, то выполняем функцию стрельбы им.
          if (b) 
          {
            b.fire(this.player.x, this.player.y, this.currentBullet);  
          }

          if (bb) 
          {
            bb.fire(this.player.x, this.player.y, this.currentLeftsideBullet);  
          }
        } 
        // Если прошло мало времени.
        else 
        {
          // Настраиваем объект типа боеприпас.
          let b: Bullet = this.lasers.get() as Bullet;
          let bb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
          
          // Если удачно, то выполняем функцию стрельбы им.
          if (b) 
          {
            b.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
          }

          if (bb) 
          {
            bb.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentLeftsideBullet); 
          }

          // И повторяем, потому что это двойной выстрел. Место запуска второго снаряда смещаем.
          b = this.lasers.get() as Bullet;
          bb = this.leftsideLasers.get() as LeftsideBullet;
          
          if (b) 
          {
            b.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
          }

          if (bb) 
          {
            bb.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentLeftsideBullet); 
          }
        }
        
        // Фиксируем что произведён подобный выстрел.
        this.lastSideShooted = (this.lastSideShooted + 1) % 2;
      } 
    break;
    }
    
    case 3: 
    {
      // Проверяем нажатие кнопки "огонь".
      if (this.input.keyboard.checkDown(this.moveKeys['fire'], 250))
      {
        // Настраиваем объект типа боеприпас.
        let b: Bullet = this.lasers.get() as Bullet;
        let bb: LeftsideBullet = this.leftsideLasers.get() as LeftsideBullet;
        
        // Если удачно, то выполняем функцию стрельбы им.
        if (b) 
        {
          b.fire(this.player.x, this.player.y, this.currentBullet);  
        }

        if (bb) 
        {
          bb.fire(this.player.x, this.player.y, this.currentLeftsideBullet);  
        }
        
        // И повторяем ещё два раза, потому что это тройной выстрел. Места запуска второго и третьего снарядов смещаем.
        b = this.lasers.get() as Bullet;
        bb = this.leftsideLasers.get() as LeftsideBullet;
        
        if (b) 
        {
          b.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet); 
        }

        if (bb) 
        {
          bb.fire(this.player.x + xGunOffset - xGunOffset/2, this.player.y + yGunOffset, this.currentLeftsideBullet); 
        }

        b = this.lasers.get() as Bullet;
        bb = this.leftsideLasers.get() as LeftsideBullet;
        
        if (b) 
        {
          b.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentBullet)
        }

        if (bb) 
        {
          bb.fire(this.player.x - xGunOffset/2, this.player.y + yGunOffset, this.currentLeftsideBullet)
        }
        
        // Фиксируем что произведён подобный выстрел.
        this.lastSideShooted = (this.lastSideShooted + 1) % 2;
      } 
    break;
    }
  }

  // Отсчитываем время от последнего спавна апгрейда.
  this.upgradeCooldown -= delta;

  // Если кулдаун прошёл.
  if (this.upgradeCooldown < 0)
  {
    // Настраиваем объект типа апгрейд.
    let u: Upgrade = this.upgrades.get() as Upgrade;
    
    // Размещаем апгрейд на сцене и обновляем кулдаун.
    if (u) 
    {
      u.spawn();
      this.upgradeCooldown += 10000;
    }
  }
  
  // Если некоторое время ничего не спавнилось, спавним в разных местах.
  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    // this.lastSpawn += 1;
  }

  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    // this.lastSpawn += 1;
  }

  if (this.lastSpawn < 0) 
  {
    // SPAWN BACK
    (this.background.get() as Background).launch(Phaser.Math.Between(0, 480), -50);    
    //this.lastSpawn += 1;
  }
  
  // Отсчитываем время от последнего спавна подбираемого предмета.
  this.lastPickupSpawn -= delta;

  // Если на сцене нет подбираемого предмета и он долго не спавнился.
  if (!this.pickup.active && this.lastPickupSpawn < 0) 
  {
    // То размещаем объект на сцене и обновляем "таймер".
    this.pickup.setActive(true).setVisible(true)
    this.pickup.setVelocity(0,0);
    this.pickup.setAcceleration(0,0);
          
    let x: number = Phaser.Math.Between(50, 400);
    let y: number = Phaser.Math.Between(25, 200);

    this.pickup.setPosition(x, y)
    this.lastPickupSpawn += 10000;
  }

  // Если подбираемый объект размещён на сцене, то заставляем его менять размер, со времнем возвращаясь к исходному, создавая эффект "мигания".
  if(this.pickup.active) 
  {
    let scale: number = Math.sin(time*0.005);
    this.pickup.setScale(0.5 + 0.1*scale, 0.5 + 0.1*scale);
  }

  // Если щит не активен.
  if (!this.shieldActive) 
  {
    // Уменьшаем таймер.
    this.shieldTimer -= delta / 1000;
    
    // Если таймер меньше нуля.
    if (this.shieldTimer <= 0) 
    {
      // Активируем щит и делаем его видимым.
      this.shieldActive = true;
      this.shield.setVisible(true);
    }
  }

  // Если противники некоторое время не спавнились.
  if (this.lastSpawn < 0) 
  {
    // SPAWN ENEMY

    // Создаём и запускаем группу "Противники".
    (this.enemies.get() as Enemy).launch(Phaser.Math.Between(50, 400), -50); 

    // Создаём объект типа "враг" и добавляем его в соответствующую группу.
    var enemy : Enemy = this.enemies.get() as Enemy;

    // Генерируем случайный индекс.
    var randomIndex : integer = Phaser.Math.Between(0, this.enemyHolders.length-1);

    // Инициализируем новый объект у управляющей структуры.    
    enemy.init(this.enemyHolders[randomIndex]);

    // Размещаем на сцене.
    enemy.launch(Phaser.Math.Between(50, 400), -50);

    // Сбрасываем таймер спавна.
    this.lastSpawn += 1000;
  }
}

// Метод для управления (скоростью) спрайта.
constrainVelocity(sprite: Phaser.Physics.Arcade.Sprite, maxVelocity: number)
{
  // Если у объекта (уже) нет спрайта, то выходим.
  if (!sprite || !sprite.body)
  {
    return;
  }

  var angle, currVelocitySqr, vx, vy;
  vx = sprite.body.velocity.x;
  vy = sprite.body.velocity.y;
  currVelocitySqr = vx * vx + vy * vy;

  if (currVelocitySqr > maxVelocity * maxVelocity)
  {
    angle = Math.atan2(vy, vx);
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    sprite.body.velocity.x = vx;
    sprite.body.velocity.y = vy;
  }
}

// Метод для добавления и настройки коллайдера подбираемого объекта.
collidePickup(player: Phaser.Physics.Arcade.Sprite, pickup: Phaser.Physics.Arcade.Sprite) 
{
  // Если на сцене сейчас нету игрока или подбираемого объекта, то выходим.
  if (!player.active) return;
  if (!pickup.active) return;

  // При столкновении деактивируем объект.
  pickup.setActive(false).setVisible(false);
  
  // Если тип оружия не максимальный, то переходим к следующему.
  if (this.gunType < 3) 
  {
    this.gunType += 1;
  }
  // Если максимальный, то увеличиваем число очков.
  else 
  {
    this.score += 25;
    this.scoreText.text = "Score: " + this.score;
  }
}

// Метод для добавления и настройки коллайдера усилителя.
collidePlayerPowerup(player: Phaser.Physics.Arcade.Sprite, upgrade: Upgrade)
{
  // Если на сцене сейчас нету игрока или усилителя, то выходим.
  if (!player.active) return;
  if (!upgrade.active) return;

  // При столкновении деактивируем объект.
  upgrade.setActive(false).setVisible(false);

  // Обновляем вооружение.
  this.currentBullet  = (this.currentBullet + 1) % 4;
  this.currentLeftsideBullet  = (this.currentLeftsideBullet + 1) % 4;

  if (this.currentBullet == BulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }

  if (this.currentLeftsideBullet == LeftsideBulletType.Fast)
  {
    this.shootCooldown = 100;
  }
  else
  {
    this.shootCooldown = 300;
  }
}

// Метод обрабатывающий поражение врага снарядом.
collideLaserEnemy (laser : Bullet, enemy : Enemy) 
{
  // Если на сцене сейчас нету снаряда или врага, то выходим.
  if (!laser.active) return;
  if (!enemy.active) return;

  // При столкновении деактивируем объекты.
  laser.setActive(false).setVisible(false);
  enemy.setActive(false).setVisible(false);

// Добавляем очко и обновляем счётчик.
  this.score += 1;
  this.scoreText.text = "Score: " + this.score;
}

// Метод обрабатывающий поражение врага снарядом.
collideBroadsideLaserEnemy (broadsideLaser : LeftsideBullet, enemy : Enemy) 
{
  // Если на сцене сейчас нету снаряда или врага, то выходим.
  if (!broadsideLaser.active) return;
  if (!enemy.active) return;

  // При столкновении деактивируем объекты.
  broadsideLaser.setActive(false).setVisible(false);
  enemy.setActive(false).setVisible(false);

// Добавляем очко и обновляем счётчик.
  this.score += 1;
  this.scoreText.text = "Score: " + this.score;
}

// Метод обрабатывающий столкновение врага и игрока.
collidePlayerEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) 
{
  // Если на сцене сейчас нету игрока или врага, то выходим.
  if (!player.active) return;
  if (!enemy.active) return;

  // При столкновении деактивируем объект-враг.
  enemy.setActive(false).setVisible(false);
  
  // Если щит активен.
  if (this.shieldActive) 
  {
    // То вызываем метод наносящий ему урон.
    this.shieldHit();
  } 
  // Иначе.
  else 
  {
    // Отнимаем одну жизнь и обновляем интерфейс.
    this.health--;
    this.updateHealthUI();
    
    // Если число жизней упадёт до нуля.
    if (this.health <= 0) 
    {
      // То вызываем метод взрывающий корабль игрока.
      this.playerExplode();
    }
  }
}

// Метод для взрыва корабля игрока.
playerExplode() 
{
  // Уничтожаем коллайдер корабля игрока и деактивируем его как обЪект.
  this.playerEnemyCollier.destroy();
  this.player.setActive(false).setVisible(false);

  // Настраиваем, на сколько кусочков должен разлететься спрайт корабля игрока.
  let pw: number = 0.025 * this.player.width / this.pc;
  let ph: number = 0.025 * this.player.height / this.pc;
  let index: number = 0;
  
  // Проходимся в цикле по этим кусочкам.
  for (let i: number = 0; i < this.pc; ++i) 
  {
    for (let j: number = 0; j < this.pc; ++j) 
    {
      // Каждый будем считать отдельным объектом соответствующего класса со своим индексом.
      let pp : Phaser.Physics.Arcade.Sprite = this.playerPieces[index];  
      
      // Активируем объект.       
      pp.setActive(true).setVisible(true);

      // Настраиваем стартувую позицию.
      pp.setPosition(this.player.x + i*pw, this.player.y + j*ph);

      // Получаем случайную скорость по осям.
      let ix: number = Phaser.Math.FloatBetween(100, 300) - 200;
      let iy: number = Phaser.Math.FloatBetween(100, 300) - 200;           
      pp.setVelocity(ix, iy);

      // Настраваем случайное ускорение.
      pp.setAcceleration(-ix / Phaser.Math.FloatBetween(2, 4), -iy / Phaser.Math.FloatBetween(2, 4));
      
      // Увеличиваем индекс.
      index++;
    }
  }
   // Через несколько секунд вызываем метод конца игры.
   this.time.delayedCall(2500, this.gameOver, [], this);
}

// Метод обрабатывающий конец игры.
gameOver() 
{
  // Перезагружаем текущую сцену.
  this.scene.restart();
}

// Метод для инициализации показателя здровья.
initializeHealthUI() 
{
  // Создаём массив для спрайтов, являющихся индикаторами.
  this.healthSprites = [];
  
  // Проходимся в цикле по числу жизней.
  for (let i: number = 0; i < this.health; i ++) 
  {
    // На каждую добавляем в выбранное место спрайт.
    this.healthSprites[i] = this.physics.add.sprite(65 + i * 20, 28, "life").setScale(0.5,0.5);
  }
}

// Метод для обновления показателей здоровья.
updateHealthUI() 
{
  // Удаляем спрайт-индикатор, с индексом текущего числа жизней.
  this.healthSprites[this.health].destroy();
}

// Метод обрабатывающий столкновение астероида и снаряда.
collideLaserAsteroid(laser : Bullet, asteroid : Asteroid)
{
  // Если на сцене сейчас нету снаряда или астероида, то выходим.
  if (!laser.active) return;
  if (!asteroid.active) return;

  // При столкновении деактивируем объект-снаряд.
  laser.setActive(false).setVisible(false);

  // Добавляем очко и обновляем счёт.
  this.score += 1;
  this.scoreText.text = "Score: " + this.score;

  // Если размер астероида больше 3.
  if (asteroid.size >= 3)
  {
    // То просто деактивируем этот объект.
    asteroid.setActive(false).setVisible(false);
  }
  // Иначе.
  else
  {
    // Повышаем его размер на 1.
    asteroid.size+=1;

    // Создаём ещё один подобный астероид.      
    var t:number = Phaser.Math.Between(-50,50);
    var t2:number = Phaser.Math.Between(-50,50);
    asteroid.setSprite();
    (this.asteroids.get() as Asteroid).launch(asteroid.X,asteroid.Y,asteroid.size,t,Phaser.Math.Between(-50,50));
         
    asteroid.xdif=-t;
    asteroid.ydif=Phaser.Math.Between(-50,50);
  }
}

// Метод обрабатывающий столкновение астероида и снаряда.
collideBroadsideLaserAsteroid(broadsideLaser : LeftsideBullet, asteroid : Asteroid)
{
  // Если на сцене сейчас нету снаряда или астероида, то выходим.
  if (!broadsideLaser.active) return;
  if (!asteroid.active) return;

  // При столкновении деактивируем объект-снаряд.
  broadsideLaser.setActive(false).setVisible(false);

  // Добавляем очко и обновляем счёт.
  this.score += 1;
  this.scoreText.text = "Score: " + this.score;

  // Если размер астероида больше 3.
  if (asteroid.size >= 3)
  {
    // То просто деактивируем этот объект.
    asteroid.setActive(false).setVisible(false);
  }
  // Иначе.
  else
  {
    // Повышаем его размер на 1.
    asteroid.size+=1;

    // Создаём ещё один подобный астероид.      
    var t:number = Phaser.Math.Between(-50,50);
    var t2:number = Phaser.Math.Between(-50,50);
    asteroid.setSprite();
    (this.asteroids.get() as Asteroid).launch(asteroid.X,asteroid.Y,asteroid.size,t,Phaser.Math.Between(-50,50));
         
    asteroid.xdif=-t;
    asteroid.ydif=Phaser.Math.Between(-50,50);
  }
}



// Метод обрабатывающий нанесение урона щиту.
 shieldHit() 
 {
   // Деактивируем щит, делаем его невидимым и перезапускаем таймер.
   this.shieldActive = false;
   this.shield.setVisible(false);
   this.shieldTimer = this.shieldReloadTime;
 }
}