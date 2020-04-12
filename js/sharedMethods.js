export default class SharedMethods {
  static intersects(a, b) {
    return {
      x: a.x1 >= b.x && a.x1 <= b.x1 ? 1 : a.x >= b.x && a.x <= b.x1 ? -1 : 0,
      y: 0,
    };
  }
}
