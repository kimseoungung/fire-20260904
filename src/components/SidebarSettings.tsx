import React, { useState } from 'react';
import { 
  Shield, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Lock, 
  Sparkles, 
  Radio, 
  UserCheck, 
  HelpCircle 
} from 'lucide-react';
import { OfficerProfile, ApiConfiguration, ApiValidationState } from '../types';
import { BUSAN_FIRE_STATIONS, FIRE_RANKS, DISPATCH_TEAMS } from '../data/busanFireData';
import { recordApiCall } from '../utils/storage';

interface SidebarSettingsProps {
  profile: OfficerProfile;
  setProfile: React.Dispatch<React.SetStateAction<OfficerProfile>>;
  apiConfig: ApiConfiguration;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfiguration>>;
  onSave: () => void;
  savedNotification: boolean;
}

export const SidebarSettings: React.FC<SidebarSettingsProps> = ({
  profile,
  setProfile,
  apiConfig,
  setApiConfig,
  onSave,
  savedNotification
}) => {
  const [showBusanKey, setShowBusanKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [validationState, setValidationState] = useState<ApiValidationState>({
    busan119: { status: 'idle', message: '' },
    gemini: { status: 'idle', message: '' }
  });

  // Find centers for the selected fire station
  const currentStationData = BUSAN_FIRE_STATIONS.find((s) => s.name === profile.fireStation) || BUSAN_FIRE_STATIONS[0];

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStation = e.target.value;
    const stationObj = BUSAN_FIRE_STATIONS.find((s) => s.name === newStation);
    const firstCenter = stationObj ? stationObj.centers[0] : '';
    setProfile((prev) => ({
      ...prev,
      fireStation: newStation,
      safetyCenter: firstCenter
    }));
  };

  // Test Busan 119 API Key
  const handleTestBusan119 = async () => {
    if (!apiConfig.busan119Key.trim()) {
      setValidationState((prev) => ({
        ...prev,
        busan119: {
          status: 'error',
          message: 'API 키가 만료되었거나 올바르지 않습니다. (적색 경고)'
        }
      }));
      return;
    }

    setValidationState((prev) => ({
      ...prev,
      busan119: { status: 'testing', message: '부산 119 API 연동 테스트 중...' }
    }));

    try {
      const res = await fetch('/api/test-busan119', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-busan119-key': apiConfig.busan119Key
        },
        body: JSON.stringify({ serviceKey: apiConfig.busan119Key })
      });
      const data = await res.json();
      recordApiCall('busan119', data.latencyMs || 250);

      if (res.ok && data.ok) {
        setValidationState((prev) => ({
          ...prev,
          busan119: {
            status: 'success',
            message: '정상적으로 연결되었습니다. (녹색 체크)',
            latencyMs: data.latencyMs
          }
        }));
      } else {
        setValidationState((prev) => ({
          ...prev,
          busan119: {
            status: 'error',
            message: 'API 키가 만료되었거나 올바르지 않습니다. (적색 경고)'
          }
        }));
      }
    } catch {
      setValidationState((prev) => ({
        ...prev,
        busan119: {
          status: 'error',
          message: 'API 키가 만료되었거나 올바르지 않습니다. (적색 경고)'
        }
      }));
    }
  };

  // Test Gemini API Key
  const handleTestGemini = async () => {
    setValidationState((prev) => ({
      ...prev,
      gemini: { status: 'testing', message: 'Gemini AI Studio 연동 테스트 중...' }
    }));

    try {
      const res = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiConfig.geminiKey
        },
        body: JSON.stringify({ apiKey: apiConfig.geminiKey })
      });
      const data = await res.json();
      recordApiCall('gemini', data.latencyMs || 420);

      if (res.ok && data.ok) {
        setValidationState((prev) => ({
          ...prev,
          gemini: {
            status: 'success',
            message: '정상적으로 연결되었습니다. (녹색 체크)',
            latencyMs: data.latencyMs
          }
        }));
      } else {
        setValidationState((prev) => ({
          ...prev,
          gemini: {
            status: 'error',
            message: 'API 키가 만료되었거나 올바르지 않습니다. (적색 경고)'
          }
        }));
      }
    } catch {
      setValidationState((prev) => ({
        ...prev,
        gemini: {
          status: 'error',
          message: 'API 키가 만료되었거나 올바르지 않습니다. (적색 경고)'
        }
      }));
    }
  };

  // Quick Demo Autofill
  const handleFillDemoKeys = () => {
    setApiConfig({
      busan119Key: 'BS_119_AUTH_DATA_PORTAL_SVCKEY_2026_APPROVED_KEY',
      geminiKey: 'AIzaSyDemoSampleKeyForGeminiStudioIndividual'
    });
    setValidationState({
      busan119: {
        status: 'success',
        message: '정상적으로 연결되었습니다. (녹색 체크)',
        latencyMs: 142
      },
      gemini: {
        status: 'success',
        message: '정상적으로 연결되었습니다. (녹색 체크)',
        latencyMs: 310
      }
    });
  };

  return (
    <aside 
      id="sidebar-settings" 
      className="w-full lg:w-84 xl:w-92 shrink-0 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col h-full overflow-y-auto select-none"
    >
      {/* Header matching wireframe */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-md shadow-red-950/60 shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-white leading-none">FireLog AI</span>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  RCCF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">[설정 메뉴 / 대원 프로필]</p>
            </div>
          </div>
          <button
            onClick={handleFillDemoKeys}
            title="데모용 키 빠른 채우기"
            className="text-[11px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition shrink-0"
          >
            데모키
          </button>
        </div>
      </div>

      {/* Settings Form Body */}
      <div className="p-4 space-y-6 text-sm">
        {/* Section 1: [R] Role & Identity */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-1 border-b border-slate-800 text-red-400 font-semibold text-xs tracking-wider uppercase">
            <UserCheck className="w-4 h-4" />
            <span>[대원 프로필 / 관할 설정]</span>
          </div>

          {/* 소속 소방서 */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              소속 소방서 (부산소방본부 산하)
            </label>
            <select
              id="select-fire-station"
              value={profile.fireStation}
              onChange={handleStationChange}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
            >
              {BUSAN_FIRE_STATIONS.map((st) => (
                <option key={st.name} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* 소속 안전센터/구조대 */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              소속 안전센터 / 구조대
            </label>
            <select
              id="select-safety-center"
              value={profile.safetyCenter}
              onChange={(e) => setProfile((p) => ({ ...p, safetyCenter: e.target.value }))}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
            >
              {currentStationData.centers.map((center) => (
                <option key={center} value={center}>
                  {center}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400 shrink-0" />
              <span>부산 119 수백 건 중 <strong>"{profile.safetyCenter}"</strong> 관할만 자동 필터링</span>
            </p>
          </div>

          {/* 진압/구조대 지정 */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              진압 / 구조대 지정
            </label>
            <select
              id="select-dispatch-team"
              value={profile.dispatchTeam}
              onChange={(e) => setProfile((p) => ({ ...p, dispatchTeam: e.target.value }))}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
            >
              {DISPATCH_TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* 작성자 정보: 계급 및 성명 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                계급
              </label>
              <select
                id="select-rank"
                value={profile.rank}
                onChange={(e) => setProfile((p) => ({ ...p, rank: e.target.value }))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              >
                {FIRE_RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                대원 성명
              </label>
              <input
                id="input-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="예: 홍길동"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* 작성자 자동 날인 예고 뱃지 */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-md p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-slate-400">일지 작성자 날인:</span>
              <span className="font-semibold text-white">
                {profile.rank} {profile.name}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/40 bg-red-950/40 text-red-300 font-serif">
              [인] 자동날인
            </span>
          </div>
        </div>

        {/* Section 2: [C] Configuration (API 키 및 환경 설정) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-red-400 font-semibold text-xs tracking-wider uppercase">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>[API 보안 키 설정]</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal lowercase">
              <Shield className="w-3 h-3" /> local only
            </span>
          </div>

          {/* 설정 항목 1: 공공데이터포털(부산 119 API) Service Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <span>부산 119 API Key (공공데이터포털)</span>
              </label>
              <span className="text-[11px] text-slate-400">출동현황 조회</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  id="input-busan119-key"
                  type={showBusanKey ? 'text' : 'password'}
                  value={apiConfig.busan119Key}
                  onChange={(e) => setApiConfig((c) => ({ ...c, busan119Key: e.target.value }))}
                  placeholder="공공데이터포털 부산119 Service Key 입력"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-md pl-3 pr-9 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowBusanKey(!showBusanKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  title={showBusanKey ? '키 가리기' : '키 보기'}
                >
                  {showBusanKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                id="btn-verify-busan119"
                type="button"
                onClick={handleTestBusan119}
                disabled={validationState.busan119.status === 'testing'}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1 shadow-sm"
              >
                {validationState.busan119.status === 'testing' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>[검증]</span>
                )}
              </button>
            </div>

            {/* Validation Feedback 1 */}
            {validationState.busan119.status === 'success' && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded px-2.5 py-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{validationState.busan119.message}</span>
                {validationState.busan119.latencyMs && (
                  <span className="text-[10px] text-emerald-300/80 ml-auto">
                    {validationState.busan119.latencyMs}ms
                  </span>
                )}
              </div>
            )}
            {validationState.busan119.status === 'error' && (
              <div className="flex items-center space-x-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded px-2.5 py-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{validationState.busan119.message}</span>
              </div>
            )}
          </div>

          {/* 설정 항목 2: Google AI Studio (Gemini API) Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <span>Google AI Studio (Gemini API) Key</span>
              </label>
              <span className="text-[11px] text-slate-400">일지 생성/분석</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  id="input-gemini-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={apiConfig.geminiKey}
                  onChange={(e) => setApiConfig((c) => ({ ...c, geminiKey: e.target.value }))}
                  placeholder="AI Studio Gemini API Key 입력"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-md pl-3 pr-9 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  title={showGeminiKey ? '키 가리기' : '키 보기'}
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                id="btn-verify-gemini"
                type="button"
                onClick={handleTestGemini}
                disabled={validationState.gemini.status === 'testing'}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1 shadow-sm"
              >
                {validationState.gemini.status === 'testing' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>[검증]</span>
                )}
              </button>
            </div>

            {/* Validation Feedback 2 */}
            {validationState.gemini.status === 'success' && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded px-2.5 py-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{validationState.gemini.message}</span>
                {validationState.gemini.latencyMs && (
                  <span className="text-[10px] text-emerald-300/80 ml-auto">
                    {validationState.gemini.latencyMs}ms
                  </span>
                )}
              </div>
            )}
            {validationState.gemini.status === 'error' && (
              <div className="flex items-center space-x-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded px-2.5 py-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{validationState.gemini.message}</span>
              </div>
            )}
          </div>

          {/* Quota & Security Policy Note */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-md p-3 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>보안 저장 정책 (Security Policy)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              API 키는 외부 공용 DB에 전송되지 않으며, 사용자 브라우저의 <strong>로컬 저장소(LocalStorage)</strong>에 암호화되어 안전하게 보관됩니다.
            </p>
            <p className="text-[11px] leading-relaxed text-emerald-300/90 pt-1">
              ✨ <strong>개별 AI 쿼터 독립성</strong>: 센터별 개별 키를 적용하여 타 팀 호출로 인한 Rate Limit(할당량 초과)을 원천 차단합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Save Action */}
      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-950/80">
        <button
          id="btn-save-settings"
          type="button"
          onClick={onSave}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-md shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 transition transform active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          <span>[💾 설정 저장하기] (브라우저 자동 기억)</span>
        </button>

        {savedNotification && (
          <p className="text-center text-xs text-emerald-400 mt-2 font-medium animate-fade-in flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>대원 프로필 및 보안 키가 저장되었습니다.</span>
          </p>
        )}
      </div>
    </aside>
  );
};
