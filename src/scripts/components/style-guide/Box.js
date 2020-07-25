// @flow

import AddChildren from "@style-guide/helpers/AddChildren";
import type { ChildrenParamType } from "@style-guide/helpers/AddChildren";
import SetProps from "@style-guide/helpers/SetProps";
import classNames from "classnames";

export type BoxColorType =
  | "dark"
  | "light"
  | "blue"
  | "lavender"
  | "mint"
  | "mint-secondary"
  | "mint-secondary-light"
  | "mint-secondary-ultra-light"
  | "blue-secondary"
  | "blue-secondary-light"
  | "gray-secondary-lightest"
  | "gray-secondary-ultra-light"
  | "mustard-primary"
  | "peach"
  | "peach-secondary"
  | "peach-secondary-light";

type PaddingType = "xxs" | "xs" | "s" | "m" | "l" | "xl";

type BoxPropsType = {
  children?: ChildrenParamType,
  className?: ?string,
  color?: ?BoxColorType,
  shadow?: boolean,
  padding?: PaddingType | null,
  noBorderRadius?: boolean,
  border: boolean,
  borderColor?: BoxColorType,
  // additional
  fullHeight?: boolean,
  ...
} /* & BoxBorderType */;

export default class {
  color: ?BoxColorType;
  borderColor: ?BoxColorType;
  element: HTMLDivElement;

  constructor({
    children,
    className,
    color,
    padding = "m",
    border = false,
    borderColor = "gray-secondary-lightest",
    noBorderRadius = false,
    shadow = false,
    fullHeight,
    ...props
  }: BoxPropsType) {
    this.color = color;
    this.borderColor = borderColor;

    const classes = classNames(
      "sg-box",
      {
        [`sg-box--padding-${String(padding)}`]: padding,
        "sg-box--border": border,
        [`sg-box--border-color-${String(borderColor)}`]: border && borderColor,
        "sg-box--shadow": shadow,
        "sg-box--no-border-radius": noBorderRadius,
        "sg-box--full-height": fullHeight,
      },
      className,
    );

    this.element = document.createElement("div");
    this.element.className = classes;

    this.ChangeColor(color);
    SetProps(this.element, props);
    AddChildren(this.element, children);
  }

  ChangeColor(color?: ?BoxColorType) {
    if (this.color)
      this.element.classList.remove(`sg-box--${String(this.color)}`);

    if (color) {
      this.element.classList.add(`sg-box--${String(color)}`);
    }

    this.color = color;
  }

  ChangeBorderColor(borderColor: ?BoxColorType) {
    if (this.borderColor)
      this.element.classList.remove(
        `sg-box--border-color-${String(this.borderColor)}`,
      );

    this.element.classList.add(`sg-box--border-color-${String(borderColor)}`);

    this.borderColor = borderColor;
  }
}
