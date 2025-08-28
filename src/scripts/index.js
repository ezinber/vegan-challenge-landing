import { registerEzHeader } from "../components/ez-header/ez-header.js";
import { registerEzDialog } from "../components/ez-dialog/ez-dialog.js";
import formbricks from "@formbricks/js";

registerEzHeader();
registerEzDialog();

const surveyButton = document.getElementById('survey-button');

const handleClick = () => {
  console.log("survey-button-click");
  formbricks.track("survey-button-click");
};


if (typeof window !== "undefined") {
  formbricks.setup({
    environmentId: "cmepjgfanupuluh01l6vcxlhy",
    appUrl: "https://app.formbricks.com",
  });
}

surveyButton.addEventListener('click', handleClick);
