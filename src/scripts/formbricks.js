import formbricks from "@formbricks/js";

const surveyButton = document.getElementById('survey-button');
// localStorage.setItem('status', 'finished');
export const defineSurveyButton = () => {
  if (!surveyButton) return;

  if (localStorage.getItem('status') === 'finished') {
    replaceSurveyButton();

    return;
  }

  if (typeof window !== "undefined") {
    formbricks.setup({
      environmentId: "cmepjgfanupuluh01l6vcxlhy",
      appUrl: "https://app.formbricks.com",
    });
  }
}

const handleClick = () => {
  formbricks.track("survey-button-click");

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

const replaceSurveyButton = () => {
  surveyButton.removeEventListener('click', handleClick);
  const groupLink = document.createElement('a');
  groupLink.setAttribute('href', 'https://www.facebook.com/share/g/1BGeiGBHgt/');
  groupLink.textContent = 'Join us on Facebook!'
  surveyButton.replaceWith(groupLink);
}

const globalObserver = new MutationObserver((mutations, globalObserver) => {
  for (const mutation of mutations) {
    console.log(mutation.addedNodes)
    if (mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        if (node.childNodes.length > 0) {
          for (const child of node.childNodes) {
            if (child.htmlFor === 'EndingCard') {
              localStorage.setItem('status', 'finished');
              replaceSurveyButton();

              return;
            }
          }
        }
      }
    }

    if (mutation.removedNodes.length > 0) {
      for (const node of mutation.removedNodes) {
        if (node.matches('[id="formbricks-modal-container"]')) {
          globalObserver.disconnect();

          return;
        }
      }
    }
  }
});

surveyButton?.addEventListener('click', handleClick);
