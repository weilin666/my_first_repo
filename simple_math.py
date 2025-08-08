"""A simple module to add two numbers."""


def add_numbers(a: int, b: int) -> int:
    """Return the sum of a and b."""
    return a + b


if __name__ == "__main__":
    result = add_numbers(2, 3)
    print(f"2 + 3 = {result}")
