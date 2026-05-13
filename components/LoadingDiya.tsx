interface LoadingDiyaProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
};

export default function LoadingDiya({
  message,
  subMessage,
  size = "md",
}: LoadingDiyaProps) {
  return (
    <div className="bg-transparent flex flex-col items-center gap-3">
      <span className={`flicker ${sizeClass[size]}`}>🪔</span>
      {message && (
        <p className="font-semibold text-gray-700">{message}</p>
      )}
      {subMessage && (
        <p className="text-sm text-gray-400">{subMessage}</p>
      )}
    </div>
  );
}
