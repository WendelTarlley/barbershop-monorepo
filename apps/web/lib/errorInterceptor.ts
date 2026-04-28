export async function errorInterceptor(response: Response) {
  const responseData = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    throw {
      status: response.status,
      message:
        typeof responseData === "string"
          ? responseData
          : responseData?.message || "Erro na requisicao",
      data: responseData,
    };
  }

  return responseData;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
