export const styleOnloadRelChanger = () => {
  const linkElement = document.querySelector('[as="style"]');
  linkElement.onload = null;
  linkElement.rel='stylesheet';
}