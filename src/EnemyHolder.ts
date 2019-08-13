export class EnemyHolder 
{
  spriteName: string = null;

  updateFunction: (x: number, y: number) => void = null;

  constructor (_name: string, _updateFunction: (x: number, y: number) => void) 
  {
    this.spriteName = _name;
    this.updateFunction = _updateFunction;
  }
}