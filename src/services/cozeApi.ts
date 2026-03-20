const COZE_API_URL = 'https://api.coze.cn/v1/workflow/run';
const WORKFLOW_ID = '7619198473276096564';
const COZE_TOKEN = 'pat_UMLU8DhvkpSRUsgrcogz7BAFnqyo9uL05whdXUQM9CxJvSn1tUKUGt4hTIUj2ibC';

export interface Experience {
  id: string;
  type: 'internship' | 'project' | 'campus' | 'skill';
  title: string;
  organization?: string;
  role?: string;
  duration?: string;
  description: string;
  keywords?: string[];
}

export interface UserExperiences {
  internships: Experience[];
  projects: Experience[];
  campus: Experience[];
  skills: string[];
}

export interface CozeWorkflowResult {
  jd_analysis: {
    company: string;
    position: string;
    position_type: string;
    core_requirements: string[];
    required_skills: string[];
    preferred_skills: string[];
    responsibilities: string[];
    capabilities_needed: string[];
    keywords: string[];
  };
  matching_result: {
    matched_experiences: Array<{
      experience_id: string;
      match_score: number;
      match_reason: string;
      relevant_skills?: string[];
    }>;
    gap_analysis: {
      missing_skills: string[];
      suggestions: string;
    };
  };
  generated_content: {
    personal_summary: string;
    matched_experiences: Array<{
      experience_id: string;
      original: string;
      optimized: string;
      star_breakdown?: {
        situation: string;
        task: string;
        action: string;
        result: string;
      };
      keywords_matched?: string[];
    }>;
    skills_highlight: string[];
    full_resume_text: string;
  };
}

export const generateResumeWithCoze = async (
  allExperiences: UserExperiences,
  jobDescription: string,
  companyName: string,
  positionName: string
): Promise<CozeWorkflowResult> => {
  const response = await fetch(COZE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COZE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: WORKFLOW_ID,
      parameters: {
        all_experiences: allExperiences,
        job_description: jobDescription,
        company_name: companyName,
        position_name: positionName,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `调用 Coze 工作流失败: ${response.status}`);
  }

  const result = await response.json();

  if (result.data && result.data.output) {
    return result.data.output as CozeWorkflowResult;
  }

  return result as CozeWorkflowResult;
};

export const hasExperiences = (experiences: UserExperiences): boolean => {
  return (
    experiences.internships.length > 0 ||
    experiences.projects.length > 0 ||
    experiences.campus.length > 0 ||
    experiences.skills.length > 0
  );
};
