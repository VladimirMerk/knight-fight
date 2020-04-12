import Creature from './creature';

class Player extends Creature {
  constructor(...args) {
    super(...args);
    this.group = 1;
    this.speed = 3;
    this.npc = false;
    this.isShift = false;
    console.log('Player constructor');
    // this.creatureObject = creatureObject
    this.addEventListener('keydown', this.onKeyDown.bind(this));
    this.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  // draw () {
  // return this.creatureObject.draw()
  // }
  // getPosition () {
  // return this.creatureObject.getPosition()
  // }
  onKeyDown(e) {
    console.log('onKeyDown', e);
    switch (e.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isShift = true;
        break;
    }
    if (!this.isShift) {
      switch (e.code) {
        case 'ArrowRight':
          // this.creatureObject.moveRight()
          this.setDirectionRight();
          this.setAction('walk');
          break;
        case 'ArrowDown':
          this.setAction('set-shield');
          break;
        case 'ArrowLeft':
          this.setDirectionLeft();
          this.setAction('walk');
          // this.creatureObject.setAction('walk-left')
          break;
        case 'Space':
          this.setAction('attack');
          break;
      }
    }
  }
  onKeyUp(e) {
    this.releaseAction();
    switch (e.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isShift = false;
        break;
    }
  }
}

class Room {
  constructor() {
    this.height = 300;
    this.width = 500;
    this.element = this.create();
    this.objects = null;
    this.generationDecorations();
  }
  create() {
    const element = document.createElement('div');
    element.classList.add('room');
    element.attributeStyleMap.set('width', CSS.px(this.width));
    element.attributeStyleMap.set('height', CSS.px(this.height));
    return element;
  }
  generationDecorations() {
    for (let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
      const element = document.createElement('div');
      element.classList.add('сhandelier');
      element.attributeStyleMap.set('left', CSS.px(300 + i * 90));
      this.element.appendChild(element);
    }

    for (let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
      const element = document.createElement('div');
      element.classList.add('window');
      element.attributeStyleMap.set('left', CSS.px(100 + i * 90));
      element.attributeStyleMap.set('top', CSS.px(this.height / 2 - 100));
      this.element.appendChild(element);
    }
  }
  draw() {
    return this.element;
  }
}

class Map {
  constructor(creatures) {
    this.rooms = [new Room(), new Room(), new Room(), new Room()];
    this.width = 0;
    this.height = 0;
    this.creatures = creatures;
    this.draw();
  }
  loop() {
    this.setCreaturesNeighbor();
  }
  setCreaturesNeighbor() {
    this.creatures.forEach((creature) =>
      creature.updateNeihbors(this.creatures)
    );
  }
  draw() {
    let maxWidth = 0;
    // const fragment = document.createDocumentFragment()
    const elements = [];
    for (const [index, room] of this.rooms.entries()) {
      const roomElement = room.draw();
      if (index === 0) {
        roomElement.classList.add('left-wall');
      }
      if (index === this.rooms.length - 1) {
        roomElement.classList.add('right-wall');
      }
      roomElement.attributeStyleMap.set('left', CSS.px(maxWidth));
      // fragment.appendChild(roomElement);
      elements.push(roomElement);
      maxWidth += room.width;

      this.height = this.height < room.height ? room.height : this.height;
    }
    this.height += 6;
    this.width = maxWidth;

    for (const creature of Object.values(this.creatures)) {
      creature.draw().forEach((element) => {
        elements.push(element);
      });
    }

    return elements;
  }
  getOffset() {
    return {
      left: Math.abs(parseInt(this.rooms[0].element.offsetLeft) || 0),
      top: Math.abs(parseInt(this.rooms[0].element.offsetTop) || 0),
    };
  }
}

export default Player;
