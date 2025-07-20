// vibe-source: https://mock.vibeplatform.dev/components/Card
// version: 1.0.0

export const Card = ({ title, children }) => (
  <div className="border rounded p-4 shadow">
    <h3 className="font-bold text-lg">{title}</h3>
    <div>{children}</div>
  </div>
);