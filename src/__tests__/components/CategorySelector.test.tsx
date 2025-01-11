import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategorySelector from "../../components/CategorySelector";

describe("CategorySelector", () => {
    const mockOnSelect = jest.fn();
    const defaultProps = {
        allCategories: ["Math", "Physics", "Chemistry"],
        selectedCategory: "",
        onSelect: mockOnSelect,
    };

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test("renders input field with placeholder", () => {
        render(<CategorySelector {...defaultProps} />);
        expect(
            screen.getByPlaceholderText("Select or type a category"),
        ).toBeInTheDocument();
    });

    test("shows dropdown when input is focused", () => {
        render(<CategorySelector {...defaultProps} />);
        const input = screen.getByPlaceholderText("Select or type a category");
        fireEvent.focus(input);

        // Check if all categories are shown
        defaultProps.allCategories.forEach((category) => {
            expect(screen.getByText(category)).toBeInTheDocument();
        });
    });

    test('shows "New Category" when typing non-existent category', async () => {
        render(<CategorySelector {...defaultProps} />);
        const input = screen.getByPlaceholderText("Select or type a category");

        await userEvent.type(input, "Biology");

        expect(screen.getByText("New Category")).toBeInTheDocument();
    });

    test("calls onSelect when category is clicked", () => {
        render(<CategorySelector {...defaultProps} />);
        const input = screen.getByPlaceholderText("Select or type a category");

        fireEvent.focus(input);
        fireEvent.click(screen.getByText("Math"));

        expect(mockOnSelect).toHaveBeenCalledWith("Math");
    });

    test("calls onSelect with new category when typed", async () => {
        render(<CategorySelector {...defaultProps} />);
        const input = screen.getByPlaceholderText("Select or type a category");

        await userEvent.type(input, "Biology{enter}");

        expect(mockOnSelect).toHaveBeenCalledWith("Biology");
    });

    test("closes dropdown when clicking outside", () => {
        render(
            <div>
                <div data-testid="outside">Outside</div>
                <CategorySelector {...defaultProps} />
            </div>,
        );

        const input = screen.getByPlaceholderText("Select or type a category");
        fireEvent.focus(input);

        // Verify dropdown is shown
        expect(screen.getByText("Math")).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(screen.getByTestId("outside"));

        // Verify dropdown is hidden
        expect(screen.queryByText("Math")).not.toBeInTheDocument();
    });

    test("shows selected category in input", () => {
        render(
            <CategorySelector {...defaultProps} selectedCategory="Physics" />,
        );

        const input = screen.getByDisplayValue("Physics");
        expect(input).toBeInTheDocument();
    });
});
