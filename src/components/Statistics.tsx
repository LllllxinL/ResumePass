import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatistics } from '../utils/storage';
import { STATUS_CONFIG, STATUS_ORDER } from '../types';
import { Briefcase, TrendingUp, Award, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#ec4899', '#14b8a6'];

export const Statistics = () => {
  const stats = useMemo(() => getStatistics(), []);

  // 状态分布数据
  const statusData = STATUS_ORDER
    .filter((status) => stats.byStatus[status])
    .map((status) => ({
      name: STATUS_CONFIG[status].label,
      value: stats.byStatus[status],
      color: STATUS_CONFIG[status].color.replace('text-', '').replace('-600', '').replace('-700', ''),
    }));

  // 渠道分布数据
  const channelData = Object.entries(stats.byChannel).map(([name, value]) => ({
    name,
    value,
  }));

  // 岗位类型分布
  const jobTypeData = Object.entries(stats.byJobType).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总投递数"
          value={stats.total}
          icon={<Briefcase className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="本周投递"
          value={stats.thisWeekCount}
          icon={<Calendar className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="面试转化率"
          value={`${stats.interviewRate}%`}
          subtitle={`${stats.interviewCount} 个面试`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Offer 率"
          value={`${stats.offerRate}%`}
          subtitle={`${stats.offerCount} 个 Offer`}
          icon={<Award className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 状态分布 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">投递状态分布</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </div>

        {/* 渠道分布 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">投递渠道分布</h3>
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* 岗位类型分布 */}
      {jobTypeData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">岗位类型分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={jobTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 求职漏斗 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">求职漏斗</h3>
        <div className="flex items-center justify-between">
          {[
            { label: '已投递', value: stats.total, color: 'bg-gray-500' },
            { label: '简历通过', value: stats.interviewCount + stats.offerCount, color: 'bg-blue-500' },
            { label: '获得 Offer', value: stats.offerCount, color: 'bg-green-500' },
          ].map((stage, index, arr) => (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex-1 text-center">
                <div className={`${stage.color} text-white rounded-lg py-4 px-2`}>
                  <div className="text-2xl font-bold">{stage.value}</div>
                  <div className="text-sm opacity-90">{stage.label}</div>
                </div>
                {index < arr.length - 1 && (
                  <div className="text-center mt-2 text-sm text-gray-500">
                    转化率: {stage.value > 0 ? Math.round((arr[index + 1].value / stage.value) * 100) : 0}%
                  </div>
                )}
              </div>
              {index < arr.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};
