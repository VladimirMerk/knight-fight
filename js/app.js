'use strict';
(() => {
  const VIEWPORT = document.getElementById('viewport')
  const LOGBOX = document.getElementById('logbox')

  class Camera extends EventTarget {
    constructor(viewport, objects) {
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
      this.objects = objects;

      if (this.objects.map) {
        this.bounds.xmax = this.objects.map.width - (this.viewport.offsetWidth / 2) + 6;
        this.bounds.ymax = this.objects.map.height - (this.viewport.offsetHeight / 2) + 6;
        this.position.y = (this.objects.map.height / 2);
      }

      this.timer = null;
      this.rps = 1; // redraw per second
      this.freeMove = false;
      this.setCameraPosition();
      this.draw();
      this.calculates();
      this.addEventListener('keydown', this.onKeyDown.bind(this))
      this.addEventListener('keyup', this.onKeyUp.bind(this))
      // this.motor();
    }
    draw () {
      const fragment = document.createDocumentFragment();
      for (const object of Object.values(this.objects)) {
        // console.log('object', object)
        // Условие
        // Если объект попадает в кадр
        const objectFragment = object.draw()
        for (const element of objectFragment.children) {
          const leftStyle = element.attributeStyleMap.get('margin-left') || { value: 0 }
          element.attributeStyleMap.set('margin-left', CSS.px(
             - this.position.x + (this.viewport.offsetWidth / 2)
          ));
          const topStyle = element.attributeStyleMap.get('margin-top') || { value: 0 }
          element.attributeStyleMap.set('margin-top', CSS.px(
             - this.position.y + (this.viewport.offsetHeight / 2)
          ));
        }
        fragment.appendChild(objectFragment);
      }
      const div = document.createElement('div')

      div.style.position = 'absolute';
      div.style.top = '50%';
      div.style.left = '50%';
      div.style.width = '2px';
      div.style.height = '2px';
      div.style.marginLeft = '0px';
      div.style.marginTop = '0px';
      div.style.backgroundColor = '#f00';
      fragment.appendChild(div);
      this.viewport.innerHTML = "";
      this.viewport.appendChild(fragment);
      this.calculates ()
    }
    calculates () {
      toLog(`width: ${this.viewport.offsetWidth};\
             height: ${this.viewport.offsetHeight};\
             x: ${this.position.x};\
             y: ${this.position.y};`);
    }
    motor () {
      setInterval(this.draw.bind(this), 1000 / this.fps);
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
          this.velocity.y -= 1;
        break;
        case 'down':
          this.velocity.x = 0;
          if (this.velocity.y < 0) {
            this.velocity.y = 0;
          }
          this.velocity.y += 1;
        break;
        case 'right':
          this.velocity.y = 0;
          if (this.velocity.x < 0) {
            this.velocity.x = 0;
          }
          this.velocity.x += 1;
        break;
        case 'left':
          this.velocity.y = 0;
          if (this.velocity.x > 0) {
            this.velocity.x = 0;
          }
          this.velocity.x -= 1;
        break;
      }
      this.setCameraPosition()
      this.draw();
    }
    setCameraPosition() {
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y

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
      // if (this.position.y > this.bounds.ymin) {
      //   this.position.y = this.bounds.ymin;
      // }

      // if (this.position.y < -this.bounds.ymax) {
      //   this.position.y = -this.bounds.ymax;
      // }
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
        break;
      }
    }
  }

  class Creature {
    constructor(id) {
      this.id = id;
      this.actionValue = 'idle';
      this.speed = 6;
      this.position = 10;
      this.element = null;
      this.setCharElement();
      this.actionTimer = setInterval(this.onAction.bind(this), 50);
    }
    get left(){
      const result = this.element.attributeStyleMap.get('left')
      return result ? result.value : 0
    }
    get offsetLeft(){
      return this.element.offsetLeft
    }
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
      const fragment = document.createDocumentFragment();
      fragment.appendChild(this.element);
      return fragment;
    }
    updateCharElement() {
      this.element.attributeStyleMap.set('left', CSS.px(this.position))
      this.element.dataset.action = this.actionValue;
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
    onAction() {
      switch (this.actionValue) {
        case 'attack-right':

          break;
        case 'walk-right':
          this.position += this.speed;
          break;
        case 'walk-left':
          this.position -= this.speed;
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
      this.map = [new Room(), new Room(), new Room()]
      this.width = 0;
      this.height = 0;
      // this.player = player;
      // this.playerPosition = this.player.left;
      // this.player.addEventListener('playerMove', this.onPlayerMove.bind(this));
      this.draw();
    }
    draw() {
      let maxWidth = 0;
      const fragment = document.createDocumentFragment()
      for (const [index, room] of this.map.entries()) {
        const roomElement = room.draw();
        if (index === 0) {
          roomElement.classList.add('left-wall');
        }
        if (index === this.map.length - 1){
          roomElement.classList.add('right-wall');
        }
        roomElement.attributeStyleMap.set('left', CSS.px(maxWidth));
        fragment.appendChild(roomElement);
        maxWidth += room.width;

        this.height = this.height < room.height ? room.height : this.height;
      }
      this.height += 6;
      this.width = maxWidth;
      // fragment.appendChild(player.element)
      return fragment;
    }
    // onPlayerMove(e) {
    //   if (this.checkCameraColission(e.detail.position)) {
    //     this.playerPosition = this.playerPosition + e.detail.position
    //     for (const [index, room] of this.map.entries()) {
    //       const roomElement = room.draw();
    //       const left = roomElement.attributeStyleMap.get('left').value;
    //       roomElement.attributeStyleMap.set('left', CSS.px(left - e.detail.position));
    //     }
    //   } else if (this.checkPlayerColission(e.detail.position)) {
    //     this.playerPosition = this.playerPosition + e.detail.position
    //     this.player.element.attributeStyleMap.set('left', CSS.px(this.player.left + e.detail.position));
    //   }
    // }
    // checkCameraColission(shift) {
    //   let result = true;
    //   if ((this.playerPosition) < 0) {
    //     result = false;
    //   } else if (
    //     this.playerPosition > (this.mapWidth - VIEWPORT.clientWidth)+10
    //   ) {
    //     result = false;
    //   }
    //   return result;
    // }
    // checkPlayerColission(shift) {
    //   let result = true;
    //   if (this.player.left+shift < 10) {
    //     result = false;
    //   } else if (this.playerPosition + shift + this.player.defaultLeft + this.player.width > this.mapWidth - 10) {
    //     result = false;
    //   }
    //   return result;
    // }
  }

  // const player = new Creature('player');
  // const map = new Map(player);

  const map = new Map()
  const player = new Player( new Creature('player') )
  const mainCamera = new Camera(VIEWPORT, {
    map,
    player
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
