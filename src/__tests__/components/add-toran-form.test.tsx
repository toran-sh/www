import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddToranForm } from "@/app/dashboard/add-toran-form";

describe("AddToranForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render the form with required fields", () => {
    render(<AddToranForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Create new toran")).toBeInTheDocument();
    expect(screen.getByLabelText(/Upstream Base URL/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create toran/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    render(<AddToranForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should submit the form with upstream URL", async () => {
    const mockToran = {
      _id: "123",
      subdomain: "abc123xy",
      upstreamBaseUrl: "https://api.example.com",
      createdAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockToran,
    });

    render(<AddToranForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create toran/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/torans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upstreamBaseUrl: "https://api.example.com", cacheTtl: null }),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockToran);
    });
  });

  it("should display error message on API failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to create toran" }),
    });

    render(<AddToranForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create toran/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create toran")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should show loading state while submitting", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ _id: "123", subdomain: "test1234", upstreamBaseUrl: "https://test.com", createdAt: new Date().toISOString() }),
      }), 100))
    );

    render(<AddToranForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create toran/i }));

    expect(screen.getByRole("button", { name: /Creating.../i })).toBeInTheDocument();
  });
});
