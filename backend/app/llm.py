import os
from groq import Groq

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client


def chat(messages: list[dict], model: str | None = None, temperature: float = 0.7) -> str:
    """
    Send a chat request and return the assistant's reply as a string.

    messages: list of {"role": "system"|"user"|"assistant", "content": str}

    Swap provider here — change _get_client() and the default model — without
    touching any caller.
    """
    resolved_model = model or os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")
    response = _get_client().chat.completions.create(
        model=resolved_model,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content
