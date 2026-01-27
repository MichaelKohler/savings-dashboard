import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Main from "~/components/main";

describe("Main", () => {
  it("renders the main container with correct styling", () => {
    render(<Main user={undefined} />);

    const container = document.querySelector("div.bg-white");
    expect(container).toHaveClass("bg-white");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("flex-col");
    expect(container).toHaveClass("h-screen");
    expect(container).toHaveClass("relative");
  });

  it("renders children content", () => {
    render(
      <Main user={undefined}>
        <div data-testid="child-content">Child content</div>
      </Main>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
