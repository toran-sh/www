import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteConfirmModal } from "@/app/dashboard/delete-confirm-modal";

describe("DeleteConfirmModal", () => {
  const mockGateway = {
    _id: "123",
    subdomain: "abc123xy",
    upstreamBaseUrl: "https://api.example.com",
  };

  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render the modal with gateway info", () => {
    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole("heading", { name: "Delete Gateway" })).toBeInTheDocument();
    expect(screen.getByText(mockGateway.subdomain)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("DELETE")).toBeInTheDocument();
  });

  it("should have delete button disabled by default", () => {
    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /Delete Gateway/i });
    expect(deleteButton).toBeDisabled();
  });

  it("should enable delete button only when 'DELETE' is typed", () => {
    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("DELETE");
    const deleteButton = screen.getByRole("button", { name: /Delete Gateway/i });

    // Type partial text
    fireEvent.change(input, { target: { value: "DEL" } });
    expect(deleteButton).toBeDisabled();

    // Type wrong case
    fireEvent.change(input, { target: { value: "delete" } });
    expect(deleteButton).toBeDisabled();

    // Type correct text
    fireEvent.change(input, { target: { value: "DELETE" } });
    expect(deleteButton).not.toBeDisabled();
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should delete gateway when confirmed", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("DELETE");
    fireEvent.change(input, { target: { value: "DELETE" } });

    fireEvent.click(screen.getByRole("button", { name: /Delete Gateway/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/gateways/${mockGateway._id}`, {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("should display error message on delete failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Gateway not found" }),
    });

    render(
      <DeleteConfirmModal
        gateway={mockGateway}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("DELETE");
    fireEvent.change(input, { target: { value: "DELETE" } });

    fireEvent.click(screen.getByRole("button", { name: /Delete Gateway/i }));

    await waitFor(() => {
      expect(screen.getByText("Gateway not found")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
