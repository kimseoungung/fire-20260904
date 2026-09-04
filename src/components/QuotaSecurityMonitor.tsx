import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Gauge, 
  Lock, 
  CheckCircle2, 
  HardDrive, 
  AlertOctagon, 
  Trash2, 
  Zap, 
  Radio, 
  RefreshCw 
} from 'lucide-react';
import { OfficerProfile, ApiConfiguration } from '../types';
import { loadQuotaStats, clearSecureStorage, maskApiKey } from '../utils/storage';

interface QuotaSecurityMonitorProps {
  profile: OfficerProfile;
  apiConfig: ApiConfiguration;
  onReset: () => void;
}

export const QuotaSecurityMonitor: React.FC<QuotaSecurityMonitorProps> = ({
  profile,
  apiConfig,
  onReset
}) => {
  const quota = loadQuotaStats();

  const handleClearAll = () => {
    if (confirm('로컬에 저장된 대원 프로필과 API 보안 키를 모두 삭제하시겠습니까?')) {
      clearSecureStorage();
      onReset();
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rate Limit Immunity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>개별 AI 쿼터 상태</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-emerald-600">독립 할당량</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            타 팀 사용량 간섭(Rate Limit)을 100% 방지하는 전용 키 분리 모드
          </p>
        </div>

        {/* Card 2: Today's API Invocations */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>금일 API 호출 누적</span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Gauge className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {quota.todayRequests} <span className="text-xs font-normal text-slate-500">회 (정상 응답)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>Gemini: {quota.geminiCallsCount}회</span>
            <span>•</span>
            <span>부산119: {quota.busan119CallsCount}회</span>
          </div>
        </div>

        {/* Card 3: Token Estimation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>AI 토큰 사용량</span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {(quota.totalTokensUsed / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">Tokens</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            {profile.safetyCenter} 관할 일지 생성에 소모된 토큰
          </p>
        </div>

        {/* Card 4: Local Storage Encryption */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>보안 저장 정책</span>
            <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-indigo-600 text-base">LocalStorage</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            외부 공용 DB 미저장 / 사용자 브라우저 암호화 저장
          </p>
        </div>
      </div>

      {/* Security Architecture Deep Dive */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            통합 보안 아키텍처 및 키 격리 검증 리포트
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-200/80">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              1. 무저장(Zero-Cloud-DB) 보안 정책 준수
            </h4>
            <p className="leading-relaxed">
              입력하신 <strong>부산 119 API Key</strong> 및 <strong>Google AI Studio Key</strong>는 서버 측 데이터베이스나 영구 클라우드 스토리지에 절대로 기록되지 않습니다.
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li>사용자 PC 브라우저의 <strong>LocalStorage</strong>에만 솔트 기반 암호화 인코딩되어 안전하게 보관됩니다.</li>
              <li>타 센터나 다른 사용자가 브라우저를 공유하지 않는 한 유출 경로가 차단됩니다.</li>
              <li>공용 PC 이용 후에는 아래 '로컬 데이터 즉시 파기' 버튼으로 안전하게 소거할 수 있습니다.</li>
            </ul>
          </div>

          <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-200/80">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              2. 센터별 개별 쿼터(Quota) 보장 메커니즘
            </h4>
            <p className="leading-relaxed">
              본부 전체가 하나의 API 키를 공유할 경우 발생하는 <strong>429 Too Many Requests (Rate Limit)</strong> 장애를 원천 차단합니다.
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li>현재 관할: <strong>{profile.fireStation} {profile.safetyCenter}</strong></li>
              <li>등록된 119 키: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">{maskApiKey(apiConfig.busan119Key) || '미등록'}</code></li>
              <li>등록된 AI 키: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">{maskApiKey(apiConfig.geminiKey) || '미등록'}</code></li>
              <li>긴급 출동 시에도 대기 시간 없이 즉시 일지 작성이 보장됩니다.</li>
            </ul>
          </div>
        </div>

        {/* Security Reset Action */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            개인정보 및 보안 키를 안전하게 보호하기 위해 공용 환경 퇴근 시 데이터 삭제를 권장합니다.
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-200 hover:border-red-200 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>로컬 저장소 보안 키 및 프로필 즉시 파기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
