(() => {
  const VIEWPORT = document.getElementById('viewport')
  const LOGBOX = document.getElementById('logbox')

  class Creature {
    constructor(name) {
      this.actionValue = 'idle';
      this.element = null;
      this.setCharElement(name)
    }
    set action(newValue){
      this.actionValue = newValue;
      this.updateCharElement()
    }
    setCharElement(name) {
      this.element = document.createElement('div')
      this.element.classList.add(name)
      this.element.addEventListener('keydown', this.onKeydown.bind(this))
      this.element.addEventListener('keyup', this.onKeyup.bind(this))
      this.updateCharElement()
    }
    updateCharElement() {
      this.element.dataset.action = this.actionValue;
    }
    onKeydown(e) {
      if (this.actionValue === 'idle') {
        if (e.code === 'Space') {
          this.action = 'attack-right'
        } else if (e.code === 'ArrowRight') {
          this.action = 'walk-right'
        }
      }
    }
    onKeyup(e) {
      if (
        this.actionValue === 'attack-right' && e.code === 'Space'
        || this.actionValue === 'walk-right' && e.code === 'ArrowRight'
      ) {
        this.action = 'idle'
      }
    }
  }
  const player = new Creature('player')
  VIEWPORT.appendChild(player.element)

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