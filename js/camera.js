import SharedMethods from './sharedMethods';

class Camera extends EventTarget {
  constructor(viewport, options) {
    super();
    this.viewport = viewport;
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.bounds = {
      xmin: this.viewport.offsetWidth / 2,
      ymin: this.viewport.offsetHeight / 2,
      xmax: 0,
      ymax: 0,
    };

    this.level = options.level;
    this.target = this.findTargetById(options.target);

    if (this.level) {
      this.bounds.xmax = this.level.width - this.viewport.offsetWidth / 2 + 6;
      this.bounds.ymax = this.level.height - this.viewport.offsetHeight / 2 + 6;
      this.position.y = this.level.height / 2;
      this.level.creatures &&
        this.level.creatures.forEach((creature) => {
          creature.addEventListener('hit', this.calculateHit.bind(this));
          creature.addEventListener('death', this.removeCreature.bind(this));
        });
    }

    this.timer = null;
    this.rps = 60; // redraw per second
    this.freeMove = false;
    this.elements = [];
    this.setCameraPosition();
    this.mainLoop();
    this.calculates();
    this.addEventListener('keydown', this.onKeyDown.bind(this));
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.motor();
  }
  mainLoop() {
    if (this.level) {
      this.level.loop();
      if (!this.elements.length) {
        const fragment = document.createDocumentFragment();
        this.viewport.innerHTML = '';
        this.level.draw().forEach((element) => {
          fragment.appendChild(element);
          this.elements.push(element);
        });
        this.viewport.appendChild(fragment);
      }
    }

    for (const element of this.elements) {
      const leftStyle = element.attributeStyleMap.get('margin-left') || {
        value: 0,
      };
      element.attributeStyleMap.set(
        'margin-left',
        CSS.px(-this.position.x + this.viewport.offsetWidth / 2)
      );
      const topStyle = element.attributeStyleMap.get('margin-top') || {
        value: 0,
      };
      element.attributeStyleMap.set(
        'margin-top',
        CSS.px(-this.position.y + this.viewport.offsetHeight / 2)
      );
    }
  }
  calculates() {
    // toLog(`width: ${this.viewport.offsetWidth};\
    //          height: ${this.viewport.offsetHeight};\
    //          x: ${this.position.x};\
    //          y: ${this.position.y};`);
  }
  motor() {
    setInterval(() => {
      this.setCameraPosition();
    }, 1000 / this.rps);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
  move(direction) {
    switch (direction) {
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
      this.velocity.x -= 0.1;
      if (this.velocity.x < 1) {
        this.velocity.x = 0;
      }
    } else if (this.velocity.x < 0) {
      this.velocity.x += 0.1;
      if (this.velocity.x > -1) {
        this.velocity.x = 0;
      }
    }
  }
  setCameraPosition() {
    if (this.freeMove) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.slowDownVelocity();
    } else if (this.target) {
      this.position = this.getTargetPosition();
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
    this.mainLoop();
  }
  getTargetPosition() {
    const mapOffset = this.level.getOffset();
    let targetPosition = { x: 0, y: 0 };
    if (this.target) {
      targetPosition = this.target.getPosition();
    }
    return {
      x: mapOffset.left + targetPosition.x,
      y: mapOffset.top + targetPosition.y,
    };
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
          this.move('up');
          break;
        case 'ArrowRight':
          this.move('right');
          break;
        case 'ArrowDown':
          this.move('down');
          break;
        case 'ArrowLeft':
          this.move('left');
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
    if (!id || !this.level || !this.level.creatures) return null;
    return this.level.creatures.find((creature) => creature.id === id);
  }
  removeCreature(e) {
    const creature = e.target;
    this.level.creatures.forEach((otherCreature, index) => {
      if (creature === otherCreature) {
        toLog(`${otherCreature.id} is killed`);
        this.level.creatures.splice(index, 1);
      }
    });
  }
  calculateHit(e) {
    const creature = e.target;
    switch (e.detail.direction) {
      case 'right':
        this.level.creatures.forEach((otherCreature) => {
          if (creature === otherCreature) return;
          let creatureBound = creature.element.getBoundingClientRect();
          creatureBound.x1 = creatureBound.x + creature.attackWidth;
          creatureBound.y1 = creatureBound.y + creatureBound.height;
          let otherCreatureBound = otherCreature.element.getBoundingClientRect();
          otherCreatureBound.x1 =
            otherCreatureBound.x + otherCreature.colissionWidth;
          otherCreatureBound.y1 =
            otherCreatureBound.y + otherCreatureBound.height;
          const colission = SharedMethods.intersects(
            creatureBound,
            otherCreatureBound
          );
          if (colission.x > 0) {
            otherCreature.hit(e.detail.damage);
          }
        });
        break;
    }
  }
}

export default Camera;
