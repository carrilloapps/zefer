/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import PageSkeleton, { SkeletonLine, SkeletonCircle, SkeletonCard } from "../Skeleton";

describe("Skeleton primitives", () => {
  it("renders each primitive with its own radius and no extra classes by default", () => {
    const { container } = render(
      <>
        <SkeletonLine />
        <SkeletonCircle />
        <SkeletonCard />
      </>
    );
    const [line, circle, card] = Array.from(container.children) as HTMLElement[];

    expect(line.className).toBe("skeleton-shimmer rounded-md ");
    expect(circle.className).toBe("skeleton-shimmer rounded-full ");
    expect(card.className).toBe("skeleton-shimmer rounded-xl ");
  });

  it("appends the caller's className to each primitive", () => {
    const { container } = render(
      <>
        <SkeletonLine className="w-12 h-4" />
        <SkeletonCircle className="w-7 h-7" />
        <SkeletonCard className="h-80" />
      </>
    );
    const [line, circle, card] = Array.from(container.children) as HTMLElement[];

    expect(line).toHaveClass("skeleton-shimmer", "rounded-md", "w-12", "h-4");
    expect(circle).toHaveClass("skeleton-shimmer", "rounded-full", "w-7", "h-7");
    expect(card).toHaveClass("skeleton-shimmer", "rounded-xl", "h-80");
  });
});

describe("PageSkeleton", () => {
  it("mirrors the app layout: fixed nav bar plus centred content column", () => {
    const { container } = render(<PageSkeleton />);

    expect(container.querySelector(".glass-nav")).toBeInTheDocument();
    expect(container.querySelector(".max-w-3xl")).toBeInTheDocument();
    // Every placeholder shares the shimmer animation so nothing renders static.
    expect(container.querySelectorAll(".skeleton-shimmer")).toHaveLength(11);
  });

  it("renders no text, so screen readers announce nothing while hydrating", () => {
    const { container } = render(<PageSkeleton />);
    expect(container.textContent).toBe("");
  });
});
