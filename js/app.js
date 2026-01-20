'use strict';
import Camera from './camera';
import Level from './Level';
import { initLogger, logGame } from './logger';

(() => {
  const VIEWPORT = document.getElementById('viewport');
  const LOGBOX = document.getElementById('logbox');
  // инициализируем игровой логгер
  initLogger(LOGBOX);

  console.log('APP CREATE LEVEL');
  const level = new Level({
    rooms: [
      {
        id: 'roomWithBox1',
        type: 'basic',
        width: 500,
        height: 300,
      },
      {
        id: 'roomWithBox2',
        type: 'basic',
        width: 600,
        height: 300,
      },
      {
        id: 'room3',
        type: 'basic',
        width: 500,
        height: 300,
      },
      {
        id: 'room4',
        type: 'basic',
        width: 600,
        height: 400,
      },
    ],
    creatures: [
      {
        class: 'knight',
        params: {
          id: 'knight',
          group: 1,
          colissionWidth: 90,
          damage: 5,
          attackWidth: 132,
          direction: 'right',
          speed: 3,
        },
        position: {
          room: 'roomWithBox1',
          x: 100,
          y: 0,
        },
      },
      {
        // ящик в первой комнате
        class: 'box',
        params: {
          id: 'box-1',
          group: 0,
        },
        position: {
          room: 'roomWithBox1',
          x: 250,
          y: 0,
        },
      },
      {
        // зомби-противник в первой комнате
        class: 'zombie',
        params: {
          id: 'zombie-1',
          group: 3,
          colissionWidth: 10,
          damage: 5,
          attackWidth: 15,
          speed: 1.5,
        },
        position: {
          room: 'roomWithBox1',
          x: 400,
          y: 0,
        },
        actions: {
          move: 'wander',
          attack: true,
        },
      },
    ],
  });

  // ищем игрока по id
  const player = level.creatures.find((creature) => creature.id === 'knight');

  const mainCamera = new Camera(VIEWPORT, {
    level,
    target: 'knight',
  });
  console.log('mainCamera', mainCamera);

  function onKeydown(e) {
    if (!e.isTrusted) {
      return;
    }

    const newEvent = new KeyboardEvent('keydown', {
      bubbles: false,
      cancelable: false,
      code: e.code,
    });

    mainCamera.dispatchEvent(newEvent);
    if (player) {
      player.dispatchEvent(newEvent);
    }
  }

  function onKeyup(e) {
    if (!e.isTrusted) {
      return;
    }

    const newEvent = new KeyboardEvent('keyup', {
      bubbles: false,
      cancelable: false,
      code: e.code,
    });

    mainCamera.dispatchEvent(newEvent);
    if (player) {
      player.dispatchEvent(newEvent);
    }
  }

  logGame(`Hello! I'm a message console!`);

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyup);

})();