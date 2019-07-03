export class EnemyHolder 
{
  // {Honza}
  // Enemy variables to customise them and their beavior

  // Name of the sprite
  spriteName:string = null;

  // Update function
  updateFunction:(x:number, y:number)=>void = null;

  constructor (_name:string, _updateFunction:(x:number, y:number)=>void) 
  {
    this.spriteName = _name;
    this.updateFunction = _updateFunction;
   }

}