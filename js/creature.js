import SharedMethods from './sharedMethods';

class Creature extends EventTarget {
  constructor(
    id,
    {
      colissionWidth = 42,
      position = 10,
      speed = 0,
      attackWidth = 0,
      group = 0,
      damage = 0,
      direction = 'left',
    } = {}
  ) {
    super();
    this.id = id;
    this.actionValue = 'idle';
    this.colissionWidth = colissionWidth;
    this.attackWidth = attackWidth;
    this.damage = damage;
    this.colissionInfo = { x: 0, y: 0 };
    this.speed = speed;
    this.position = position;
    this.direction = direction;
    this.group = group; // 0 - neutral; 1 - player; 2 - aggressive to player; 3 - aggressive to all
    this.hitPoints = 50;
    this.element = null;
    this.npc = true;
    this.neighbors = {
      left: null,
      right: null,
    };
    this.ai = {
      counter: 0,
      // behavior: 'walking',
      mode: 'idle',
    };
    // this.map = null;
    this.setCharElement();
    this.setDirection(direction);
    // this.minPosition = 6;
    // this.maxPosition = (this.map.width - 6 - this.width * 2);
    this.minPosition = 6;
    this.maxPosition = 500;
    this.actionTimer = setInterval(this.onAction.bind(this), 50);
  }
  // get left(){
  //   const result = this.element.attributeStyleMap.get('left')
  //   return result ? result.value : 0
  // }
  // get offsetLeft(){
  //   return this.element.offsetLeft
  // }
  // colission(val) {
  //   this.colissionInfo = val;
  //   if (! this.element) return
  //   if (val.x || val.y) {
  //     this.element.classList.add('colission')
  //   } else {
  //     this.element.classList.remove('colission')
  //   }
  // }

  get width() {
    const result = this.element
      ? this.element.computedStyleMap().get('width')
      : null;
    return result ? result.value : 0;
  }
  setCharElement() {
    this.element = document.createElement('div');
    this.element.classList.add('creature');
    this.element.classList.add(this.id);
    // this.element.setAttribute('id', this.id)
    this.element.attributeStyleMap.set('left', CSS.px(this.position));
    this.element.attributeStyleMap.set('bottom', CSS.px(6));
    this.element.addEventListener(
      'animationiteration',
      this.onAnimationIteration.bind(this)
    );
    this.element.addEventListener(
      'animationend',
      this.onAnimationIteration.bind(this)
    );
    this.element.dataset.direction = this.direction;
  }
  setDirectionLeft() {
    this.setDirection('left');
  }
  setDirectionRight() {
    this.setDirection('right');
  }
  setDirection(direction) {
    if (!this.element) return;
    this.direction = direction;
    this.element.dataset.direction = this.direction;
  }
  onAnimationIteration(e) {
    let type = e.animationName.split('-')[0];
    switch (type) {
      case 'attack':
        this.dispatchEvent(
          new CustomEvent('hit', {
            detail: { direction: this.direction, damage: this.damage },
          })
        );
        break;
      case 'damaged':
        if (!this.element) return;
        this.element.classList.remove('damaged');
        break;
      case 'death':
        this.element.remove();
        this.dispatchEvent(new CustomEvent('death'));
        break;
    }
    // console.log('Animation end', e)
  }
  hit(damage) {
    toLog(`hit on ${this.id} at ${damage}HP`);
    this.hitPoints -= damage;
    if (this.hitPoints <= 0) {
      this.setAction('death');
    } else {
      if (!this.element) return;
      this.element.classList.add('damaged');
    }
  }
  draw() {
    return [this.element];
  }
  updateCharElement() {
    if (!this.element) return;
    this.element.attributeStyleMap.set('left', CSS.px(this.position));
    this.element.dataset.action = this.actionValue;
  }

