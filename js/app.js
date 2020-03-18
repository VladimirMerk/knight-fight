'use strict';
(() => {
  const VIEWPORT = document.getElementById('viewport')
  const LOGBOX = document.getElementById('logbox')

  class Camera extends EventTarget {
    constructor(viewport, options) {
      super();
      this.viewport = viewport;
      this.position = {
        x: 0,
        y: 0
      }
      this.velocity = {
        x: 0,
        y: 0
      }
      this.bounds = {
        xmin: (this.viewport.offsetWidth / 2),
        ymin: (this.viewport.offsetHeight / 2),
        xmax: 0,
        ymax: 0
      }
      // this.objects = options.objects;
      this.map = options.map;
      this.target = this.findTargetById(options.target);

      if (this.map) {
        this.bounds.xmax = this.map.width - (this.viewport.offsetWidth / 2) + 6;
        this.bounds.ymax = this.map.height - (this.viewport.offsetHeight / 2) + 6;
        this.position.y = (this.map.height / 2);
        this.map.creatures.forEach(creature => {
          creature.addEventListener('hit', this.calculateHit.bind(this))
          creature.addEventListener('death', this.removeCreature.bind(this))
        });
      }

      this.timer = null;
      this.rps = 10 || 24; // redraw per second
      this.freeMove = false;
      this.elements = [];
      this.setCameraPosition();
      this.draw();
      this.calculates();
      this.addEventListener('keydown', this.onKeyDown.bind(this))
      this.addEventListener('keyup', this.onKeyUp.bind(this))
      this.motor();
    }
    draw () {
      this.calculateCollisions()

      if (this.map && ! this.elements.length) {
        const fragment = document.createDocumentFragment();
        this.viewport.innerHTML = "";
        this.map.draw().forEach(element => {
          fragment.appendChild(element)
          this.elements.push(element)
        });
        this.viewport.appendChild(fragment);
      }
      for (const element of this.elements) {
        const leftStyle = element.attributeStyleMap.get('margin-left') || { value: 0 }
        element.attributeStyleMap.set('margin-left', CSS.px(
           - this.position.x + (this.viewport.offsetWidth / 2)
        ));
        const topStyle = element.attributeStyleMap.get('margin-top') || { value: 0 }
        element.attributeStyleMap.set('margin-top', CSS.px(
           - this.position.y + (this.viewport.offsetHeight / 2)
        ));
      }
    }
    calculates () {
      toLog(`width: ${this.viewport.offsetWidth};\
             height: ${this.viewport.offsetHeight};\
             x: ${this.position.x};\
             y: ${this.position.y};`);
    }
    motor () {
      setInterval(() => {
        this.setCameraPosition()
      }, 1000 / this.rps);
    }
    stop () {
      clearInterval(this.timer);
      this.timer = null;
    }
    move(direction) {
      switch(direction) {
        case 'up':
          this.velocity.x = 0;
          if (this.velocity.y > 0) {
            this.velocity.y = 0;
          }
          this.velocity.y -= 2;
        break;
        case 'down':
          this.velocity.x = 0;
          if (this.velocity.y < 0) {
            this.velocity.y = 0;
          }
          this.velocity.y += 2;
        break;
        case 'right':
          this.velocity.y = 0;
          if (this.velocity.x < 0) {
            this.velocity.x = 0;
          }
          this.velocity.x += 2;
        break;
        case 'left':
          this.velocity.y = 0;
          if (this.velocity.x > 0) {
            this.velocity.x = 0;
          }
          this.velocity.x -= 2;
        break;
      }
    }
    slowDownVelocity() {
      if (this.velocity.x > 0) {
        this.velocity.x -= .1;
        if (this.velocity.x < 1) {
          this.velocity.x = 0;
        }
      } else if (this.velocity.x < 0) {
        this.velocity.x += .1;
        if (this.velocity.x > -1) {
          this.velocity.x = 0;
        }
      }
    }
    setCameraPosition() {

      if (this.freeMove) {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.slowDownVelocity()
      } else if (this.target) {
        this.position = this.getTargetPosition()
        // console.log(this.position)
      }

      if (this.position.x < this.bounds.xmin) {
        this.position.x = this.bounds.xmin;
      }
      if (this.position.x > this.bounds.xmax) {
        this.position.x = this.bounds.xmax;
      }
      if (this.position.y < this.bounds.ymin) {
        this.position.y = this.bounds.ymin;
      }
      if (this.position.y > this.bounds.ymax) {
        this.position.y = this.bounds.ymax;
      }
      this.draw();
    }
    getTargetPosition() {
      return this.target ? this.target.getPosition() : 0
    }
    onKeyDown(e) {
      switch (e.code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          this.freeMove = true;
        break;
      }
      if (this.freeMove) {
        switch (e.code) {
          case 'ArrowUp':
            this.move('up')
          break;
          case 'ArrowRight':
            this.move('right')
          break;
          case 'ArrowDown':
            this.move('down')
          break;
          case 'ArrowLeft':
            this.move('left')
          break;
        }
      }
    }
    onKeyUp(e) {
      switch (e.code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          this.freeMove = false;
          this.velocity.x = 0;
          this.velocity.y = 0;
        break;
      }
    }
    findTargetById(id) {
      if (! id || ! this.map) return null
      return this.map.creatures.find(creature => creature.id === id)
    }
    calculateCollisions() {
      const collisionsList = []
      this.map.creatures.forEach((creature) => {
        this.map.creatures.forEach((otherCreature) => {
          if (creature === otherCreature || collisionsList.includes(creature)) return
          let creatureBound = creature.element.getBoundingClientRect()
          creatureBound.x1 = creatureBound.x + creature.colissionWidth
          creatureBound.y1 = creatureBound.y + creatureBound.height
          let otherCreatureBound = otherCreature.element.getBoundingClientRect()
          otherCreatureBound.x1 = otherCreatureBound.x + otherCreature.colissionWidth
          otherCreatureBound.y1 = otherCreatureBound.y + otherCreatureBound.height
          const isColission = this.intersects(creatureBound, otherCreatureBound)
          creature.colission(isColission)
          if (isColission) {
            collisionsList.push(creature)
          }
        })
      })
      // for ()
      // console.log('calculateCollisions')
    }
    removeCreature(e) {
      const creature = e.target
      this.map.creatures.forEach((otherCreature, index) => {
        if (creature === otherCreature) {
          toLog(`${otherCreature.id} is killed`)
          this.map.creatures.splice(index, 1)
        }
      })
    }
    calculateHit(e) {
      const creature = e.target
      switch (e.detail.direction) {
        case 'right':
          this.map.creatures.forEach((otherCreature) => {
            if (creature === otherCreature) return
            let creatureBound = creature.element.getBoundingClientRect()
            creatureBound.x1 = creatureBound.x + creature.attackWidth
            creatureBound.y1 = creatureBound.y + creatureBound.height
            let otherCreatureBound = otherCreature.element.getBoundingClientRect()
            otherCreatureBound.x1 = otherCreatureBound.x + otherCreature.colissionWidth
            otherCreatureBound.y1 = otherCreatureBound.y + otherCreatureBound.height
            const colission = this.intersects(creatureBound, otherCreatureBound)
            if (colission.x > 0) {
              otherCreature.hit(e.detail.damage)
            }
          })
        break;
      }
    }
    intersects(a, b){
      return {
        x: (a.x1 >= b.x && a.x1 <= b.x1) ? 1 : (a.x >= b.x && a.x <= b.x1) ? -1 : 0,
        y: 0
      }
    }
  }

  class Creature extends EventTarget {
    constructor(id, {
      colissionWidth = 42,
      position = 10,
      speed = 6,
      attackWidth = 0,
      damage = 0,
      direction = 'left'
    } = {}) {

      super();
      this.id = id;
      this.actionValue = 'idle';
      this.colissionWidth = colissionWidth;
      this.attackWidth = attackWidth;
      this.damage = damage;
      this.colissionInfo = {x: 0, y: 0};
      this.speed = speed;
      this.position = position;
      this.direction = direction;
      this.hitPoints = 50;
      this.element = null;
      this.npc = true;
      this.ai = {
        counter: 0
      }
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
    colission(val) {
      this.colissionInfo = val;
      if (! this.element) return
      if (val.x || val.y) {
        this.element.classList.add('colission')
      } else {
        this.element.classList.remove('colission')
      }

    }
    get width() {
      const result = this.element ? this.element.computedStyleMap().get('width') : null
      return result ? result.value : 0
    }
    setCharElement() {
      this.element = document.createElement('div')
      this.element.classList.add('creature')
      this.element.classList.add(this.id)
      // this.element.setAttribute('id', this.id)
      this.element.attributeStyleMap.set('left', CSS.px(this.position))
      this.element.attributeStyleMap.set('bottom', CSS.px(6))
      this.element.addEventListener('animationiteration', this.onAnimationIteration.bind(this))
      this.element.addEventListener('animationend', this.onAnimationIteration.bind(this))
      this.element.dataset.direction = this.direction
    }
    setDirectionLeft() {
      this.setDirection('left')
    }
    setDirectionRight() {
      this.setDirection('right')
    }
    setDirection(direction) {
      if (! this.element) return
      this.direction = direction
      this.element.dataset.direction = this.direction
    }
    onAnimationIteration(e) {
      let type = e.animationName.split('-')[0]
      switch (type) {
        case 'attack':
          this.dispatchEvent(new CustomEvent('hit', { detail: { direction: this.direction, damage: this.damage } }));
          break;
        case 'damaged':
          if (!this.element) return
          this.element.classList.remove('damaged')
          break;
        case 'death':
          this.element.remove();
          this.dispatchEvent(new CustomEvent('death'));
          break;
      }
      // console.log('Animation end', e)
    }
    hit(damage) {
      toLog(`hit on ${this.id} at ${damage}HP`)
      this.hitPoints -= damage;
      if (this.hitPoints <= 0) {
        this.setAction('death')
      } else {
        if (! this.element) return
        this.element.classList.add('damaged')
      }
    }
    draw() {
      return [this.element];
    }
    updateCharElement() {
      if (! this.element) return
      this.element.attributeStyleMap.set('left', CSS.px(this.position))
      this.element.dataset.action = this.actionValue;
    }
    getPosition() {
      if (! this.element) return {x: 0, y: 0}
      // const offset = this.map.getOffset()
      const offset = {left: 0, top: 0};
      return { x: offset.left + parseInt(this.element.offsetLeft, 10), y: offset.top + parseInt(this.element.offsetTop, 10) }
    }
    setAction(action) {
      // this.action = action;
      if (action !== this.actionValue) {
        this.actionValue = action
      }
    }
    releaseAction() {
      this.actionValue = 'idle';
    }
    walkRight() {
      if (this.colissionInfo.x > 0) return
      this.position += this.speed;
      // this.maxPosition = (this.map.width - 6 - this.width);
      this.maxPosition = 500;
      if (this.position > this.maxPosition) {
        this.position = this.maxPosition;
      }
    }
    walkLeft() {
      if (this.colissionInfo.x < 0) return
        this.position -= this.speed;
        if (this.position < this.minPosition) {
          this.position = this.minPosition;
        }
    }
    onAction() {
      if (this.npc) {
        this.aiController()
      }
      switch (this.actionValue) {
        case 'attack':

          break;
        case 'walk':
          switch (this.direction) {
            case 'left':
              this.walkLeft()
              break;
            case 'right':
              this.walkRight()
              break;
          }
          break;
        default:
          break;
      }
      this.updateCharElement()
    }

    aiController() {
      // Нужно следить кто находится слева, а кто справа, так же учитывать
      // расстояние
      // Если враг, идти к врагу и атаковать. Если друг, просто ходить
      // Если крайний идёт к врагу, тоже идти к врагу
      //
      // this.ai.counter += 1;
      // if (this.ai.counter % 100 < 50) {
      //   this.setDirectionLeft()
      // } else {
      //   this.setDirectionRight()
      // }
      // this.actionValue = 'walk'
    }
  }

  class Player extends Creature {
    constructor(...args) {
      super(...args);
      this.npc = false;
      this.isShift = false;
      // this.creatureObject = creatureObject
      this.addEventListener('keydown', this.onKeyDown.bind(this))
      this.addEventListener('keyup', this.onKeyUp.bind(this))
    }
    // draw () {
      // return this.creatureObject.draw()
    // }
    // getPosition () {
      // return this.creatureObject.getPosition()
    // }
    onKeyDown(e) {
      // console.log('onKeyDown', e)
      switch (e.code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isShift = true;
        break;
      }
      if (! this.isShift) {
        switch (e.code) {
          case 'ArrowRight':
            // this.creatureObject.moveRight()
            this.setDirectionRight()
            this.setAction('walk')
          break;
          case 'ArrowDown':
            this.setAction('set-shield')
          break;
          case 'ArrowLeft':
            this.setDirectionLeft()
            this.setAction('walk')
            // this.creatureObject.setAction('walk-left')
          break;
          case 'Space':
            this.setAction('attack')
          break;
        }
      }
    }
    onKeyUp(e) {
      this.releaseAction()
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
      for(let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
        const element = document.createElement('div');
        element.classList.add('сhandelier');
        element.attributeStyleMap.set('left', CSS.px(300 + (i * 90)));
        this.element.appendChild(element)
      }

      for(let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
        const element = document.createElement('div');
        element.classList.add('window');
        element.attributeStyleMap.set('left', CSS.px(100 + (i * 90)));
        element.attributeStyleMap.set('top', CSS.px(this.height / 2 - 100));
        this.element.appendChild(element)
      }
    }
    draw() {
      return this.element;
    }
  }

  class Map {
    constructor(creatures) {
      this.rooms = [new Room(), new Room(), new Room(), new Room()]
      this.width = 0;
      this.height = 0;
      this.creatures = creatures;
      this.draw();
    }
    draw() {
      let maxWidth = 0;
      // const fragment = document.createDocumentFragment()
      const elements = []
      for (const [index, room] of this.rooms.entries()) {
        const roomElement = room.draw();
        if (index === 0) {
          roomElement.classList.add('left-wall');
        }
        if (index === this.rooms.length - 1){
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
        creature.draw().forEach(element => {
          elements.push(element)
        });
      }

      return elements;
    }
    getOffset() {
      return {
        left: Math.abs(parseInt(this.rooms[0].element.offsetLeft) || 0),
        top:  Math.abs(parseInt(this.rooms[0].element.offsetTop) || 0),
      }
    }
  }

  const creatures = []
  function registerCreature(id, options = {}) {
    creatures.push(new Creature(id, options));
    return creatures[creatures.length - 1];
  }
  function registerPlayer(id, options = {}) {
    creatures.push(new Player(id, options));
    return creatures[creatures.length - 1];
  }

  const player = registerPlayer('knight', {
    colissionWidth: 90,
    damage: 5,
    attackWidth: 132,
    direction: 'right'
  })

  // registerCreature('box', { position: 180 })

  registerCreature('zombie', {
    position: 180,
    colissionWidth: 54,
    damage: 5,
    attackWidth: 72,
    speed: 1.5
  })

  const mainCamera = new Camera(VIEWPORT, {
    map: new Map(creatures),
    target: 'knight'
  })
  console.log('mainCamera', mainCamera)

  // VIEWPORT.appendChild(map.draw())

  function onDown(e) {
  //   if (e.isTrusted) {
  //     if (e.target.dataset.keycode) {
  //       e.code = e.target.dataset.keycode
  //       onKeydown(e)
  //     }
  //   }
  }

  function onUp(e) {
  //   if (e.isTrusted) {
  //     if (e.target.dataset.keycode) {
  //       e.code = e.target.dataset.keycode
  //       onKeyup(e)
  //     }
  //   }
  }

  function onKeydown(e) {
    if (e.isTrusted) {
      const new_e = new KeyboardEvent("keydown", {bubbles : false, cancelable : false, code : e.code});
      mainCamera.dispatchEvent(new_e);
      player.dispatchEvent(new_e);
    }
  }

  function onKeyup(e) {
    if (e.isTrusted) {
      const new_e = new KeyboardEvent("keyup", {bubbles : false, cancelable : false, code : e.code});
      mainCamera.dispatchEvent(new_e);
      player.dispatchEvent(new_e);
    }
  }

  toLog(`Hello! I'm a message console!`)

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('keyup', onKeyup)
  //
  // document.addEventListener('mousedown', onDown)
  // document.addEventListener('mouseup', onUp)
  //
  // document.addEventListener('touchstart', onDown)
  // document.addEventListener('touchend', onUp)

  function toLog(...args) {
    const message = args.map((e) => JSON.stringify(e)).join(" ");
    LOGBOX.prepend(document.createTextNode(message))
    LOGBOX.prepend(document.createElement("br"))
  }

  function fromMultiple(...args) {
    const constructors = [];
    class Class {
      constructor(...opts) {
        for (const arg of args) {
          const props = Object.getOwnPropertyNames(arg.prototype);

          for (const prop of props) {
            if (prop === 'constructor') {
              constructors.push(arg.prototype.constructor);
            } else {
              Class.prototype[prop] = arg.prototype[prop];
            }
          }
          for (const constructor of constructors) {
            Object.assign(Class.prototype, new constructor(...opts));
          }

        }
      }
    }
    return Class;
  }




})()
