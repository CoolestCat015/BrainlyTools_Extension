import Action, { UsersDataInReportedContentsType } from "@BrainlyAction";
import notification, { NotificationPropsType } from "@components/notification2";
import Build from "@root/helpers/Build";
import HideElement from "@root/helpers/HideElement";
import { Box, Flex, Spinner, Text } from "@style-guide";
import type { FlexElementType } from "@style-guide/Flex";
import moment from "moment";
import LogEntry from "./LogEntry";

export default class LogSection {
  questionId: number;

  dateSection: {
    [date: string]: FlexElementType;
  };

  container: FlexElementType;
  spinnerContainer: FlexElementType;
  usersData: UsersDataInReportedContentsType[];
  contentBox: Box;
  notificationFn: (props: NotificationPropsType) => void;

  constructor(
    questionId: number,
    notificationFn?: (props: NotificationPropsType) => void,
  ) {
    this.questionId = questionId;
    this.notificationFn = notificationFn;

    this.dateSection = {};

    moment.locale(navigator.language);

    this.Render();
    this.FetchLogData();
  }

  private Render() {
    this.container = Build(Flex({ direction: "column", grow: true }), [
      [
        Flex({
          marginBottom: "xs",
          marginLeft: "s",
        }),
        Text({
          text: System.data.locale.moderationPanel.log.text,
          weight: "extra-bold",
        }),
      ],
      [
        Flex(),
        [
          [
            (this.contentBox = new Box({
              border: true,
              padding: "xs",
              borderColor: "gray-secondary-lightest",
            })),
            [
              [
                (this.spinnerContainer = Flex({
                  relative: true,
                  justifyContent: "center",
                })),
                Spinner(),
              ],
            ],
          ],
        ],
      ],
    ]);
  }

  async FetchLogData() {
    try {
      const resData = await new Action().ActionsHistory(this.questionId);

      if (!resData) throw Error("Empty response");

      if (resData.success === false)
        throw resData.message
          ? { msg: resData.message }
          : resData || Error("Server send empty response");

      this.usersData = resData.users_data;

      resData.data.forEach(entryData => {
        let dateSection = this.dateSection[entryData.date];

        if (!dateSection) {
          dateSection = this.RenderDateSection(entryData.date);
        }

        const logEntry = new LogEntry(this, entryData);

        dateSection.append(logEntry.container);
      });
    } catch (error) {
      console.error(error);
      (this.notificationFn || notification)({
        type: "error",
        html: error.msg || System.data.locale.moderationPanel.failedToGetLogs,
      });
    }

    this.HideSpinner();
  }

  RenderDateSection(date: string) {
    const dateSection = Build(
      Flex({
        marginTop: "s",
        marginBottom: "s",
        direction: "column",
      }),
      [
        [
          Flex(),
          Text({
            size: "small",
            weight: "bold",
            children: moment(new Date(date)).format("L"),
          }),
        ],
      ],
    );

    this.dateSection[date] = dateSection;

    this.contentBox.element.append(dateSection);

    return dateSection;
  }

  HideSpinner() {
    HideElement(this.spinnerContainer);
  }
}
