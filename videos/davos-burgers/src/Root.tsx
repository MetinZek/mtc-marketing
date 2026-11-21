import React from "react";
import { Composition } from "remotion";
import { FPS, T } from "./config";
import { DavosBurgers } from "./Video";
import { PizzaMenu } from "./PizzaMenu";
import { SamunMenu, SandwichMenu, TortillaMenu } from "./SandwichMenu";
import { MENUS_TOTAL, MenusVideo } from "./MenusVideo";

export const Root: React.FC = () => (
  <>
    <Composition id="DavosBurgers" component={DavosBurgers} durationInFrames={T.total} fps={FPS} width={1920} height={1080} />
    <Composition id="MenusVideo" component={MenusVideo} durationInFrames={MENUS_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="TortillaMenu" component={TortillaMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SamunMenu" component={SamunMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SandwichMenu" component={SandwichMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="PizzaMenu" component={PizzaMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
