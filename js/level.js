import Room from './Room.js';
import Creature from './Creature.js';
import Player from './player.js';

class Level {
  constructor(levelData) {
    console.log('LEVEL constructor', levelData);
    this.rooms = [];
    this.creatures = [];
    this.width = 0;
    this.height = 0;
    this.createRooms(levelData.rooms || []);
    this.createCreatures(levelData.creatures || []);
    this.draw();
  }

  createRooms(roomsData) {
    roomsData.forEach((roomData) => {
      const room = new Room(roomData);
      this.rooms.push(room);
    });
  }

  createCreatures(creaturesData) {
    let accumulatedWidth = 0;

    creaturesData.forEach((creatureData) => {
      const roomIndex = this.rooms.findIndex(
        (room) => room.id === creatureData.position.room
      );

      if (roomIndex === -1) {
        console.error(
          `Room with id "${creatureData.position.room}" not found for creature "${creatureData.params?.id ||
            creatureData.class}"`
        );
        return;
      }

      accumulatedWidth = this.rooms
        .slice(0, roomIndex)
        .reduce((acc, room) => acc + room.width, 0);

      let positionX = accumulatedWidth + creatureData.position.x;

      // избегаем точного наложения по X
      let isOverlap = this.creatures.some(
        (creature) => creature.position === positionX
      );
      while (isOverlap) {
        positionX += 50;
        isOverlap = this.creatures.some(
          (creature) => creature.position === positionX
        );
      }

      const params = creatureData.params || {};
      const actions = creatureData.actions || {};

      const CreatureClass =
        creatureData.class === 'knight' ? Player : Creature;

      const creature = new CreatureClass(creatureData.class, {
        ...params,
        position: positionX,
        actions,
      });

      this.creatures.push(creature);
    });
  }

  loop() {
    this.setCreaturesNeighbor();
  }

  setCreaturesNeighbor() {
    this.creatures.forEach((creature) =>
      creature.updateNeighbors(this.creatures)
    );
  }

  draw() {
    let maxWidth = 0;
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
      elements.push(roomElement);
      maxWidth += room.width;

      this.height = this.height < room.height ? room.height : this.height;
    }

    this.height += 6;
    this.width = maxWidth;

    for (const creature of this.creatures) {
      creature.draw().forEach((element) => {
        elements.push(element);
      });
    }

    return elements;
  }

  getOffset() {
    return {
      left: Math.abs(parseInt(this.rooms[0].element.offsetLeft, 10) || 0),
      top: Math.abs(parseInt(this.rooms[0].element.offsetTop, 10) || 0),
    };
  }
}

export default Level;