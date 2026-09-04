import React from 'react';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Flame, 
  FileText, 
  BarChart3, 
  Sparkles,
  Video
} from 'lucide-react';
import { OfficerProfile } from '../types';

interface HeaderProps {
  profile: OfficerProfile;
  activeTab: 'feed' | 'video' | 'firelog' | 'quota';
  setActiveTab: (tab: 'feed' | 'video' | 'firelog' | 'quota') => void;
  dispatchesCount: number;
  videoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  dispatchesCount,
  videoCount = 0
}) => {
  const currentTime = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs px-5 py-3 sticky top-0 z-10 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Identity badges based on user settings */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>부산소방재난본부</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-medium shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {profile.fireStation} <strong>{profile.safetyCenter}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-300 font-mono">{profile.dispatchTeam}</span>
          </div>

          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>작성자: <strong>{profile.rank} {profile.name}</strong></span>
            <span className="text-[10px] text-red-600 font-serif font-bold ml-0.5">[인]</span>
          </div>

          <div className="hidden lg:inline-flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>로컬 암호화 보안 적용</span>
          </div>
        </div>

        {/* Right: Real-time clock and status */}
        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1 text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>119 관제 피드 정상 수신 중 ({dispatchesCount}건)</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-slate-100">
        <button
          id="tab-feed"
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'feed'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>우리 센터 관할 출동 피드</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'feed' ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {dispatchesCount}
          </span>
        </button>

        <button
          id="tab-video"
          type="button"
          onClick={() => setActiveTab('video')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'video'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>현장 영상정보 기록</span>
          {videoCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'video' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700'
            }`}>
              {videoCount}건
            </span>
          )}
        </button>

        <button
          id="tab-firelog"
          type="button"
          onClick={() => setActiveTab('firelog')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'firelog'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>소방활동일지 AI 자동 작성 (작성자 날인)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
            Gemini
          </span>
        </button>

        <button
          id="tab-quota"
          type="button"
          onClick={() => setActiveTab('quota')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'quota'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>개별 AI 쿼터 & 보안 상태</span>
        </button>
      </div>
    </header>
  );
};
