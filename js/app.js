'use strict';
import Camera from './camera';
import Creature from './creature';
import Player from './player';
import Level from './level';

(() => {
  const VIEWPORT = document.getElementById('viewport');
  const LOGBOX = document.getElementById('logbox');
  const creatures = [];

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
    direction: 'right',
  });
  registerCreature('wall', {
    position: -40,
    colissionWidth: 50,
  });
  registerCreature('box', { position: 250 });

  // registerCreature('zombie', {
  //   position: 180,
  //   colissionWidth: 54,
  //   damage: 5,
  //   attackWidth: 72,
  //   speed: 1.5,
  //   group: 3
  // })

  const level = new Level(creatures);
  const mainCamera = new Camera(VIEWPORT, {
    level: level,
    target: 'knight',
  });
  console.log('mainCamera', mainCamera);

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
      const new_e = new KeyboardEvent('keydown', {
        bubbles: false,
        cancelable: false,
        code: e.code,
      });
      mainCamera.dispatchEvent(new_e);
      player.dispatchEvent(new_e);
    }
  }

  function onKeyup(e) {
    if (e.isTrusted) {
      const new_e = new KeyboardEvent('keyup', {
        bubbles: false,
        cancelable: false,
        code: e.code,
      });
      mainCamera.dispatchEvent(new_e);
      player.dispatchEvent(new_e);
    }
  }

  toLog(`Hello! I'm a message console!`);

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyup);

  // document.addEventListener('mousedown', onDown)
  // document.addEventListener('mouseup', onUp)
  //
  // document.addEventListener('touchstart', onDown)
  // document.addEventListener('touchend', onUp)

  function toLog(...args) {
    const message = args.map((e) => JSON.stringify(e)).join(' ');
    LOGBOX.prepend(document.createTextNode(message));
    LOGBOX.prepend(document.createElement('br'));
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
})();
