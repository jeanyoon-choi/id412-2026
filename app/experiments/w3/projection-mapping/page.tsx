import { Content } from "./Content";
import { MappingFrame } from "./MappingFrame";

// Projection mapping for the 1st-floor Black Room: two projectors, two walls.
// One laptop per projector: /experiments/w3/projection-mapping?side=left and ?side=right.
// The artwork (Content) knows nothing about the room. MappingFrame puts it on the wall.
export default async function ProjectionMapping({ searchParams }: { searchParams: Promise<{ side?: string }> }) {
  const { side } = await searchParams;
  const wall = side === "right" ? "right" : "left";

  return (
    <MappingFrame side={wall}>
      <Content side={wall} />
    </MappingFrame>
  );
}
