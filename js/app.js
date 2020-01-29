(() => {
  const VIEWPORT = document.getElementById('viewport')
  const LOGBOX = document.getElementById('logbox')

  class Creature extends EventTarget {
    constructor(name) {
      super();
      this.actionValue = 'idle';
      this.element = null;
      this.actionTimer = null;
      this.speed = 6;
      this.defaultLeft = 0;
      this.setCharElement(name);
    }
    get action(){
      return this.actionValue;
    }
    set action(newValue){
      this.actionValue = newValue;
      this.updateCharElement()
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
    setCharElement(name) {
      this.element = document.createElement('div')
      this.element.classList.add(name)
      this.defaultLeft = Math.round(window.innerWidth / 2) - 100;
      this.element.attributeStyleMap.set('left', CSS.px(this.defaultLeft))
      this.element.addEventListener('keydown', this.onKeydown.bind(this))
      this.element.addEventListener('keyup', this.onKeyup.bind(this))
      this.element.addEventListener('animationstart', this.onActionStart.bind(this))
      this.element.addEventListener('animationend', this.onActionEnd.bind(this))
      this.updateCharElement()
    }
    updateCharElement() {
      this.element.dataset.action = this.action;
    }
    onKeydown(e) {
      if (this.action === 'idle') {
        if (e.code === 'Space') {
          this.action = 'attack-right'
          this.actionTimer = setInterval(() => {this.onAction()}, 50)
        } else if (e.code === 'ArrowRight') {
          this.action = 'walk-right'
          this.actionTimer = setInterval(() => {this.onAction()}, 50)
        } else if (e.code === 'ArrowLeft') {
          this.action = 'walk-left'
          this.actionTimer = setInterval(() => {this.onAction()}, 50)
        }
      }
    }
    onKeyup(e) {
      console.log(this.action)
      if (
        this.action === 'attack-right' && e.code === 'Space'
        || this.action === 'walk-right' && e.code === 'ArrowRight'
        || this.action === 'walk-left' && e.code === 'ArrowLeft'
      ) {
        this.action = 'idle'
        clearInterval(this.actionTimer)
      }
    }
    onAction() {
        if (this.action === 'walk-right') {
          this.dispatchEvent(new CustomEvent('playerMove', {
            bubbles: false,
            cancelable: false,
            detail: {
              position: this.speed
            }
          }));
        } else if (this.action === 'walk-left') {
          this.dispatchEvent(new CustomEvent('playerMove', {
            bubbles: false,
            cancelable: false,
            detail: {
              position: -this.speed
            }
          }));
        }
    }
    onActionStart(e) {
      console.log('onActionStart', this.action)
    }
    onActionEnd(e) {
      console.log('onActionEnd', this.action)
    }
  }

  class Room {
    constructor() {
      this.width = 500;
      this.element = this.create();
      this.objects = null;
      this.generationDecorations();
    }
    create() {
      const element = document.createElement('div');
      element.classList.add('room');
      element.attributeStyleMap.set('width', CSS.px(this.width));
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
        this.element.appendChild(element)
      }
    }
    draw() {
      return this.element;
    }
  }

  class Map {
    constructor(player) {
      this.map = [new Room(), new Room(), new Room()]
      this.mapWidth = 0;
      this.player = player;
      this.playerPosition = this.player.left;
      this.player.addEventListener('playerMove', this.onPlayerMove.bind(this));
    }
    draw() {
      const fragment = document.createDocumentFragment()
      for (const [index, room] of this.map.entries()) {
        const roomElement = room.draw();
        if (index === 0) {
          roomElement.classList.add('left-wall');
        } else if (index === this.map.length - 1){
          roomElement.classList.add('right-wall');
        }
        roomElement.attributeStyleMap.set('left', CSS.px(this.mapWidth - this.playerPosition));
        fragment.appendChild(roomElement);
        this.mapWidth += room.width;
      }
      fragment.appendChild(player.element)
      return fragment;
    }
    onPlayerMove(e) {
      if (this.checkCameraColission(e.detail.position)) {
        this.playerPosition = this.playerPosition + e.detail.position
        for (const [index, room] of this.map.entries()) {
          const roomElement = room.draw();
          const left = roomElement.attributeStyleMap.get('left').value;
          roomElement.attributeStyleMap.set('left', CSS.px(left - e.detail.position));
        }
      } else if (this.checkPlayerColission(e.detail.position)) {
        this.playerPosition = this.playerPosition + e.detail.position
        this.player.element.attributeStyleMap.set('left', CSS.px(this.player.left + e.detail.position));
      }
    }
    checkCameraColission(shift) {
      let result = true;
      if ((this.playerPosition) < 0) {
        result = false;
      } else if (
        this.playerPosition > (this.mapWidth - VIEWPORT.clientWidth)+10
      ) {
        result = false;
      }
      return result;
    }
    checkPlayerColission(shift) {
      let result = true;
      if (this.player.left+shift < 10) {
        result = false;
      } else if (this.playerPosition + shift + this.player.defaultLeft + this.player.width > this.mapWidth - 10) {
        result = false;
      }
      return result;
    }
  }

  const player = new Creature('player');
  const map = new Map(player);

  VIEWPORT.appendChild(map.draw())

  function onDown(e) {
    if (e.isTrusted) {
      if (e.target.dataset.keycode) {
        e.code = e.target.dataset.keycode
        onKeydown(e)
      }
    }
  }

  function onUp(e) {
    if (e.isTrusted) {
      if (e.target.dataset.keycode) {
        e.code = e.target.dataset.keycode
        onKeyup(e)
      }
    }
  }

  function onKeydown(e) {
    if (e.isTrusted) {
      const new_e = new KeyboardEvent("keydown", {bubbles : false, cancelable : true, code : e.code});
      player.element.dispatchEvent(new_e);
    }
  }

  function onKeyup(e) {
    if (e.isTrusted) {
      const new_e = new KeyboardEvent("keyup", {bubbles : false, cancelable : true, code : e.code});
      player.element.dispatchEvent(new_e);
    }
  }

  toLog(`Hello! I'm message console!`)

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('keyup', onKeyup)

  document.addEventListener('mousedown', onDown)
  document.addEventListener('mouseup', onUp)

  document.addEventListener('touchstart', onDown)
  document.addEventListener('touchend', onUp)

  function toLog(...args) {
    const message = args.map((e) => JSON.stringify(e)).join(" ");
    LOGBOX.appendChild(document.createTextNode(message))
    LOGBOX.appendChild(document.createElement("br"))
  }
})()
