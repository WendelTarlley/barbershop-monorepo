type ParsedBody = Record<string, unknown> | string | null;

export async function errorInterceptor(response: Response) {
  const responseData = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    const rawMessage =
      typeof responseData === 'string'
        ? responseData
        : (responseData as Record<string, unknown>)?.message;
    const message =
      typeof rawMessage === 'string' && rawMessage.trim().length > 0
        ? rawMessage
        : 'Erro na requisicao';

    throw new Error(message);
  }

  return responseData;
}

async function parseResponseBody(response: Response): Promise<ParsedBody> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return text;
  }
}
