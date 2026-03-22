const COZE_API_URL = 'https://api.coze.cn/v1/workflow/run';
const WORKFLOW_ID = '7619198473276096564';
const JD_PARSER_WORKFLOW_ID = '7619991586596913171';
const COZE_TOKEN = import.meta.env.VITE_COZE_TOKEN;

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
  resume_text: string;
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

  // Coze API returns data as a JSON string
  if (result.code !== 0) {
    throw new Error(result.msg || `Coze 工作流执行失败: code ${result.code}`);
  }

  let parsed: CozeWorkflowResult;
  try {
    // Layer 1: result.data may be a JSON string
    const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    console.log('[Coze] parsed data:', data);

    // Layer 2: data.output may also be a JSON string (LLM output)
    let output = data.output ?? data;
    if (typeof output === 'string') {
      output = JSON.parse(output);
    }
    console.log('[Coze] final output:', output);

    parsed = output as CozeWorkflowResult;
  } catch (e) {
    console.error('[Coze] parse error, raw result:', result);
    throw new Error('解析工作流返回结果失败，请检查工作流输出格式');
  }

  return parsed;
};

export interface JDParseResult {
  companyName: string;
  jobTitle: string;
  jobType: string;
  city: string;
  salaryRange: string;
  tags: string[];
}

export const parseJDWithCoze = async (jobDescription: string): Promise<JDParseResult> => {
  const response = await fetch(COZE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COZE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: JD_PARSER_WORKFLOW_ID,
      parameters: {
        job_description: jobDescription,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `调用 Coze 工作流失败: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 0) {
    throw new Error(result.msg || `Coze 工作流执行失败: code ${result.code}`);
  }

  try {
    const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    let output = data.result ?? data.output ?? data;
    if (typeof output === 'string') {
      // 去掉可能的 markdown 代码块包裹
      output = output.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      output = JSON.parse(output);
    }
    return output as JDParseResult;
  } catch (e) {
    console.error('[Coze JD Parser] parse error, raw result:', result);
    throw new Error('解析工作流返回结果失败');
  }
};

export const hasExperiences = (experiences: UserExperiences): boolean => {
  return (
    experiences.internships.length > 0 ||
    experiences.projects.length > 0 ||
    experiences.campus.length > 0 ||
    experiences.skills.length > 0
  );
};
