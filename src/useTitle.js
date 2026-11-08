// Sets the browser tab's title for a page, like "Subjects · StudyQuest".
// Screen readers announce it, and it makes tabs easy to tell apart.
import { useEffect } from "react";

export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · StudyQuest` : "StudyQuest";
  }, [title]);
}
