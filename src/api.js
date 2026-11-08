// Every request to the backend goes through here, so errors are handled the same way everywhere.

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach StudyQuest's server. Check your internet connection.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // The backend sends { error: "..." } when something is wrong.
    throw new Error(data?.error ?? `The server replied with error ${response.status}.`);
  }
  return data;
}

export const api = {
  health: () => request("GET", "/health"),
  subjects: () => request("GET", "/subjects"),
  stats: (today) => request("GET", `/stats?today=${today}`),
};

// Assignments. filters is an object like { search: "math", subject: 1, status: "todo", sort: "due" }.
export const assignments = {
  list: (filters = {}) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== "" && value != null)
    ).toString();
    return request("GET", `/assignments${query ? "?" + query : ""}`);
  },
  get: (id) => request("GET", `/assignments/${id}`),
  create: (assignment) => request("POST", "/assignments", assignment),
  update: (id, changes) => request("PUT", `/assignments/${id}`, changes),
  remove: (id) => request("DELETE", `/assignments/${id}`),
  complete: (id, today) => request("POST", `/assignments/${id}/complete`, { today }),
  undo: (id) => request("DELETE", `/assignments/${id}/complete`),
};
