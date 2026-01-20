import SharedMethods from './sharedMethods';

class Creature extends EventTarget {
  constructor(
    clreatureClass,
    {
      id = null,
      colissionWidth = 42,
      detectDistance = 300,
      position = 10,
      speed = 1,
      attackWidth = 50,
      group = 0,
      damage = 0,
      direction = 'left',
      actions = {},
    } = {}
  ) {
    super();
    this.class = clreatureClass;
    console.log('CREATE', clreatureClass);
    this.id = id;
    this.actionValue = 'idle';
    this.colissionWidth = colissionWidth;
    this.attackWidth = attackWidth;
    this.detectDistance = detectDistance;
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
      mode: 'move',
    };
    // this.map = null;
    this.setCharElement();
    this.setDirection(direction);
    // this.minPosition = 6;
    // this.maxPosition = (this.map.width - 6 - this.width * 2);
    this.minPosition = 6;
    this.maxPosition = 500;
    this.actionTimer = setInterval(this.onAction.bind(this), 50);
    this.actions = actions;
    this.aiCounters = {
      idle: 0,
      wander: 0,
    };
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
    this.element.classList.add(this.class);
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
  setDirection(direction) {
    if (!this.element) return;
    this.direction = direction;
    this.element.dataset.direction = this.direction;
  }

  setDirectionLeft() {
    this.setDirection('left');
  }

  setDirectionRight() {
    this.setDirection('right');
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
    // блок щитом
    if (this.actionValue === 'set-shield') {
      console.log(`${this.id} blocked ${damage} damage`);
      return;
    }

    console.log(`hit on ${this.id} at ${damage}HP`);
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
    const width = colissionWidth || this.colissionWidth;
    creatureBound.x1 = creatureBound.x + width;

    const otherCreature = this.neighbors[this.direction].creature;
    let otherCreatureBound = otherCreature.element.getBoundingClientRect();
    otherCreatureBound.x1 = otherCreatureBound.x + otherCreature.colissionWidth;

    const isIntersect = SharedMethods.intersects(
      creatureBound,
      otherCreatureBound
    );
    // Только горизонталь
    return isIntersect.x;
  }

  updateNeighbors(creatures) {
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
    if (this.id == 'box-2') {
      console.log('this.position', this.position, this.speed);
    }
  }
  walkLeft() {
    if (this.isColission()) return;
    this.position -= this.speed;
  }
  onAction() {
    if (this.npc) this.aiController();
    if (this.id == 'box-2') {
      console.log('onAction', this.actionValue, this.direction);
    }
    switch (this.actionValue) {
      case 'attack':
        break;
      case 'defend':
        break;
      case 'walk':
        switch (this.direction) {
          case 'left':
            this.walkLeft();
            break;
          case 'right':
            if (this.id == 'box-2') {
              console.log('walkRight');
            }
            this.walkRight();
            break;
        }
        break;
      case 'idle':
      default:
        break;
    }
    this.updateCharElement();
  }

    aiController() {
    if (!this.actions || !this.actions.move) return;
    if (this.hitPoints <= 0 || this.actionValue === 'death') return;

    const candidates = [];

    const tryAddTarget = (neighbor, side) => {
      if (!neighbor) return;
      const other = neighbor.creature;
      if (!other || other === this) return;

      // враг — любой, у кого другая группа
      if (other.group === this.group) return;

      candidates.push({
        side,
        distance: neighbor.distance,
        creature: other,
      });
    };

    tryAddTarget(this.neighbors.left, 'left');
    tryAddTarget(this.neighbors.right, 'right');

    if (candidates.length > 0) {
      // ближайшая цель (сначала будет ящик, потом после его смерти — рыцарь)
      candidates.sort((a, b) => a.distance - b.distance);
      const target = candidates[0];

      this.setDirection(target.side);

      const dist = target.distance;
      const targetWidth = target.creature.colissionWidth || 0;

      // расстояние, при котором "тела" соприкасаются
      const attackDist = this.colissionWidth + targetWidth;

      if (dist <= attackDist) {
        // вплотную — бьём
        this.setAction('attack');
        return;
      }

      if (dist <= this.detectDistance) {
        // видим цель — идём к ней
        this.setAction('walk');
        return;
      }
    }

    // врагов рядом нет — базовое поведение
    if (this.actions.move === 'wander') {
      this.aiCounters.wander++;
      if (this.aiCounters.wander >= 50) {
        this.aiCounters.wander = 0;
        this.setDirection(this.direction === 'left' ? 'right' : 'left');
      }
      this.setAction('walk');
    } else if (this.actions.move === 'idle') {
      this.aiCounters.idle++;
      if (this.aiCounters.idle >= 50) {
        this.aiCounters.idle = 0;
        this.setDirection(this.direction === 'left' ? 'right' : 'left');
      }
      this.setAction('idle');
    } else {
      this.setAction('idle');
    }
  }
}

export default Creature;
