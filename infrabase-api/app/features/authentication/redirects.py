from urllib.parse import urlsplit


def safe_return_to(value: str | None) -> str:
    if not value:
        return "/"
    try:
        parsed = urlsplit(value)
    except ValueError:
        return "/"
    if parsed.scheme or parsed.netloc or not value.startswith("/") or value.startswith("//"):
        return "/"
    if "\\" in value or "\x00" in value:
        return "/"
    return value
