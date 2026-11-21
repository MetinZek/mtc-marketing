import React from "react";
import { Composition } from "remotion";
import { FPS, T } from "./config";
import { DavosBurgers } from "./Video";

export const Root: React.FC = () => (
  <Composition id="DavosBurgers" component={DavosBurgers} durationInFrames={T.total} fps={FPS} width={1920} height={1080} />
);
