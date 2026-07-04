import React from "react";
import { Composition } from "remotion";
import { FlowDiagram } from "./compositions/FlowDiagram";
import traditionalFlow from "../stories/ep01-traditional-flow.json";
import aiNativeFlow from "../stories/ep01-ai-native-flow.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
