"use client";

interface Model {
  id: string;
  label: string;
}

interface ModelSelectorProps {
  currentModel: string;
  models: Model[];
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  currentModel,
  models,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center gap-4">
        <label className="text-slate-300 font-medium">AI Model:</label>
        <select
          value={currentModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">🏠 All chats saved locally</span>
      </div>
    </div>
  );
}
