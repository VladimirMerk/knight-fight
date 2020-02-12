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
      this.objects = options.objects;
      this.target = player;

      if (this.objects.map) {
        this.bounds.xmax = this.objects.map.width - (this.viewport.offsetWidth / 2) + 6;
        this.bounds.ymax = this.objects.map.height - (this.viewport.offsetHeight / 2) + 6;
        this.position.y = (this.objects.map.height / 2);
      }

      this.timer = null;
      this.rps = 24; // redraw per second
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
      if (! this.elements.length) {
        const fragment = document.createDocumentFragment();
        for (const object of Object.values(this.objects)) {
          // Условие
          // Если объект попадает в кадр
          // const objectFragment = object.draw()
          // fragment.appendChild(objectFragment);
          // this.elements.push(objectFragment);

          object.draw().forEach(element => {
            fragment.appendChild(element)
            this.elements.push(element)
          });
          // const elements = object.draw()
          // console.log('elements', ...elements)
          // fragment.appendChild(...elements);
          // this.elements.push(...elements);
        }
        this.viewport.innerHTML = "";
        console.log('fragment', fragment.children)
        this.viewport.appendChild(fragment);
        // this.calculates ()
      }


      for (const element of this.elements) {
      // Условие
      // Если объект попадает в кадр
        // for (const element of objectFragment.children) {
          const leftStyle = element.attributeStyleMap.get('margin-left') || { value: 0 }
          element.attributeStyleMap.set('margin-left', CSS.px(
             - this.position.x + (this.viewport.offsetWidth / 2)
          ));
          const topStyle = element.attributeStyleMap.get('margin-top') || { value: 0 }
          element.attributeStyleMap.set('margin-top', CSS.px(
             - this.position.y + (this.viewport.offsetHeight / 2)
          ));
        // }
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
      }, 1000 / this.fps);
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
      return this.target.getPosition()
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
  }

  class Creature {
    constructor(id, map) {
      this.id = id;
      this.actionValue = 'idle';
      this.speed = 6;
      this.position = 10;
      this.element = null;
      this.map = map;
      this.setCharElement();
      this.minPosition = 6;
      this.maxPosition = (this.map.width - 6 - this.width * 2);
      this.actionTimer = setInterval(this.onAction.bind(this), 50);
    }
    // get left(){
    //   const result = this.element.attributeStyleMap.get('left')
    //   return result ? result.value : 0
    // }
    // get offsetLeft(){
    //   return this.element.offsetLeft
    // }
    get width() {
      const result = this.element.computedStyleMap().get('width')
      return result ? result.value : 0
    }
    setCharElement() {
      this.element = document.createElement('div')
      this.element.classList.add(this.id)
      this.element.setAttribute('id', this.id)
      this.element.attributeStyleMap.set('left', CSS.px(this.position))
      this.element.attributeStyleMap.set('bottom', CSS.px(6))
    }
    draw() {
      // const fragment = document.createDocumentFragment();
      // fragment.appendChild(this.element);
      // return fragment;
      return [this.element];
    }
    updateCharElement() {
      this.element.attributeStyleMap.set('left', CSS.px(this.position))
      this.element.dataset.action = this.actionValue;
    }
    getPosition() {
      const offset = this.map.getOffset()
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
      this.position += this.speed;
      this.maxPosition = (this.map.width - 6 - this.width);
      if (this.position > this.maxPosition) {
        this.position = this.maxPosition;
      }
    }
    walkLeft() {
        this.position -= this.speed;
        if (this.position < this.minPosition) {
          this.position = this.minPosition;
        }
    }
    onAction() {
      switch (this.actionValue) {
        case 'attack-right':

          break;
        case 'walk-right':
          this.walkRight()
          break;
        case 'walk-left':
          this.walkLeft()
          break;
        default:
          break;
      }
      this.updateCharElement()
    }
  }

  class Player extends EventTarget {
    constructor(creatureObject) {
      super()
      this.isShift = false;
      this.creatureObject = creatureObject
      this.addEventListener('keydown', this.onKeyDown.bind(this))
      this.addEventListener('keyup', this.onKeyUp.bind(this))
    }
    draw () {
      return this.creatureObject.draw()
    }
    getPosition () {
      return this.creatureObject.getPosition()
    }
    onKeyDown(e) {
      console.log(e)
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
            this.creatureObject.setAction('walk-right')
          break;
          case 'ArrowDown':
            this.creatureObject.setAction('set-shield')
          break;
          case 'ArrowLeft':
            this.creatureObject.setAction('walk-left')
            // this.creatureObject.setAction('walk-left')
          break;
          case 'Space':
            this.creatureObject.setAction('attack-right')
          break;
        }
      }
    }
    onKeyUp(e) {
      this.creatureObject.releaseAction()
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
    constructor() {
      this.map = [new Room(), new Room(), new Room(), new Room()]
      this.width = 0;
      this.height = 0;
      this.draw();
    }
    draw() {
      let maxWidth = 0;
      // const fragment = document.createDocumentFragment()
      const elements = []
      for (const [index, room] of this.map.entries()) {
        const roomElement = room.draw();
        if (index === 0) {
          roomElement.classList.add('left-wall');
        }
        if (index === this.map.length - 1){
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
      // return fragment;
      return elements;
    }
    getOffset() {
      return {
        left: Math.abs(parseInt(this.map[0].element.offsetLeft) || 0),
        top:  Math.abs(parseInt(this.map[0].element.offsetTop) || 0),
      }
    }
  }

  const map = new Map()
  const player = new Player( new Creature('player', map) )
  const mainCamera = new Camera(VIEWPORT, {
    objects: {
      map,
      player
    },
    target: player
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
