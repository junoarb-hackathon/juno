# Dockerfile (FINAL HACKATHON VERSION FOR POETRY)

# --- STAGE 1: The "Builder" ---
# This stage installs poetry and your project dependencies into a virtual environment.
FROM python:3.11 as builder

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy only the files that define your dependencies
COPY pyproject.toml poetry.lock ./

# Tell poetry to create the virtual environment inside the project folder
RUN poetry config virtualenvs.in-project true

# Install dependencies.
# --no-dev: Skips development packages like pytest.
# --no-interaction: Prevents it from asking questions.
# --no-ansi: For cleaner logs.
RUN poetry install --no-dev --no-interaction --no-ansi


# --- STAGE 2: The "Final Image" ---
# This stage copies the app code and the pre-built virtual environment
# into a slim, efficient final container.
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment created in the builder stage
COPY --from=builder /app/.venv ./.venv

# Copy your application code
COPY . .

# Tell the container to use the python from your virtual environment
# so it can find all the installed packages.
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port and run the application
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]