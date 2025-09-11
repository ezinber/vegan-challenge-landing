import formbricks from "@formbricks/js";

export const defineSurveyButton = () => {
  const surveyButton = document.getElementById('survey-button');

  if (!surveyButton) { return }

  if (typeof window !== "undefined") {
    formbricks.setup({
      environmentId: "cmepjgfanupuluh01l6vcxlhy",
      appUrl: "https://app.formbricks.com",
    });
  }

  const handleClick = () => {
    console.log("survey-button-click");
    formbricks.track("survey-button-click");
  }

  surveyButton.addEventListener('click', handleClick);
}
