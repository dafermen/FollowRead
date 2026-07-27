FROM python:3.12.13-slim-bookworm AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    VIRTUAL_ENV=/opt/followread
RUN python -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /build
COPY apps/api/pyproject.toml ./pyproject.toml
COPY apps/api/src ./src
RUN python -m pip install --upgrade "pip>=26.1.2,<27" \
    && python -m pip install .

FROM python:3.12.13-slim-bookworm AS runtime

ENV PATH="/opt/followread/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FOLLOWREAD_ENVIRONMENT=production \
    FOLLOWREAD_DATABASE_URL=sqlite:////data/followread.db \
    FOLLOWREAD_AUDIO_OUTPUT_DIR=/data/audio \
    FOLLOWREAD_ILLUSTRATION_OUTPUT_DIR=/data/illustrations

RUN groupadd --gid 10001 followread \
    && useradd --uid 10001 --gid followread --no-create-home --shell /usr/sbin/nologin followread \
    && mkdir -p /app /data/audio /data/illustrations /data/backups \
    && chown -R followread:followread /app /data

COPY --from=builder /opt/followread /opt/followread
COPY apps/api/alembic.ini /app/alembic.ini
COPY apps/api/migrations /app/migrations

WORKDIR /app
USER 10001:10001
EXPOSE 8000

HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/ready', timeout=3)"]

CMD ["uvicorn", "followread_api.main:app", "--host", "0.0.0.0", "--port", "8000"]

