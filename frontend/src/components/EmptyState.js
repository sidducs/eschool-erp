import { FaInbox } from "react-icons/fa";

function EmptyState({ title, description, icon: Icon = FaInbox, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center animate-fadeIn">
      <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button 
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5" 
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
