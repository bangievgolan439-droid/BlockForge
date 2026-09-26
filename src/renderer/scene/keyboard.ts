const pressed = new Set<string>();

window.addEventListener('keydown', (e) => {
  pressed.add(e.code);
});
window.addEventListener('keyup', (e) => {
  pressed.delete(e.code);
});
window.addEventListener('blur', () => {
  pressed.clear();
});

export function isKeyPressed(code: string): boolean {
  return pressed.has(code);
}
