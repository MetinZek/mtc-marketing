import React from "react";
import { Composition } from "remotion";
import { FPS, T } from "./config";
import { DavosBurgers } from "./Video";
import { PizzaMenu } from "./PizzaMenu";
import { BurgerMenu, SamunMenu, SandwichMenu, SaucesMenu, SnacksMenu, TortillaMenu } from "./SandwichMenu";
import { PAIR_TOTAL, PairVideo } from "./PairVideo";
import { LOOP_TOTAL, LoopPairVideo } from "./LoopPairVideo";

const SamunSnacksLoop: React.FC = () => <LoopPairVideo A={SamunMenu} B={SnacksMenu} />;
const BurgerSandwichLoop: React.FC = () => <LoopPairVideo A={BurgerMenu} B={SandwichMenu} />;

const SamunSnacks: React.FC = () => <PairVideo A={SamunMenu} B={SnacksMenu} />;
const BurgerSandwich: React.FC = () => <PairVideo A={BurgerMenu} B={SandwichMenu} />;
import { MENUS_TOTAL, MenusVideo } from "./MenusVideo";

export const Root: React.FC = () => (
  <>
    <Composition id="DavosBurgers" component={DavosBurgers} durationInFrames={T.total} fps={FPS} width={1920} height={1080} />
    <Composition id="MenusVideo" component={MenusVideo} durationInFrames={MENUS_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="SamunSnacksLoop" component={SamunSnacksLoop} durationInFrames={LOOP_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="BurgerSandwichLoop" component={BurgerSandwichLoop} durationInFrames={LOOP_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="SamunSnacks" component={SamunSnacks} durationInFrames={PAIR_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="BurgerSandwich" component={BurgerSandwich} durationInFrames={PAIR_TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="BurgerMenu" component={BurgerMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SaucesMenu" component={SaucesMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SnacksMenu" component={SnacksMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="TortillaMenu" component={TortillaMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SamunMenu" component={SamunMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="SandwichMenu" component={SandwichMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="PizzaMenu" component={PizzaMenu} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
