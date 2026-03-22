import { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Star, MessageSquare } from 'lucide-react';
import { interviewStorage, applicationStorage } from '../../utils/storage';
import type { Interview, Application } from '../../types';
import { JOB_TYPES } from '../../types';
import { InterviewWizard } from '../interview/InterviewWizard';
import { Modal } from '../Modal';

interface GroupedInterviews {
  application: Application;
  interviews: Interview[];
}

const parseQA = (notes: string): Array<{ q: string; a: string }> => {
  if (!notes) return [];
  return notes
    .split('\n\n---\n\n')
    .map(block => {
      const qMatch = block.match(/^Q: (.+)/m);
      const aMatch = block.match(/^A: ([\s\S]+)/m);
      return {
        q: qMatch?.[1]?.trim() || '',
        a: aMatch?.[1]?.trim() || '',
      };
    })
    .filter(qa => qa.q);
};

const TYPE_LABEL: Record<string, string> = {
  video: '视频',
  phone: '电话',
  onsite: '现场',
};

type WizardState =
  | null
  | { mode: 'add'; applicationId: string }
  | { mode: 'edit'; interview: Interview; applicationId: string };

export const InterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('全部');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [wizardState, setWizardState] = useState<WizardState>(null);
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [pickedAppId, setPickedAppId] = useState('');

  const loadData = async () => {
    const [ivs, apps] = await Promise.all([
      interviewStorage.getAll(),
      applicationStorage.getAll(),
    ]);
    setInterviews(ivs);
    setApplications(apps);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const grouped: GroupedInterviews[] = applications
    .filter(app => jobTypeFilter === '全部' || app.jobType === jobTypeFilter)
    .map(app => ({
      application: app,
      interviews: interviews
        .filter(iv => iv.applicationId === app.id)
        .sort((a, b) => a.round - b.round),
    }))
    .filter(group => group.interviews.length > 0);

  const filtered = search.trim()
    ? grouped.filter(({ application, interviews: ivs }) => {
        const q = search.toLowerCase();
        const inHeader =
          application.companyName.toLowerCase().includes(q) ||
          application.jobTitle.toLowerCase().includes(q);
        const inContent = ivs.some(iv =>
          (iv.notes || '').toLowerCase().includes(q) ||
          (iv.questions || '').toLowerCase().includes(q) ||
          (iv.reflections || '').toLowerCase().includes(q)
        );
        return inHeader || inContent;
      })
    : grouped;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!wizardState) return;
    if (wizardState.mode === 'edit') {
      await interviewStorage.update(wizardState.interview.id, data);
    } else {
      await interviewStorage.create(data);
    }
    setWizardState(null);
    loadData();
  };

  const handleStartAdd = () => {
    if (applications.length === 0) return;
    setPickedAppId(applications[0].id);
    setShowAppPicker(true);
  };

  const handleConfirmAdd = () => {
    if (!pickedAppId) return;
    setShowAppPicker(false);
    setWizardState({ mode: 'add', applicationId: pickedAppId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索公司、岗位或面试内容..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={jobTypeFilter}
          onChange={e => setJobTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white flex-shrink-0"
        >
          <option value="全部">全部类型</option>
          {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={handleStartAdd}
          disabled={applications.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新增面经</span>
        </button>
      </div>

      {/* 面经列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-base">
            {interviews.length === 0 ? '还没有面经记录' : '没有匹配的面经'}
          </p>
          <p className="text-sm mt-1">
            {interviews.length === 0 ? '点击右上角「新增面经」开始记录' : '尝试调整筛选条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ application, interviews: ivs }) => (
            <div
              key={application.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* 投递信息头 */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900">{application.companyName}</span>
                  <span className="text-gray-300 mx-2">·</span>
                  <span className="text-gray-600 text-sm">{application.jobTitle}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full flex-shrink-0">
                  {application.jobType}
                </span>
              </div>

              {/* 面试轮次列表 */}
              <div className="divide-y divide-gray-100">
                {ivs.map(iv => {
                  const isExpanded = expandedIds.has(iv.id);
                  const qaList = parseQA(iv.notes || '');
                  return (
                    <div key={iv.id}>
                      {/* 轮次行 */}
                      <div
                        className="flex items-center gap-2 px-5 py-3 cursor-pointer hover:bg-gray-50 select-none"
                        onClick={() => toggleExpand(iv.id)}
                      >
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium flex-shrink-0">
                          {iv.roundName}
                        </span>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {iv.scheduledDate?.slice(0, 10)}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {TYPE_LABEL[iv.interviewType] ?? iv.interviewType}
                        </span>
                        {iv.rating != null && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < iv.rating!
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200 fill-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex-1" />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setWizardState({
                              mode: 'edit',
                              interview: iv,
                              applicationId: application.id,
                            });
                          }}
                          className="text-xs text-primary-600 hover:text-primary-800 hover:underline flex-shrink-0 px-2"
                        >
                          编辑
                        </button>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        }
                      </div>

                      {/* 展开内容 */}
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-gray-50/40 space-y-3">
                          {qaList.length > 0 ? (
                            <div className="space-y-2 pt-2">
                              {qaList.map((qa, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg border border-gray-100 p-3"
                                >
                                  <p className="text-sm font-medium text-gray-800 mb-1.5">
                                    Q{idx + 1}. {qa.q}
                                  </p>
                                  {qa.a && (
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                      {qa.a}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : iv.notes ? (
                            <p className="text-sm text-gray-600 pt-2 whitespace-pre-wrap leading-relaxed">
                              {iv.notes}
                            </p>
                          ) : null}

                          {iv.reflections && (
                            <div className="pt-1 border-t border-gray-100 mt-2">
                              <p className="text-xs font-medium text-gray-400 mb-1">复盘总结</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {iv.reflections}
                              </p>
                            </div>
                          )}

                          {!iv.notes && !iv.reflections && (
                            <p className="text-sm text-gray-400 pt-2">暂无笔记内容</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 选择投递弹窗 */}
      <Modal
        isOpen={showAppPicker}
        onClose={() => setShowAppPicker(false)}
        title="选择关联投递"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">为新面经选择对应的投递岗位</p>
          <select
            value={pickedAppId}
            onChange={e => setPickedAppId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            {applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.companyName} · {app.jobTitle}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAppPicker(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={!pickedAppId}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              确认
            </button>
          </div>
        </div>
      </Modal>

      {/* 面经向导弹窗 */}
      <Modal
        isOpen={wizardState !== null}
        onClose={() => setWizardState(null)}
        title={wizardState?.mode === 'edit' ? '编辑面经' : '新增面经'}
        size="lg"
      >
        {wizardState && (
          <InterviewWizard
            applicationId={wizardState.applicationId}
            initialData={wizardState.mode === 'edit' ? wizardState.interview : undefined}
            onSave={handleSave}
            onCancel={() => setWizardState(null)}
          />
        )}
      </Modal>
    </div>
  );
};
