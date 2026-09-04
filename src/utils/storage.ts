import { OfficerProfile, ApiConfiguration, QuotaStats, VideoRecord } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'firelog_officer_profile_v1',
  API_CONFIG: 'firelog_secure_apiconfig_v1',
  QUOTA_STATS: 'firelog_quota_stats_v1',
  VIDEOS: 'firelog_incident_videos_v1'
};

const DEFAULT_PROFILE: OfficerProfile = {
  fireStation: '해운대소방서',
  safetyCenter: '우동119안전센터',
  dispatchTeam: '펌프1팀',
  rank: '소방교',
  name: '홍길동',
  officerId: 'BS-119-0942'
};

const DEFAULT_CONFIG: ApiConfiguration = {
  busan119Key: '',
  geminiKey: ''
};

const DEFAULT_QUOTA: QuotaStats = {
  todayRequests: 14,
  totalTokensUsed: 6250,
  rateLimitProtected: true,
  lastResponseTime: 420,
  geminiCallsCount: 8,
  busan119CallsCount: 26
};

// Client-side lightweight obfuscation helper for local storage
const SALT = 'FireLog_119_Secure_Salt_v1';
function obfuscate(text: string): string {
  if (!text) return '';
  try {
    const chars = text.split('').map((c, i) => {
      const code = c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length);
      return String.fromCharCode(code);
    });
    return btoa(unescape(encodeURIComponent(chars.join(''))));
  } catch {
    return btoa(text);
  }
}

function deobfuscate(cipher: string): string {
  if (!cipher) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(cipher)));
    const chars = decoded.split('').map((c, i) => {
      const code = c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length);
      return String.fromCharCode(code);
    });
    return chars.join('');
  } catch {
    try {
      return atob(cipher);
    } catch {
      return '';
    }
  }
}

export function loadOfficerProfile(): OfficerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read officer profile from local storage', e);
    return DEFAULT_PROFILE;
  }
}

export function saveOfficerProfile(profile: OfficerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save officer profile to local storage', e);
  }
}

export function loadApiConfiguration(): ApiConfiguration {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      busan119Key: deobfuscate(parsed.busan119Key || ''),
      geminiKey: deobfuscate(parsed.geminiKey || '')
    };
  } catch (e) {
    console.warn('Failed to read API configuration from local storage', e);
    return DEFAULT_CONFIG;
  }
}

export function saveApiConfiguration(config: ApiConfiguration): void {
  try {
    const payload = {
      busan119Key: obfuscate(config.busan119Key),
      geminiKey: obfuscate(config.geminiKey),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save API configuration to local storage', e);
  }
}

export function loadQuotaStats(): QuotaStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTA_STATS);
    if (!raw) return DEFAULT_QUOTA;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_QUOTA;
  }
}

export function recordApiCall(type: 'gemini' | 'busan119', latencyMs: number = 350): QuotaStats {
  const current = loadQuotaStats();
  const updated: QuotaStats = {
    ...current,
    todayRequests: current.todayRequests + 1,
    totalTokensUsed: current.totalTokensUsed + (type === 'gemini' ? 950 : 120),
    lastResponseTime: latencyMs,
    geminiCallsCount: current.geminiCallsCount + (type === 'gemini' ? 1 : 0),
    busan119CallsCount: current.busan119CallsCount + (type === 'busan119' ? 1 : 0)
  };
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTA_STATS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function clearSecureStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.API_CONFIG);
  localStorage.removeItem(STORAGE_KEYS.QUOTA_STATS);
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••••••••••' + key.slice(-4);
}

