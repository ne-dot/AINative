import React from "react";
import { Composition } from "remotion";
import { AiBrainOrbitDemo } from "./compositions/AiBrainOrbitDemo";
import { AbsoluteFillDemo } from "./compositions/AbsoluteFillDemo";
import { FlowDiagram } from "./compositions/FlowDiagram";
import { SequenceDemo } from "./compositions/SequenceDemo";
import { SpringHelloDemo } from "./compositions/SpringHelloDemo";
import { TransformsDemo } from "./compositions/TransformsDemo";
import traditionalFlow from "../stories/ep01-traditional-flow.json";
import aiNativeFlow from "../stories/ep01-ai-native-flow.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AiBrainOrbitDemo"
        component={AiBrainOrbitDemo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TransformsDemo"
        component={TransformsDemo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SequenceDemo"
        component={SequenceDemo}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SpringHelloDemo"
        component={SpringHelloDemo}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AbsoluteFillDemo"
        component={AbsoluteFillDemo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlowTraditional"
        component={FlowDiagram}
        durationInFrames={traditionalFlow.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={traditionalFlow}
      />
      <Composition
        id="FlowAiNative"
        component={FlowDiagram}
        durationInFrames={aiNativeFlow.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={aiNativeFlow}
      />
    </>
  );
};
