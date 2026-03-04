export const searchNotes = async (query: string) => {
  const response = await fetch(
    `https://nowted-server.remotestate.com/notes?search=${query}`
  );

  const data = await response.json();
  return data.notes || [];
};

export const createNote = async (folderId: string) => {
  const response = await fetch(
    "https://nowted-server.remotestate.com/notes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId,
        title: "Untitled Note",
        content: "",
        isFavorite: false,
        isArchived: false,
      }),
    }
  );

  return response.json();
};