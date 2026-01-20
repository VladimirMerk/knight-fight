
class Room {
  constructor(roomData) {
    this.id = roomData?.id || null;
    this.height = roomData.height;
    this.width = roomData.width;
    this.type = roomData.type;
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
    switch (this.type) {
      case 'basic':
      default:
        for (let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
          const element = document.createElement('div');
          element.classList.add('сhandelier');
          element.attributeStyleMap.set('left', CSS.px(300 + i * 90));
          this.element.appendChild(element);
        }

        for (let i = 0; i < Math.floor((this.width - 100) / 300); i++) {
          const element = document.createElement('div');
          element.classList.add('window');
          element.attributeStyleMap.set('left', CSS.px(100 + i * 90));
          element.attributeStyleMap.set('top', CSS.px(this.height / 2 - 100));
          this.element.appendChild(element);
        }
        break;
    }
  }
  draw() {
    return this.element;
  }
}

export default Room;
