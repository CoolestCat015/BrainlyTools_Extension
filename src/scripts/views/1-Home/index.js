import TimedLoop from "../../helpers/TimedLoop";
import WaitForElements from "../../helpers/WaitForElements";
import WaitForObject from "../../helpers/WaitForObject";
import startObservingForDeleteButtons from "./_/startObservingForDeleteButtons";
import TodaysActions from "./_/TodaysActions";

System.pageLoaded("Root inject OK!");

window.selectors = {
  ...window.selectors,
  feeds_parent: ".js-feed-stream",
  feed_item: `div[data-test="feed-item"]`,
  questionsBox_buttonList: `> div.sg-flex`,
  userLink: `.brn-feed-item__avatar .sg-avatar > a`,
  questionLink: `a[data-test="feed-item-link"]`,

  userInfoBoxPoints: "div.game-box__element > div.game-box__user-info > div.game-box__progress-items",
}

Home();

async function Home() {
  /**
   * Add mod actions count number into profile box at top of the page
   */
  TimedLoop(TodaysActions, { expireTime: 5 });

  /**
   *  Adding remove buttons inside of question boxes
   **/
  if (System.checkUserP(1) && System.checkBrainlyP(102)) {
    let _$_observe = await WaitForObject("$().observe");

    if (_$_observe) {
      let feeds_parent = await WaitForElements(selectors.feeds_parent);

      if (feeds_parent && feeds_parent.length > 0) {
        feeds_parent[0].classList.add("quickDelete");

        startObservingForDeleteButtons(feeds_parent);
      }
    }
  }
}
