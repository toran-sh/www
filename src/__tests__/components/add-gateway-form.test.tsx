import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddGatewayForm } from "@/app/dashboard/add-gateway-form";

describe("AddGatewayForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render the form with required fields", () => {
    render(<AddGatewayForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Create New Gateway")).toBeInTheDocument();
    expect(screen.getByLabelText(/Upstream Base URL/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Gateway/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    render(<AddGatewayForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should submit the form with upstream URL", async () => {
    const mockGateway = {
      _id: "123",
      subdomain: "abc123xy",
      upstreamBaseUrl: "https://api.example.com",
      createdAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGateway,
    });

    render(<AddGatewayForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Gateway/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upstreamBaseUrl: "https://api.example.com" }),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockGateway);
    });
  });

  it("should display error message on API failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to create gateway" }),
    });

    render(<AddGatewayForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Gateway/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create gateway")).toBeInTheDocument();
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

    render(<AddGatewayForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const input = screen.getByLabelText(/Upstream Base URL/i);
    fireEvent.change(input, { target: { value: "https://api.example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Gateway/i }));

    expect(screen.getByRole("button", { name: /Creating.../i })).toBeInTheDocument();
  });
});
