import Creature from './Creature';

class Player extends Creature {
  constructor(...args) {
    super(...args);
    this.group = 1;
    this.speed = 3;
    this.npc = false;
    this.isShift = false;

    this.addEventListener('keydown', this.onKeyDown.bind(this));
    this.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isShift = true;
        return;
      default:
        break;
    }

    if (this.isShift) {
      return;
    }

    switch (e.code) {
      case 'ArrowRight':
        this.setDirectionRight();
        this.setAction('walk');
        break;
      case 'ArrowLeft':
        this.setDirectionLeft();
        this.setAction('walk');
        break;
      case 'ArrowDown':
        this.setAction('set-shield');
        break;
      case 'Space':
        this.setAction('attack');
        break;
      default:
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isShift = false;
        break;
      default:
        this.releaseAction();
        break;
    }
  }
}

export default Player;
