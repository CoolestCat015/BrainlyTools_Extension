import Action from "@BrainlyAction";
import getModalContainer from "@root/scripts/components/helpers/getModalContainer";
import ModerationPanel from "@root/scripts/components/ModerationPanel/ModerationPanel";
import notification from "@root/scripts/components/notification2";
import HideElement from "@root/scripts/helpers/HideElement";
import { Overlay, Spinner } from "@style-guide";
import type * as ContentTypes from "../../Content/Content";
import type { ContentClassTypes } from "../../Fetcher/Fetcher";
import type QueueClassType from "../Queue";

export default class ModerationPanelController {
  main: QueueClassType;

  moderationPanel: ModerationPanel;
  contentCurrentlyModerating: ContentTypes.default;
  loadingOverlay: HTMLDivElement;
  modalContainer: HTMLDivElement;

  constructor(main: QueueClassType) {
    this.main = main;

    this.RenderLoadingOverlay();
  }

  RenderLoadingOverlay() {
    this.loadingOverlay = Overlay({
      children: Spinner({
        overlay: true,
        light: true,
        size: "xxxlarge",
      }),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async ModerateContent(content: ContentClassTypes) {
    try {
      if (!content.contentType) return;

      this.contentCurrentlyModerating = content;

      const resTicket = await new Action().OpenModerationTicket(
        content.data.task_id,
      );

      this.HideLoadingOverlay();
      content.HideSpinner();
      content.EnableActions();
      content.moderateButton.Enable();

      // eslint-disable-next-line camelcase
      if (!resTicket?.success || !resTicket?.data || !resTicket?.users_data) {
        notification({
          type: "error",
          html:
            resTicket.message ||
            System.data.locale.common.notificationMessages.somethingWentWrong,
        });

        return;
      }

      this.moderationPanel = new ModerationPanel(
        resTicket.data,
        resTicket.users_data,
        {
          onClose: this.ModerationPanelClosed.bind(this),
          onDelete: this.SomethingDeleted.bind(this),
          switchNext: this.SwitchToNextReport.bind(this),
          switchPrevious: this.SwitchToPreviousReport.bind(this),
        },
      );

      // TODO remove this ticket expire fn
      // new Action().CloseModerationTicket(content.data.task_id);
    } catch (error) {
      console.error(error);
      notification({
        type: "error",
        html:
          error.msg ||
          System.data.locale.common.notificationMessages.somethingWentWrong,
      });
    }
  }

  ModerationPanelClosed() {
    this.moderationPanel = null;
    // this.contentCurrentlyModerating = null;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  SomethingDeleted(id: number, contentType: ContentTypes.ContentNameType) {
    const globalId = btoa(`${contentType.toLowerCase()}:${id}`);

    const content = this.main.main.contents.byGlobalId.all[globalId];

    content?.Deleted();
  }

  SwitchToNextReport() {
    this.SwitchToReport("next");
  }

  SwitchToPreviousReport() {
    this.SwitchToReport("previous");
  }

  async SwitchToReport(direction: "next" | "previous") {
    console.log(this);
    await this.moderationPanel.FinishModeration(true);

    if (!this.contentCurrentlyModerating) return;

    this.ShowLoadingOverlay();

    const index = this.main.main.contents.filtered.indexOf(
      this.contentCurrentlyModerating,
    );

    if (index < 0) return;

    const content = this.main.main.contents.filtered[
      index + (direction === "next" ? 1 : -1)
    ];

    if (!content) {
      notification({
        type: "info",
        text: System.data.locale.moderationPanel.thereIsNoReportLeft,
      });

      this.HideLoadingOverlay();

      return;
    }

    content.Moderate();
    console.log(content);
  }

  ShowLoadingOverlay() {
    if (!this.modalContainer) {
      this.modalContainer = getModalContainer();

      if (!this.modalContainer)
        console.error(".js-modal-container is undefined");
    }

    this.modalContainer.append(this.loadingOverlay);
  }

  HideLoadingOverlay() {
    HideElement(this.loadingOverlay);
  }
}