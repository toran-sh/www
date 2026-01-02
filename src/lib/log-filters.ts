// Log filter types and defaults
export interface LogFilter {
  field: string; // Header name or parameter name (case-insensitive for headers)
  location: "header" | "query" | "body"; // Where the field is located
  action: "mask" | "exclude"; // mask = replace value with ***, exclude = remove entirely
}

export interface LogFilters {
  request: LogFilter[];
  response: LogFilter[];
}

// Sensible defaults - mask common auth headers
export const DEFAULT_LOG_FILTERS: LogFilters = {
  request: [
    { field: "authorization", location: "header", action: "mask" },
    { field: "x-api-key", location: "header", action: "mask" },
    { field: "api-key", location: "header", action: "mask" },
    { field: "x-auth-token", location: "header", action: "mask" },
    { field: "cookie", location: "header", action: "mask" },
  ],
  response: [
    { field: "set-cookie", location: "header", action: "mask" },
  ],
};

// Apply mask to a value
function maskValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.length <= 4) return "***";
    // Show first 4 chars then mask the rest
    return value.substring(0, 4) + "***";
  }
  return "***";
}

// Apply filters to headers object
export function applyHeaderFilters(
  headers: Record<string, string> | undefined,
  filters: LogFilter[]
): Record<string, string> | undefined {
  if (!headers) return headers;

  const headerFilters = filters.filter((f) => f.location === "header");
  if (headerFilters.length === 0) return headers;

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    const filter = headerFilters.find((f) => f.field.toLowerCase() === lowerKey);

    if (filter) {
      if (filter.action === "exclude") {
        // Skip this header entirely
        continue;
      } else if (filter.action === "mask") {
        result[key] = maskValue(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Apply filters to query params object
export function applyQueryFilters(
  query: Record<string, string> | undefined,
  filters: LogFilter[]
): Record<string, string> | undefined {
  if (!query) return query;

  const queryFilters = filters.filter((f) => f.location === "query");
  if (queryFilters.length === 0) return query;

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    const lowerKey = key.toLowerCase();
    const filter = queryFilters.find((f) => f.field.toLowerCase() === lowerKey);

    if (filter) {
      if (filter.action === "exclude") {
        continue;
      } else if (filter.action === "mask") {
        result[key] = maskValue(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Apply filters to body (handles nested objects)
export function applyBodyFilters(
  body: unknown,
  filters: LogFilter[]
): unknown {
  if (!body || typeof body !== "object") return body;

  const bodyFilters = filters.filter((f) => f.location === "body");
  if (bodyFilters.length === 0) return body;

  // Handle arrays
  if (Array.isArray(body)) {
    return body.map((item) => applyBodyFilters(item, filters));
  }

  // Handle objects
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const filter = bodyFilters.find((f) => f.field.toLowerCase() === lowerKey);

    if (filter) {
      if (filter.action === "exclude") {
        continue;
      } else if (filter.action === "mask") {
        result[key] = maskValue(value);
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively filter nested objects
      result[key] = applyBodyFilters(value, filters);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Apply all filters to a request object
export function applyRequestFilters(
  request: {
    method?: string;
    path?: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  },
  filters: LogFilter[]
): typeof request {
  return {
    ...request,
    headers: applyHeaderFilters(request.headers, filters),
    query: applyQueryFilters(request.query, filters),
    body: applyBodyFilters(request.body, filters),
  };
}

// Apply all filters to a response object
export function applyResponseFilters(
  response: {
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
    bodySize?: number;
  },
  filters: LogFilter[]
): typeof response {
  return {
    ...response,
    headers: applyHeaderFilters(response.headers, filters),
    body: applyBodyFilters(response.body, filters),
  };
}
