import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

export const robotToastAnimation = trigger("toast", [
  state(
    "open",
    style({
      bottom: "0px",
    })
  ),
  state(
    "closed",
    style({
      bottom: "-100%",
    })
  ),
  transition("* <=> *", animate("1s ease")),
  transition("* <=> *", animate("1s ease")),
]);

export const robotBlockInfoAnimation = trigger("blockInfo", [
  state(
    "closed",
    style({
      opacity: 0,
    })
  ),
  state(
    "open",
    style({
      opacity: 1,
    })
  ),
  transition("* <=> *", [animate(300)]),
]);

export const robotBgOpacityAnimation = trigger("bgOpacity", [
  state(
    "closed",
    style({
      opacity: 0,
    })
  ),
  state(
    "open",
    style({
      opacity: 0.5,
    })
  ),
  transition("* <=> *", [animate(200)]),
]);

export const robotFadeInOutAnimation = trigger("fadeInOut", [
  state(
    "closed",
    style({
      right: "-100px",
      opacity: 0,
    })
  ),
  state(
    "open",
    style({
      right: "0",
    })
  ),
  transition("* <=> *", [animate(500)]),
]);
