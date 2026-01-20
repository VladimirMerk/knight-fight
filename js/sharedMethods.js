export default class SharedMethods {
  static intersects(a, b) {
    const xOverlap = a.x <= b.x1 && a.x1 >= b.x;
    const yOverlap = a.y <= b.y1 && a.y1 >= b.y;

    return {
      x: xOverlap ? 1 : 0,
      y: yOverlap ? 1 : 0,
    };
  }
}
