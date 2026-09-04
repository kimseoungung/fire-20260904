import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  MapPin, 
  Clock, 
  Flame, 
  Truck, 
  FileEdit, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ChevronRight, 
  Building, 
  Sparkles,
  Video,
  Film
} from 'lucide-react';
import { FireDispatch, OfficerProfile, VideoRecord } from '../types';

interface DispatchFeedProps {
  dispatches: FireDispatch[];
  profile: OfficerProfile;
  videoRecords?: VideoRecord[];
  onSelectForReport: (dispatch: FireDispatch) => void;
  onSelectForVideo?: (dispatch: FireDispatch) => void;
}

export const DispatchFeed: React.FC<DispatchFeedProps> = ({
  dispatches,
  profile,
  videoRecords = [],
  onSelectForReport,
  onSelectForVideo
}) => {
  const [scopeFilter, setScopeFilter] = useState<'center' | 'station' | 'all'>('center');
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');

  // Core Capability 1: 관할 맞춤형 자동 필터링
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((item) => {
      // Scope match
      if (scopeFilter === 'center') {
        if (item.center !== profile.safetyCenter) return false;
      } else if (scopeFilter === 'station') {
        if (item.station !== profile.fireStation) return false;
      }

      // Category match
      if (categoryFilter !== '전체' && item.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [dispatches, scopeFilter, categoryFilter, profile.safetyCenter, profile.fireStation]);

  const centerCount = dispatches.filter((d) => d.center === profile.safetyCenter).length;

  return (
    <div className="space-y-4">
      {/* Top Notification Banner of Auto-filtering */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-sm mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm">
                관할 맞춤형 실시간 출동 자동 필터링 적용 중
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                1초 내 로딩 완료
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              대원 설정에 따라 <strong>[{profile.fireStation} {profile.safetyCenter}]</strong> 관할 출동 목록({centerCount}건)을 최우선으로 선별하여 표출합니다.
            </p>
          </div>
        </div>

        {/* Quick Scope Switcher */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setScopeFilter('center')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              scopeFilter === 'center'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            우리 센터만 ({centerCount}건)
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('station')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              scopeFilter === 'station'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {profile.fireStation} 전체
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              scopeFilter === 'all'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            부산 전역
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 구분:
          </span>
          {['전체', '화재', '구조', '구급', '생활안전'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          조회 결과 <strong className="text-slate-900">{filteredDispatches.length}</strong>건
        </div>
      </div>

      {/* Dispatch Cards List */}
      <div className="space-y-3">
        {filteredDispatches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
            <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">해당 조건의 출동 내역이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">
              상단 범위 필터를 '부산 전역'으로 변경하거나 사이드바에서 소속 안전센터 설정을 확인하세요.
            </p>
          </div>
        ) : (
          filteredDispatches.map((dispatch) => {
            const isMyCenter = dispatch.center === profile.safetyCenter;
            const hasMyTeam = dispatch.assignedTeams.some((t) => t.includes(profile.dispatchTeam) || t.includes(profile.safetyCenter));

            return (
              <div
                key={dispatch.id}
                className={`bg-white rounded-xl border p-4.5 transition-all shadow-2xs hover:shadow-md ${
                  isMyCenter
                    ? 'border-red-300 ring-1 ring-red-100/70 bg-gradient-to-r from-red-50/20 to-white'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Top tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {dispatch.id}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          dispatch.category === '화재'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : dispatch.category === '구조'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : dispatch.category === '구급'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {dispatch.category} ({dispatch.urgency})
                      </span>

                      {/* Station & Center Badge */}
                      <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {dispatch.station} <strong>{dispatch.center}</strong>
                      </span>

                      {/* Jurisdiction Match Badge */}
                      {isMyCenter && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-600 text-white shadow-2xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 우리 센터 관할
                        </span>
                      )}

                      {/* Status */}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ml-auto ${
                          dispatch.status === '현장활동'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dispatch.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {dispatch.title}
                    </h4>

                    {/* Location & Time */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center space-x-1 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{dispatch.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 font-mono text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>지령시각: {dispatch.dispatchedAt}</span>
                      </div>
                    </div>

                    {/* Assigned Teams */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-1 text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" /> 동원대:
                      </span>
                      {dispatch.assignedTeams.map((team, idx) => {
                        const isUserTeam = team.includes(profile.dispatchTeam);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              isUserTeam
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {team} {isUserTeam && '(본인 출동대)'}
                          </span>
                        );
                      })}
                    </div>

                    {/* Details snippet */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                      {dispatch.details}
                    </p>
                  </div>

                  {/* Action Right */}
                  <div className="md:self-center shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 w-full md:w-auto">
                    {onSelectForVideo && (
                      <button
                        type="button"
                        onClick={() => onSelectForVideo(dispatch)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition border ${
                          videoRecords.filter(v => v.dispatchId === dispatch.id).length > 0
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5 text-red-600" />
                        <span>
                          영상정보 {videoRecords.filter(v => v.dispatchId === dispatch.id).length > 0 
                            ? `(${videoRecords.filter(v => v.dispatchId === dispatch.id).length}건 기록)` 
                            : '업로드 및 기록'}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectForReport(dispatch)}
                      className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:text-white" />
                      <span>소방활동일지 AI 작성</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    </button>
                    <span className="text-[10px] text-slate-400 text-center md:text-right hidden sm:block">
                      작성자: {profile.rank} {profile.name} [인] 날인
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
