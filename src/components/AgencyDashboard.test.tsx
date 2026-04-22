import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import AgencyDashboard from "./AgencyDashboard";

// Mock sonner so toasts don't error in jsdom
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AgencyDashboard – invite cooldown focus & announcement", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Force the mocked SMS gateway to ALWAYS fail (Math.random < 0.3 path)
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const openInviteAndTriggerFailure = async () => {
    render(<AgencyDashboard onBack={() => {}} />);

    // Open invite modal (Quick Action on default Overview tab)
    fireEvent.click(screen.getByText("Add Agent"));
    expect(screen.getByText("👤 Invite Agent")).toBeInTheDocument();

    // Submit — triggers the 1.2s mock SMS request that will fail
    const sendBtn = screen.getByRole("button", { name: /^send invitation$/i });
    fireEvent.click(sendBtn);

    // Advance through the simulated network delay → cooldown begins at 30
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
  };

  it("focuses the Send Invitation button immediately when cooldown reaches 0", async () => {
    await openInviteAndTriggerFailure();

    // Button should now show countdown and be disabled
    const cooldownBtn = await screen.findByRole("button", { name: /retry in \d+s/i });
    expect(cooldownBtn).toBeDisabled();
    expect(cooldownBtn).not.toHaveFocus();

    // Advance 30s of cooldown ticks
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    // Button is back to "Send Invitation", enabled, and focused
    const retryBtn = await screen.findByRole("button", { name: /^send invitation$/i });
    await waitFor(() => expect(retryBtn).toHaveFocus());
    expect(retryBtn).not.toBeDisabled();
  });

  it("announces via aria-live that cooldown ended and the button was focused", async () => {
    await openInviteAndTriggerFailure();

    // Before cooldown ends, the assertive announcer should be empty
    const liveRegions = document.querySelectorAll('[aria-live="assertive"]');
    expect(liveRegions.length).toBeGreaterThan(0);
    const assertive = liveRegions[liveRegions.length - 1] as HTMLElement;
    expect(assertive.textContent ?? "").toBe("");

    // Run out the cooldown
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    // The dedicated announcer mentions cooldown ended AND that the button is focused
    await waitFor(() => {
      expect(assertive.textContent ?? "").toMatch(/cooldown ended/i);
      expect(assertive.textContent ?? "").toMatch(/send invitation/i);
      expect(assertive.textContent ?? "").toMatch(/focused/i);
    });

    // And it clears after its 4s timeout so it can re-announce next cycle
    await act(async () => {
      vi.advanceTimersByTime(4_000);
    });
    await waitFor(() => expect(assertive.textContent ?? "").toBe(""));
  });
});
