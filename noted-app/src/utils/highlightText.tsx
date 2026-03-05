

export const highlightText = (text: string, query: string) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");

  return text.split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-yellow-400 text-black">
        {part}
      </span>
    ) : (
      part
    )
  );
};