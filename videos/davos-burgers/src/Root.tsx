import React from "react";
import { Composition } from "remotion";
import { FPS, T } from "./config";
import { DavosBurgers } from "./Video";
import { PizzaMenu } from "./PizzaMenu";
import { SandwichMenu } from "./SandwichMenu";

export const Root: React.FC = () => (
  <>
    <Composition id="DavosBurgers" component={DavosBurgers} durationInFrames={T.total} fps={FPS} width={1920} height={1080} />
    <Composition id="SandwichMenu" component={SandwichMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="PizzaMenu" component={PizzaMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
