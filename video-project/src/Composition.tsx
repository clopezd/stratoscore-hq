import { AbsoluteFill } from "remotion";

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white",
      }}
    >
      Welcome
    </AbsoluteFill>
  );
};
