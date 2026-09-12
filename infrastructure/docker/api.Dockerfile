FROM python:3.12.14-alpine3.24 AS builder
RUN apk add --no-cache 'libuuid>=2.42.3-r1'

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    VIRTUAL_ENV=/opt/followread
RUN python -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /build
COPY apps/api/requirements-linux.lock ./requirements-linux.lock
RUN python -m pip install --require-hashes -r requirements-linux.lock
COPY apps/api/src/followread_api /opt/followread/lib/python3.12/site-packages/followread_api

FROM python:3.12.14-alpine3.24 AS runtime
RUN apk add --no-cache 'libuuid>=2.42.3-r1'

ENV PATH="/opt/followread/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FOLLOWREAD_ENVIRONMENT=production \
    FOLLOWREAD_DATABASE_URL=sqlite:////data/followread.db \
    FOLLOWREAD_AUDIO_OUTPUT_DIR=/data/audio \
    FOLLOWREAD_ILLUSTRATION_OUTPUT_DIR=/data/illustrations

RUN addgroup -g 10001 -S followread \
    && adduser -u 10001 -S -D -H -s /sbin/nologin -G followread followread \
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

