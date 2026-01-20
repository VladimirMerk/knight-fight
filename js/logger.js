let logElement = null;

export function initLogger(element) {
  logElement = element;
}

export function logGame(message) {
  if (!logElement) return;
  const br = document.createElement('br');
  const node = document.createTextNode(message);
  logElement.prepend(br);
  logElement.prepend(node);
}
