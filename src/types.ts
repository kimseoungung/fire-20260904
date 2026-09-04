export interface OfficerProfile {
  fireStation: string;        // 소속 소방서 (예: 해운대소방서)
  safetyCenter: string;       // 소속 안전센터/구조대 (예: 우동119안전센터)
  dispatchTeam: string;       // 진압/구조대 지정 (예: 펌프1팀)
  rank: string;               // 계급 (예: 소방교)
  name: string;               // 성명 (예: 홍길동)
  officerId?: string;         // 대원 식별 번호 (예: BS-119-4821)
}

export interface ApiConfiguration {
  busan119Key: string;        // 공공데이터포털(부산 119 API) Service Key
  geminiKey: string;          // Google AI Studio (Gemini API) Key
}

export interface ApiValidationState {
  busan119: {
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    latencyMs?: number;
    testedAt?: string;
  };
  gemini: {
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    latencyMs?: number;
    testedAt?: string;
  };
}

export interface VideoRecord {
  id: string;
  dispatchId: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  videoUrl?: string;
  duration?: number;
  durationFormatted: string;
  resolution?: string;
  deviceType: '소방관 바디캠' | '소방차 블랙박스' | '소방 드론 항공촬영' | '현장 휴대폰/태블릿' | '열화상 카메라 영상';
  recordedAt: string;
  uploadedAt: string;
  uploadedBy: string;
  aiAnalysisStatus: 'idle' | 'analyzing' | 'completed' | 'failed';
  aiAnalysis?: {
    summary: string;
    hazardsDetected: string[];
    timelineEvents: { timestamp: string; event: string }[];
    fireCharacteristics?: string;
    safetyEquipmentUsed?: string[];
    actionTakeaways?: string;
  };
  notes?: string;
}

export interface FireDispatch {
  id: string;
  station: string;            // 관할 소방서
  center: string;             // 관할 안전센터
  category: '화재' | '구조' | '구급' | '생활안전' | '기타';
  urgency: '긴급' | '일반' | '지원';
  dispatchedAt: string;       // 지령 일시 (예: 2026-09-03 08:42)
  location: string;           // 출동 위치 (예: 부산광역시 해운대구 우동 1408)
  title: string;              // 사고/상황 요약
  assignedTeams: string[];    // 동원 출동대 (예: ['우동 펌프1팀', '우동 탱크1팀', '해운대 구조1팀'])
  status: '출동중' | '현장활동' | '귀소중' | '완료';
  details: string;            // 상황 세부 설명
  videoCount?: number;        // 등록된 영상 수
}

export interface FireActivityLog {
  id: string;
  dispatchId: string;
  documentNumber: string;
  date: string;
  weather: string;
  commandOfficer: string;
  writerRank: string;
  writerName: string;
  team: string;
  safetyCenter: string;
  fireStation: string;
  summary: string;
  timeline: { time: string; action: string }[];
  equipmentDeployed: string[];
  personnelCount: number;
  damageAssessment: {
    casualty: string;
    propertyDamage: string;
  };
  actionDetails: string;
  videoEvidence?: {
    videoId: string;
    fileName: string;
    deviceType: string;
    keyFindings: string;
  }[];
  createdAt: string;
  approvalLine: {
    drafter: { rank: string; name: string; signed: boolean; signedAt: string };
    supervisor: { rank: string; name: string; signed: boolean; signedAt: string };
    centerChief: { rank: string; name: string; signed: boolean; signedAt: string };
  };
}

export interface QuotaStats {
  todayRequests: number;
  totalTokensUsed: number;
  rateLimitProtected: boolean;
  lastResponseTime: number;
  geminiCallsCount: number;
  busan119CallsCount: number;
}
