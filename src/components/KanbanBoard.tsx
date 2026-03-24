import { useState, useRef } from 'react';
import type { Application } from '../types';
import { STATUS_CONFIG, STATUS_ORDER } from '../types';
import { Briefcase, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
  onStatusChange: (id: string, status: Application['status']) => void;
}

export const KanbanBoard = ({ applications, onCardClick, onStatusChange }: KanbanBoardProps) => {
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 同步横向滚动
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // 横向滚动控制（同时滚动内容和顶部标签）
  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = 300;
    const delta = direction === 'left' ? -scrollAmount : scrollAmount;
    if (contentRef.current) {
      contentRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
    if (headerRef.current) {
      headerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

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

  // 移动端：只展示有内容的状态分组
  const mobileStatuses = STATUS_ORDER.filter(
    (status) => (groupedApps[status] || []).length > 0
  );

  return (
    <>
      {/* 移动端：竖向列表 */}
      <div className="md:hidden space-y-3">
        {applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base">暂无投递记录</p>
            <p className="text-sm mt-1">点击右上角 + 添加</p>
          </div>
        ) : (
          mobileStatuses.map((status) => {
            const config = STATUS_CONFIG[status];
            const apps = groupedApps[status] || [];
            return (
              <div key={status}>
                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${config.bgColor} mb-2`}>
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/60 ${config.color}`}>
                    {apps.length}
                  </span>
                </div>
                <div className="space-y-2 pl-1">
                  {apps.map((app) => (
                    <MobileCard
                      key={app.id}
                      application={app}
                      onCardClick={() => onCardClick(app)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 桌面端：横向看板 */}
      <div className="hidden md:block">
        {/* 顶部控制栏：状态标签 + 滚动按钮 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div ref={headerRef} className="flex-1 overflow-x-hidden">
            <div className="flex gap-4 min-w-max">
              {STATUS_ORDER.map((status) => {
                const config = STATUS_CONFIG[status];
                const apps = groupedApps[status] || [];
                return (
                  <div
                    key={status}
                    className={`w-72 flex-shrink-0 rounded-lg px-3 py-2 border-2 cursor-pointer hover:opacity-80 transition-opacity ${config.bgColor} ${config.borderColor}`}
                    onClick={() => {
                      // 滚动到该列
                      const columnIndex = STATUS_ORDER.indexOf(status);
                      const scrollPos = columnIndex * 296;
                      if (contentRef.current) {
                        contentRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
                      }
                      if (headerRef.current) {
                        headerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${config.color}`}>{config.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-white/60 ${config.color}`}>
                        {apps.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 看板内容区域 */}
        <div
          ref={contentRef}
          onScroll={handleContentScroll}
          className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)]"
        >
          <div className="flex gap-4 min-w-max pb-4">
            {STATUS_ORDER.map((status) => {
              const apps = groupedApps[status] || [];

              return (
                <div
                  key={status}
                  className="w-72 flex-shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="bg-gray-50 rounded-lg p-2 min-h-[200px] space-y-2">
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
      </div>
    </>
  );
};

interface KanbanCardProps {
  application: Application;
  onCardClick: () => void;
  onDragStart: () => void;
}

interface MobileCardProps {
  application: Application;
  onCardClick: () => void;
}

const MobileCard = ({ application, onCardClick }: MobileCardProps) => {
  return (
    <div
      onClick={onCardClick}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{application.companyName}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{application.jobTitle}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {application.priority === 'high' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">高优</span>
          )}
          {application.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

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
