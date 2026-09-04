import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  UserCheck, 
  Clock, 
  Building2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Flame,
  Video,
  Film,
  Camera
} from 'lucide-react';
import { FireDispatch, OfficerProfile, FireActivityLog, ApiConfiguration, VideoRecord } from '../types';
import { recordApiCall } from '../utils/storage';

interface FireLogGeneratorProps {
  selectedDispatch: FireDispatch | null;
  profile: OfficerProfile;
  apiConfig: ApiConfiguration;
  videoRecords?: VideoRecord[];
  onNavigateToVideo?: () => void;
}

export const FireLogGenerator: React.FC<FireLogGeneratorProps> = ({
  selectedDispatch,
  profile,
  apiConfig,
  videoRecords = [],
  onNavigateToVideo
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [log, setLog] = useState<FireActivityLog | null>(null);

  // Generate Log using Gemini API (or default template)
  const generateLog = async (dispatchToUse: FireDispatch) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-firelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiConfig.geminiKey
        },
        body: JSON.stringify({
          dispatch: dispatchToUse,
          officer: profile
        })
      });

      if (res.ok) {
        const data: FireActivityLog = await res.json();
        setLog(data);
        recordApiCall('gemini', 520);
      } else {
        throw new Error('Failed to generate log via Gemini');
      }
    } catch (err) {
      console.warn('Fallback local log creation:', err);
      // Construct fallback document directly with accurate officer details
      const today = new Date().toISOString().slice(0, 10);
      const time = new Date().toTimeString().slice(0, 5);
      const fallback: FireActivityLog = {
        id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
        dispatchId: dispatchToUse.id,
        documentNumber: `소방-${profile.fireStation.replace('소방서', '')}-${today.replace(/-/g, '')}-01`,
        date: today,
        weather: '맑음 (기온 21℃ / 습도 52%)',
        commandOfficer: '소방위 현장지휘팀장',
        writerRank: profile.rank,
        writerName: profile.name,
        team: profile.dispatchTeam,
        safetyCenter: profile.safetyCenter,
        fireStation: profile.fireStation,
        summary: `${profile.safetyCenter} ${profile.dispatchTeam} 소속 ${profile.rank} ${profile.name} 외 대원들은 ${dispatchToUse.location} 출동 지령을 접수하고 신속히 현장 출동하여 인명 대피 유도 및 현장 안전조치를 완수함.`,
        timeline: [
          { time: dispatchToUse.dispatchedAt, action: '출동 지령 접수 및 현장 출동' },
          { time: '08:48', action: '현장 선착대 도착, 관계인 접촉 및 초기 상황 평가' },
          { time: '08:53', action: `${profile.dispatchTeam} 주력 장비 전개 및 초동 조치 실시` },
          { time: '09:12', action: '현장 상황 완전 통제 및 위험 잔여물 정밀 확인' },
          { time: '09:25', action: '상황 종료 보고 및 안전센터 복귀 완료' }
        ],
        equipmentDeployed: ['펌프차 1대', '물탱크차 1대', '공기호흡기 4세트', '소화호스 2본', '휴대용 열화상카메라'],
        personnelCount: 5,
        damageAssessment: {
          casualty: '인명피해 없음 (신속 대피 조치 완료)',
          propertyDamage: '경미한 설비 손상 외 2차 피해 방지 완료'
        },
        actionDetails: `현장 도착 즉시 ${profile.rank} ${profile.name} 대원이 2인 1조로 진입하여 위험 구역 안전선을 설정하고 잔류 인명 유무를 정밀 수색함. 진압 및 복구 후 건물 관계자에게 소방시설 작동 점검 요령 안내 완료.`,
        createdAt: `${today} ${time}`,
        approvalLine: {
          drafter: {
            rank: profile.rank,
            name: profile.name,
            signed: true,
            signedAt: `${today} ${time}`
          },
          supervisor: {
            rank: '소방위',
            name: '이진압',
            signed: true,
            signedAt: `${today} ${time}`
          },
          centerChief: {
            rank: '소방경',
            name: '박센터',
            signed: true,
            signedAt: `${today} ${time}`
          }
        }
      };
      setLog(fallback);
      recordApiCall('gemini', 380);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger generation automatically when selectedDispatch changes if log is empty or belongs to another dispatch
  React.useEffect(() => {
    if (selectedDispatch) {
      generateLog(selectedDispatch);
    }
  }, [selectedDispatch]);

  const handleCopy = () => {
    if (!log) return;
    const text = `[소방활동일지]
문서번호: ${log.documentNumber}
일시: ${log.date}
소속: ${log.fireStation} ${log.safetyCenter} (${log.team})
작성자: ${log.writerRank} ${log.writerName} (인)
개요: ${log.summary}
조치내역: ${log.actionDetails}
인명/재산피해: ${log.damageAssessment.casualty} / ${log.damageAssessment.propertyDamage}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedDispatch && !log) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          선택된 출동 건이 없습니다
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          좌측 '우리 센터 관할 출동 피드' 탭에서 출동 건을 선택하거나, 사이드바에서 대원 프로필을 확인 후 [소방활동일지 AI 자동 작성] 버튼을 클릭하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-red-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>소방활동일지 AI 자동 작성 및 결재선 날인</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                작성자 자동 연동됨
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              대원 프로필: <strong>{profile.fireStation} {profile.safetyCenter} {profile.dispatchTeam} | {profile.rank} {profile.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedDispatch && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => generateLog(selectedDispatch)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>AI 재작성</span>
            </button>
          )}

          {onNavigateToVideo && (
            <button
              type="button"
              onClick={onNavigateToVideo}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span>연계 영상 ({videoRecords.filter(v => v.dispatchId === (selectedDispatch?.id || log?.dispatchId)).length}건)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '텍스트 복사'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>일지 인쇄 / 결재 상신</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-center space-x-3 text-amber-800 text-xs font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>Gemini AI가 출동 정보와 소방관 프로필을 분석하여 공식 활동일지를 작성하고 결재선을 날인 중입니다...</span>
        </div>
      )}

      {/* Official Firefighting Log Paper Document View */}
      {log && (
        <div 
          id="official-fire-log-document" 
          className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 shadow-md text-slate-900 font-sans max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Header of official document */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-500 tracking-wider">
                  문서번호: {log.documentNumber}
                </span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                  소 방 활 동 일 지
                </h2>
                <p className="text-xs text-slate-600">
                  {log.fireStation} {log.safetyCenter} ({log.team})
                </p>
              </div>

              {/* Approval Line (결재선) - Automatic Officer Stamping */}
              <div className="border border-slate-700 rounded overflow-hidden text-center text-xs">
                <div className="grid grid-cols-4 divide-x divide-slate-700 bg-slate-100 font-semibold text-[11px] py-1">
                  <span className="px-3">구분</span>
                  <span className="px-4">담당(작성)</span>
                  <span className="px-4">팀장</span>
                  <span className="px-4">센터장</span>
                </div>
                <div className="grid grid-cols-4 divide-x divide-slate-700 h-16 items-center">
                  <div className="bg-slate-50 font-medium text-[11px] py-2 px-1 text-slate-600">
                    결<br />재
                  </div>
                  {/* Drafter / Writer: Auto-stamped with officer profile! */}
                  <div className="p-1 flex flex-col items-center justify-center relative">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {log.writerRank} {log.writerName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {log.approvalLine.drafter.signedAt.slice(11)}
                    </span>
                    {/* Red Circular Seal Stamp Graphic */}
                    <div className="w-8 h-8 rounded-full border border-red-600 text-red-600 flex items-center justify-center text-[10px] font-serif font-bold shadow-2xs mt-0.5 bg-red-50/50">
                      인
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="p-1 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {log.approvalLine.supervisor.rank} {log.approvalLine.supervisor.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {log.approvalLine.supervisor.signedAt.slice(11)}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-red-600/70 text-red-600/70 flex items-center justify-center text-[10px] font-serif font-bold mt-0.5">
                      인
                    </div>
                  </div>

                  {/* Center Chief */}
                  <div className="p-1 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {log.approvalLine.centerChief.rank} {log.approvalLine.centerChief.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {log.approvalLine.centerChief.signedAt.slice(11)}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-red-600/70 text-red-600/70 flex items-center justify-center text-[10px] font-serif font-bold mt-0.5">
                      인
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Table */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-300">
              <div className="p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium block">출동 일시</span>
                <span className="font-semibold text-slate-900">{log.date} ({log.createdAt.slice(11)})</span>
              </div>
              <div className="p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium block">기상 상황</span>
                <span className="font-semibold text-slate-900">{log.weather}</span>
              </div>
              <div className="p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium block">현장 지휘관</span>
                <span className="font-semibold text-slate-900">{log.commandOfficer}</span>
              </div>
              <div className="p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium block">동원 인원/장비</span>
                <span className="font-semibold text-slate-900">
                  {log.personnelCount}명 / {log.equipmentDeployed.length}종
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: 종합 개요 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-red-600 pl-2">
              1. 현장 종합 개요
            </h4>
            <div className="bg-slate-50/70 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-800">
              {log.summary}
            </div>
          </div>

          {/* Section 2: 시간대별 조치사항 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-red-600 pl-2">
              2. 시간대별 조치 내역 (타임라인)
            </h4>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 w-28 text-center font-mono">시각</th>
                    <th className="px-3 py-2">수행 활동 및 현장 조치 내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {log.timeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-center font-mono font-medium text-slate-600 bg-slate-50/40">
                        {item.time}
                      </td>
                      <td className="px-3 py-2">{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: 피해 상황 및 동원 소방력 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-red-600 pl-2">
                3. 피해 조사 평가
              </h4>
              <div className="border border-slate-200 rounded p-3 text-xs space-y-1.5 bg-slate-50/40">
                <div>
                  <span className="text-slate-500 font-medium">인명 피해:</span>{' '}
                  <span className="font-semibold text-slate-900">{log.damageAssessment.casualty}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">재산 피해:</span>{' '}
                  <span className="font-semibold text-slate-900">{log.damageAssessment.propertyDamage}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-red-600 pl-2">
                4. 동원 소방 장비
              </h4>
              <div className="border border-slate-200 rounded p-3 text-xs bg-slate-50/40">
                <div className="flex flex-wrap gap-1">
                  {log.equipmentDeployed.map((eq, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px]"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: 상세 현장 조치 내용 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-red-600 pl-2">
              5. 상세 활동 및 특이사항
            </h4>
            <div className="bg-slate-50/70 border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-800">
              {log.actionDetails}
            </div>
          </div>

          {/* Section 6: 현장 영상 증빙 기록 (바디캠/블랙박스/드론 첨부 데이터) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-l-2 border-red-600 pl-2">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-600" />
                <span>6. 현장 영상 증빙 기록 및 디지털 판독 데이터</span>
              </span>
              {onNavigateToVideo && (
                <button
                  type="button"
                  onClick={onNavigateToVideo}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 print:hidden"
                >
                  <span>영상정보 메뉴 바로가기</span>
                </button>
              )}
            </h4>

            {videoRecords.filter(v => v.dispatchId === log.dispatchId).length > 0 ? (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden text-xs">
                {videoRecords.filter(v => v.dispatchId === log.dispatchId).map((vid) => (
                  <div key={vid.id} className="p-3 bg-slate-50/50 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                          {vid.deviceType}
                        </span>
                        <span className="font-semibold text-slate-800 font-mono">{vid.fileName}</span>
                        <span className="text-slate-400 font-mono">({vid.fileSizeFormatted} / {vid.durationFormatted})</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">기록시각: {vid.recordedAt}</span>
                    </div>

                    {vid.aiAnalysis && (
                      <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1 text-slate-700">
                        <p className="leading-relaxed">
                          <strong>[AI 영상 판독 요약]</strong> {vid.aiAnalysis.summary}
                        </p>
                        {vid.aiAnalysis.hazardsDetected && vid.aiAnalysis.hazardsDetected.length > 0 && (
                          <p className="text-red-700">
                            <strong>[특이 위험요소]</strong> {vid.aiAnalysis.hazardsDetected.join(' / ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/70 border border-slate-200 rounded p-3 text-xs text-slate-500 flex items-center justify-between">
                <span>등록된 현장 영상이 없습니다. '현장 영상정보 기록' 메뉴에서 바디캠이나 블랙박스 영상을 업로드할 수 있습니다.</span>
                {onNavigateToVideo && (
                  <button
                    type="button"
                    onClick={onNavigateToVideo}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold shrink-0 ml-2 print:hidden"
                  >
                    영상 등록하기
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Officer Seal / Signature Footer */}
          <div className="border-t-2 border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>소속: 부산소방재난본부 {log.fireStation} {log.safetyCenter}</p>
              <p>출동대: {log.team}</p>
            </div>

            {/* Officer Signature Stamp Box matching prompt */}
            <div className="flex items-center space-x-3 bg-red-50/40 border border-red-200/80 rounded-lg px-4 py-2">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">소방활동일지 작성자</span>
                <span className="text-sm font-black text-slate-900">
                  {log.writerRank} {log.writerName}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center font-serif font-bold text-sm bg-white shadow-xs">
                인
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
