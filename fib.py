import time
import numpy as np
from numba import jit

@jit(nopython=True)
def fib_iterative(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

start = time.time()
result = fib_iterative(100_000)  # Example for a reasonable n value
end = time.time()

print(f"Fibonacci result: {result}")
print(f"Time taken: {end - start} seconds")