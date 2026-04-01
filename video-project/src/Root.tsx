import { Composition } from "remotion";
import { LogisticaDemo } from "./LogisticaDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LogisticaDemo"
      component={LogisticaDemo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
