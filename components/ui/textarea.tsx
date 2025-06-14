export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full border rounded px-3 py-2 text-sm"
      {...props}
    />
  );
}
