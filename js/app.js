{
  const VIEWPORT = document.querySelector('#viewport')


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
      console.log('Keyup')
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
  document.addEventListener('keydown', (e) => {
    if (e.isTrusted) {
      const new_e = new e.constructor(e.type, e);
      player.element.dispatchEvent(new_e);
    }
    // const event = new main_event.constructor(main_event.type, main_event)
    // player.element.dispatchEvent(event)
  })
  document.addEventListener('keyup', (e) => {
    if (e.isTrusted) {
      const new_e = new e.constructor(e.type, e);
      player.element.dispatchEvent(new_e);
    }
  })

}
