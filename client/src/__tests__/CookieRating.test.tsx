import { render, screen, fireEvent } from "@testing-library/react";
import CookieRating from "../components/CookieRating";

describe("CookieRating", () => {
  it("renders 5 rating buttons", () => {
    render(<CookieRating rating={null} onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("calls onChange with clicked value", () => {
    const onChange = vi.fn();
    render(<CookieRating rating={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Rate 3 out of 5"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange with null when clicking the current rating (toggle off)", () => {
    const onChange = vi.fn();
    render(<CookieRating rating={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Rate 3 out of 5"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with new value when clicking a different rating", () => {
    const onChange = vi.fn();
    render(<CookieRating rating={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Rate 5 out of 5"));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
