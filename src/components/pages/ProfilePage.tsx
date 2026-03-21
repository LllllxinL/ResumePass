import { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, FolderGit2, GraduationCap, Star } from 'lucide-react';
import { getAllExperiences, addExperience, deleteExperience, updateSkills } from '../../utils/experienceStorage';
import type { Experience, UserExperiences } from '../../services/cozeApi';

export const ProfilePage = () => {
  const [experiences, setExperiences] = useState<UserExperiences>({
    internships: [],
    projects: [],
    campus: [],
    skills: [],
  });
  const [activeTab, setActiveTab] = useState<'internships' | 'projects' | 'campus' | 'skills'>('internships');
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    getAllExperiences().then(setExperiences);
  }, []);

  const handleAddExperience = async (type: Experience['type'], data: Omit<Experience, 'id' | 'type'>) => {
    await addExperience({ ...data, type });
    const updated = await getAllExperiences();
    setExperiences(updated);
    setIsAdding(false);
  };

  const handleDeleteExperience = async (id: string, type: Experience['type']) => {
    if (confirm('确定删除这条经历吗？')) {
      await deleteExperience(id, type);
      const updated = await getAllExperiences();
      setExperiences(updated);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() && !experiences.skills.includes(newSkill.trim())) {
      const updatedSkills = [...experiences.skills, newSkill.trim()];
      await updateSkills(updatedSkills);
      setExperiences({ ...experiences, skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    const updatedSkills = experiences.skills.filter(s => s !== skill);
    await updateSkills(updatedSkills);
    setExperiences({ ...experiences, skills: updatedSkills });
  };

  const tabs: Array<{ key: typeof activeTab; label: string; icon: typeof Briefcase }> = [
    { key: 'internships', label: '实习经历', icon: Briefcase },
    { key: 'projects', label: '项目经历', icon: FolderGit2 },
    { key: 'campus', label: '校园经历', icon: GraduationCap },
    { key: 'skills', label: '技能特长', icon: Star },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">我的档案</h2>
            <p className="text-sm text-gray-500 mt-1">
              录入你的全部经历，AI 将根据岗位 JD 自动匹配最合适的经历生成定制简历
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {experiences.internships.length + experiences.projects.length + experiences.campus.length}
            </p>
            <p className="text-xs text-gray-500">条经历</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tab.key === 'skills' ? experiences.skills.length : tab.key === 'internships' ? experiences.internships.length : tab.key === 'projects' ? experiences.projects.length : experiences.campus.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'skills' ? (
          <SkillsSection
            skills={experiences.skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
          />
        ) : activeTab === 'internships' ? (
          <ExperienceSection
            type="internship"
            experiences={experiences.internships}
            onAdd={handleAddExperience}
            onDelete={handleDeleteExperience}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
          />
        ) : activeTab === 'projects' ? (
          <ExperienceSection
            type="project"
            experiences={experiences.projects}
            onAdd={handleAddExperience}
            onDelete={handleDeleteExperience}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
          />
        ) : (
          <ExperienceSection
            type="campus"
            experiences={experiences.campus}
            onAdd={handleAddExperience}
            onDelete={handleDeleteExperience}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
          />
        )}
      </div>
    </div>
  );
};

// 经历列表组件
interface ExperienceSectionProps {
  type: 'internship' | 'project' | 'campus';
  experiences: Experience[];
  onAdd: (type: Experience['type'], data: Omit<Experience, 'id' | 'type'>) => void;
  onDelete: (id: string, type: Experience['type']) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
}

const ExperienceSection = ({ type, experiences, onAdd, onDelete, isAdding, setIsAdding }: ExperienceSectionProps) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    role: '',
    duration: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(type, formData);
    setFormData({ title: '', organization: '', role: '', duration: '', description: '' });
  };

  const titles = {
    internship: { org: '公司', role: '岗位' },
    project: { org: '项目名称', role: '担任角色' },
    campus: { org: '组织/社团', role: '职位' },
  };

  return (
    <div>
      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加{type === 'internship' ? '实习' : type === 'project' ? '项目' : '校园'}经历
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={titles[type].org}
              value={formData.organization}
              onChange={e => setFormData({ ...formData, organization: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <input
              type="text"
              placeholder={titles[type].role}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <input
            type="text"
            placeholder="时间（如：2024.03 - 2024.06）"
            value={formData.duration}
            onChange={e => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            placeholder="经历描述（建议用 STAR 法则：做了什么、取得什么成果）"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </form>
      )}

      {/* Experience List */}
      <div className="space-y-3 mt-4">
        {experiences.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>还没有{type === 'internship' ? '实习' : type === 'project' ? '项目' : '校园'}经历</p>
            <p className="text-sm mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          experiences.map(exp => (
            <div key={exp.id} className="bg-gray-50 p-4 rounded-lg group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{exp.organization}</h4>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-700">{exp.role}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{exp.duration}</p>
                  <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                </div>
                <button
                  onClick={() => onDelete(exp.id, type)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 技能组件
interface SkillsSectionProps {
  skills: string[];
  newSkill: string;
  setNewSkill: (v: string) => void;
  onAdd: () => void;
  onRemove: (skill: string) => void;
}

const SkillsSection = ({ skills, newSkill, setNewSkill, onAdd, onRemove }: SkillsSectionProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="输入技能（如：Python、数据分析、产品经理）"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={onAdd}
          disabled={!newSkill.trim()}
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>还没有添加技能</p>
          <p className="text-sm mt-1">输入技能后按回车或点击加号添加</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm group"
            >
              {skill}
              <button
                onClick={() => onRemove(skill)}
                className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center hover:bg-primary-200 rounded-full transition-all"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