  isColission(colissionWidth = 0) {
    if (this.neighbors[this.direction] === null) return false;
    let creatureBound = this.element.getBoundingClientRect();
    creatureBound.x1 = creatureBound.x + colissionWidth || this.colissionWidth;
    // creatureBound.y1 = creatureBound.y + creatureBound.height
    const otherCreature = this.neighbors[this.direction].creature;
    let otherCreatureBound = otherCreature.element.getBoundingClientRect();
    otherCreatureBound.x1 = otherCreatureBound.x + otherCreature.colissionWidth;
    // otherCreatureBound.y1 = otherCreatureBound.y + otherCreatureBound.height
    const isIntersect = SharedMethods.intersects(
      creatureBound,
      otherCreatureBound
    );
    // Only horizontal
    return isIntersect.x;
  }

  updateNeihbors(creatures) {
    this.neighbors.left = null;
    this.neighbors.right = null;

    for (const otherCreature of creatures) {
      if (this === otherCreature) continue;
      // if (
      //   this.neighbors.left !== null
      //   && this.neighbors.right !== null
      // ) {
      //   break;
      // }

      const leftDistance = this.position - otherCreature.position;
      const rightDistance = otherCreature.position - this.position;
      otherCreature.position - this.position;

      if (
        otherCreature.position < this.position &&
        (this.neighbors.left === null ||
          leftDistance < this.neighbors.left.distance)
      ) {
        this.neighbors.left = {
          distance: leftDistance,
          creature: otherCreature,
        };
      } else if (
        otherCreature.position >= this.position &&
        (this.neighbors.right === null ||
          rightDistance < this.neighbors.right.distance)
      ) {
        this.neighbors.right = {
          distance: rightDistance,
          creature: otherCreature,
        };
      }
    }
    // if (this.id === 'knight') {
    // console.log('left', this.neighbors.left, this.neighbors.right)
    // }
  }
  getPosition() {
    if (!this.element) return { x: 0, y: 0 };
    return {
      x: parseInt(this.element.offsetLeft, 10),
      y: parseInt(this.element.offsetTop, 10),
    };
  }
  setAction(action) {
    // this.action = action;
    if (action !== this.actionValue) {
      this.actionValue = action;
    }
  }
  releaseAction() {
    this.actionValue = 'idle';
  }
  walkRight() {
    if (this.isColission()) return;
    this.position += this.speed;
  }
  walkLeft() {
    if (this.isColission()) return;
    this.position -= this.speed;
  }
  onAction() {
    if (this.npc) this.aiController();
    switch (this.actionValue) {
      case 'attack':
        break;
      case 'walk':
        switch (this.direction) {
          case 'left':
            this.walkLeft();
            break;
          case 'right':
            this.walkRight();
            break;
        }
        break;
      default:
        break;
    }
    this.updateCharElement();
  }

  aiController() {
    if (this.hitPoints <= 0 || this.actionValue === 'death') return;
    // Нужно следить кто находится слева, а кто справа, так же учитывать
    // расстояние
    // Если враг, идти к врагу и атаковать. Если друг, просто ходить
    // Если крайний идёт к врагу, тоже идти к врагу

    const neighbor = this.neighbors[this.direction];
    switch (this.ai.mode) {
      case 'attack':
        this.setAction('attack');
        this.ai.mode = 'idle';
        return;
        break;
      case 'move':
        if (neighbor === null || neighbor.distance > 100) {
          this.ai.mode = 'idle';
          return;
        } else if (neighbor.distance <= this.attackWidth) {
          this.ai.mode = 'attack';
          return;
        } else {
          this.setAction('walk');
        }
        break;
      case 'idle':
        if (
          neighbor !== null &&
          neighbor.distance <= 100 &&
          (neighbor.creature.group === 1 ||
            (this.group === 3 && neighbor.creature.group !== 3))
        ) {
          this.ai.mode = 'move';
          return;
        }

        this.ai.counter += 1;
        if (this.ai.counter % 100 < 50) {
          this.setDirectionLeft();
        } else {
          this.setDirectionRight();
        }

        this.setAction('walk');

        break;
    }
  }
}

export default Creature;
