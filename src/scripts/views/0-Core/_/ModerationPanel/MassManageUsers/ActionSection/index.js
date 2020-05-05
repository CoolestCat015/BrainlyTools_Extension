import { ActionListHole, Button } from "@style-guide";

/**
 * @typedef {{content: {text: string, style: string}, actionButton: import("@style-guide/Button").Properties}} renderDetails
 */
export default class ActionSection {
  /**
   * @param {import("../index").default} main
   * @param {renderDetails} renderDetails
   */
  constructor(main, renderDetails) {
    this.main = main;
    this.renderDetails = renderDetails;

    /**
     * @type {Object<string, import("../User").default>}
     */
    this.users = {};
    /**
     * @type {number[]}
     */
    this.userIdList = [];

    this.Render();
    this.RenderTabButton();
    this.RenderUserList();
    this.BindButtonHandler();
  }

  Render() {
    this.$ = $(`
    <div class="sg-content-box">
      <div class="sg-content-box__title sg-content-box__title--spaced-top sg-content-box__title--spaced-bottom sg-content-box__title--spaced-small">
        <h2 class="sg-text sg-text--bold ${this.renderDetails.content.style}">${this.renderDetails.content.text}</h2>
      </div>
      <div class="sg-content-box__content"></div>
      <div class="sg-content-box__actions"></div>
    </div>`);

    this.$contentContainer = $("> .sg-content-box__content", this.$);
    this.$actionsContainer = $("> .sg-content-box__actions", this.$);
  }

  RenderTabButton() {
    this.tabButton = new Button({
      size: "small",
      ...this.renderDetails.actionButton,
    });
    this.actionButtonContainer = ActionListHole({
      spaceBellow: true,
      children: this.tabButton.element,
    });
  }

  RenderUserList() {
    this.$userListContainer = $(`
    <div class="sg-actions-list__hole sg-actions-list__hole--grow">
      <div class="sg-content-box__actions sg-textarea sg-textarea--tall sg-textarea--resizable-vertical sg-actions-list--space-evenly sg-textarea--max1000 sg-textarea--min-width-25em"></div>
    </div>`);

    this.$userList = $(".sg-content-box__actions", this.$userListContainer);
  }

  BindButtonHandler() {
    this.tabButton.element.addEventListener(
      "click",
      this.ShowSection.bind(this),
    );
  }

  ShowSection() {
    if (this.main.activeAction) {
      this.main.activeAction.HideSection();

      if (this.main.activeAction == this) {
        this.main.activeAction = undefined;

        return this.main.HideActionsSectionSeparator();
      }
    }

    this.main.activeAction = this;

    this.tabButton.Active();
    this.main.ShowActionsSectionSeparator();
    this.$.appendTo(this.main.actionsSection);

    if ("SectionOpened" in this) this.SectionOpened();
  }

  HideSection() {
    this.main.HideElement(this.$);
    this.tabButton.Inactive();
  }

  /* SetUserIdList() {
    this.userIdList = this.main.MakeListedUsersBusy();
  } */
  PickUser() {
    const id = this.userIdList.shift();

    if (id) return this.main.users[id];
  }

  SetUsers(onlySelected = false) {
    const listedUserIdList = this.main.MakeListedUsersBusy(onlySelected);

    if (!listedUserIdList) return (this.userIdList = null);

    this.userIdList = [...new Set(listedUserIdList)];
  }
}
