import { getConfidenceColor } from "../../../../utils";
function ClassificationBadge({ classification, confidence, isTag = false }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-auto self-start ${getConfidenceColor(
        confidence,
        isTag
      )}`}
    >
      {classification} {Math.round(confidence * 100)}%
    </span>
  );
}

export default ClassificationBadge;
