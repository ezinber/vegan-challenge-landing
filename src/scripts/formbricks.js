import formbricks from "@formbricks/js";

const surveyButton = document.getElementById('survey-button');
const signupSection = surveyButton && document.getElementById("signup");
const beforeSurveyContent = surveyButton && document.getElementById('before-survey');
const afterSurveyContent = surveyButton && document.getElementById('after-survey')?.content.cloneNode(true);
const lang = document.documentElement.lang || 'en';

const replaceSurveyButton = () => {
  surveyButton.removeEventListener('click', handleClick);
  beforeSurveyContent.replaceWith(afterSurveyContent);
}

const observer = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        if (node.childNodes.length > 0) {
          for (const child of node.childNodes) {
            if (child.htmlFor === 'EndingCard') {
              sessionStorage.setItem('status', 'finished');
              replaceSurveyButton();
              signupSection.scrollIntoView();

              return;
            }
          }
        }
      }
    }

    if (mutation.removedNodes.length > 0) {
      for (const node of mutation.removedNodes) {
        if (node.matches('[id="formbricks-modal-container"]')) {
          observer.disconnect();

          return;
        }
      }
    }
  }
});

const handleClick = () => {
  formbricks.track("survey-button-click");

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

export const defineSurveyButton = async () => {
  if (!surveyButton) return;

  if (sessionStorage.getItem('status') === 'finished') {
    replaceSurveyButton();

    return;
  }

  if (typeof window !== "undefined") {
    surveyButton.addEventListener('click', handleClick);

    await formbricks.setup({
      environmentId: "cmepjgfbaupuquh01i76nj8zr",
      appUrl: "https://app.formbricks.com",
    })

    formbricks.setLanguage(lang);
  }
}