const SAMPLE_VIDEOS: VideoRecord[] = [
  {
    id: 'VID-20260903-01',
    dispatchId: 'BS-2026-0903-01',
    fileName: 'BODYCAM_UDONG_PUMP1_0845.mp4',
    fileSize: 48234496,
    fileSizeFormatted: '46.0 MB',
    duration: 184,
    durationFormatted: '03:04',
    resolution: '1920x1080 (60fps FHD)',
    deviceType: '소방관 바디캠',
    recordedAt: '2026-09-03 08:45',
    uploadedAt: '2026-09-03 09:30',
    uploadedBy: '소방교 홍길동',
    aiAnalysisStatus: 'completed',
    aiAnalysis: {
      summary: '지하 1층 기계실 농연 구역 진입 영상. 2인 1조 대원들이 열화상 카메라를 지참하고 옥내소화전 호스 전개 후 공조기 모터 발열부 집중 방수 및 초동 진압 완수.',
      hazardsDetected: [
        '지하 1층 내부 짙은 회색 농연 및 시야 확보 불량 (가시거리 약 2m)',
        '공조기 모터 배전반 부근 스파크 잔류열 (열화상 측정 142℃)',
        '바닥 침수 및 전선 노출로 인한 감전 위험'
      ],
      timelineEvents: [
        { timestamp: '00:15', event: '방화문 개방 및 공기호흡기 양압 전환, 지하층 진입' },
        { timestamp: '00:48', event: '기계실 내부 진입 및 옥내소화전 40mm 관창 결착' },
        { timestamp: '01:25', event: '모터 과열 부위 확인 및 1차 방수 실시 (직사)' },
        { timestamp: '02:10', event: '화염 차단 확인 및 전원 차단기(MCC반) 차단 확인' },
        { timestamp: '02:50', event: '잔화 및 재발화 위험 없음 확인 후 배연기 설치 지시' }
      ],
      fireCharacteristics: 'A급 일반 가연물 및 C급 전기화재 혼재, 급기 덕트 그을음 국한',
      safetyEquipmentUsed: ['공기호흡기(SCBA)', '휴대용 열화상카메라(TIC)', '방화복/안전화/방화장갑', '40mm 관창'],
      actionTakeaways: '초동 방수 타이밍이 적절하여 2차 폭발 및 덕트 연소 확산 차단 성공'
    },
    notes: '대원 바디캠 영상 원본. 결재 상신용 영상 증빙으로 채택됨.'
  },
  {
    id: 'VID-20260903-02',
    dispatchId: 'BS-2026-0903-01',
    fileName: 'BLACKBOX_UDONG_PUMP1_DASH.mp4',
    fileSize: 104857600,
    fileSizeFormatted: '100.0 MB',
    duration: 360,
    durationFormatted: '06:00',
    resolution: '2560x1440 (QHD)',
    deviceType: '소방차 블랙박스',
    recordedAt: '2026-09-03 08:42',
    uploadedAt: '2026-09-03 09:32',
    uploadedBy: '소방교 홍길동',
    aiAnalysisStatus: 'completed',
    aiAnalysis: {
      summary: '우동119안전센터 차고 출동부터 현장 도착, 소방차량 부서 및 소방용수 공급라인 연계 전 과정 블랙박스 기록.',
      hazardsDetected: [
        '마린시티 교차로 출근 시간대 일반 차량 정체 구간 진입',
        '상가 앞 불법 주정차 차량으로 인한 사다리차 진입로 부분 간섭'
      ],
      timelineEvents: [
        { timestamp: '00:00', event: '출동 지령 접수 후 45초 만에 차고 탈출' },
        { timestamp: '02:30', event: '마린시티2로 진입 및 사이렌 경광등 긴급 피양 유도' },
        { timestamp: '04:12', event: '화재 건물 정면 지상 1층 소방전용구역 안전 부서' },
        { timestamp: '04:55', event: '인근 지상식 소화전(65mm) 점령 및 용수 공급 개시' }
      ],
      fireCharacteristics: '외부 연기 분출 경미(지하 환기창 배연 확인)',
      safetyEquipmentUsed: ['소방펌프차 1호', '소화전 연결 호스(65mm)', '차량 지상 경광유도등'],
      actionTakeaways: '골든타임(5분 이내) 4분 12초 만에 현장 선착 부서 성공'
    },
    notes: '소방차량 전방 블랙박스 영상'
  }
];

export function loadVideoRecords(dispatchId?: string): VideoRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    let list: VideoRecord[] = [];
    if (!raw) {
      list = SAMPLE_VIDEOS;
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(list));
    } else {
      list = JSON.parse(raw);
    }
    if (dispatchId) {
      return list.filter(v => v.dispatchId === dispatchId);
    }
    return list;
  } catch (e) {
    console.warn('Failed to load video records from local storage', e);
    return SAMPLE_VIDEOS;
  }
}

export function saveVideoRecord(record: VideoRecord): VideoRecord[] {
  try {
    const current = loadVideoRecords();
    const index = current.findIndex(v => v.id === record.id);
    let updated: VideoRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save video record', e);
    return loadVideoRecords();
  }
}

export function deleteVideoRecord(recordId: string): VideoRecord[] {
  try {
    const current = loadVideoRecords();
    const updated = current.filter(v => v.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete video record', e);
    return loadVideoRecords();
  }
}
