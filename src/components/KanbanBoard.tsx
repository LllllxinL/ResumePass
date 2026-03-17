import { useState } from 'react';
import type { Application } from '../types';
import { STATUS_CONFIG, STATUS_ORDER } from '../types';
import { Briefcase, MoreHorizontal } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
  onStatusChange: (id: string, status: Application['status']) => void;
}

export const KanbanBoard = ({ applications, onCardClick, onStatusChange }: KanbanBoardProps) => {
  const [draggedApp, setDraggedApp] = useState<string | null>(null);

  // 按状态分组
  const groupedApps = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<string, Application[]>);

  const handleDragStart = (appId: string) => {
    setDraggedApp(appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedApp) {
      onStatusChange(draggedApp, status as Application['status']);
      setDraggedApp(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {STATUS_ORDER.map((status) => {
          const config = STATUS_CONFIG[status];
          const apps = groupedApps[status] || [];

          return (
            <div
              key={status}
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className={`rounded-t-lg px-3 py-2 border-b-2 ${config.bgColor} ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${config.color}`}>{config.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                    {apps.length}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-lg p-2 min-h-[200px] space-y-2">
                {apps.map((app) => (
                  <KanbanCard
                    key={app.id}
                    application={app}
                    onCardClick={() => onCardClick(app)}
                    onDragStart={() => handleDragStart(app.id)}
                  />
                ))}
                {apps.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无记录
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface KanbanCardProps {
  application: Application;
  onCardClick: () => void;
  onDragStart: () => void;
}

const KanbanCard = ({ application, onCardClick, onDragStart }: KanbanCardProps) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onCardClick}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{application.companyName}</h4>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
        <Briefcase className="w-3 h-3" />
        {application.jobTitle}
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {application.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            {tag}
          </span>
        ))}
        {application.priority === 'high' && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
            高优
          </span>
        )}
      </div>
    </div>
  );
};
