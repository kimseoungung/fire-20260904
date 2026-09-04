/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SidebarSettings } from './components/SidebarSettings';
import { Header } from './components/Header';
import { DispatchFeed } from './components/DispatchFeed';
import { VideoManager } from './components/VideoManager';
import { FireLogGenerator } from './components/FireLogGenerator';
import { QuotaSecurityMonitor } from './components/QuotaSecurityMonitor';
import { OfficerProfile, ApiConfiguration, FireDispatch, VideoRecord } from './types';
import { SAMPLE_DISPATCHES } from './data/busanFireData';
import { 
  loadOfficerProfile, 
  saveOfficerProfile, 
  loadApiConfiguration, 
  saveApiConfiguration,
  loadVideoRecords,
  saveVideoRecord,
  deleteVideoRecord
} from './utils/storage';

export default function App() {
  // 1. Role & Identity: 대원 프로필
  const [profile, setProfile] = useState<OfficerProfile>(() => loadOfficerProfile());

  // 2. Configuration: API 키 설정
  const [apiConfig, setApiConfig] = useState<ApiConfiguration>(() => loadApiConfiguration());

  // 3. Navigation & State
  const [activeTab, setActiveTab] = useState<'feed' | 'video' | 'firelog' | 'quota'>('feed');
  const [dispatches, setDispatches] = useState<FireDispatch[]>(SAMPLE_DISPATCHES);
  const [selectedDispatch, setSelectedDispatch] = useState<FireDispatch | null>(SAMPLE_DISPATCHES[0]);
  const [videoRecords, setVideoRecords] = useState<VideoRecord[]>(() => loadVideoRecords());
  const [savedNotification, setSavedNotification] = useState(false);

  // Save to LocalStorage
  const handleSave = () => {
    saveOfficerProfile(profile);
    saveApiConfiguration(apiConfig);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 2800);
  };

  // Route to report tab with selected dispatch
  const handleSelectForReport = (dispatch: FireDispatch) => {
    setSelectedDispatch(dispatch);
    setActiveTab('firelog');
  };

  // Route to video tab with selected dispatch
  const handleSelectForVideo = (dispatch: FireDispatch) => {
    setSelectedDispatch(dispatch);
    setActiveTab('video');
  };

  // Add video record
  const handleAddVideo = (record: VideoRecord) => {
    const updated = saveVideoRecord(record);
    setVideoRecords(updated);
  };

  // Delete video record
  const handleDeleteVideo = (recordId: string) => {
    const updated = deleteVideoRecord(recordId);
    setVideoRecords(updated);
  };

  // Update video record (e.g. after AI analysis)
  const handleUpdateVideo = (record: VideoRecord) => {
    const updated = saveVideoRecord(record);
    setVideoRecords(updated);
  };

  // Apply video findings into Firefighting Log
  const handleApplyToFireLog = (record: VideoRecord, dispatch: FireDispatch) => {
    setSelectedDispatch(dispatch);
    setActiveTab('firelog');
  };

  const handleResetData = () => {
    setProfile(loadOfficerProfile());
    setApiConfig(loadApiConfiguration());
    setSelectedDispatch(SAMPLE_DISPATCHES[0]);
    setVideoRecords(loadVideoRecords());
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* 1. Left Sidebar: 환경설정 / 대원정보 상시 배치 (Wireframe 구조 완벽 준수) */}
      <SidebarSettings
        profile={profile}
        setProfile={setProfile}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
        onSave={handleSave}
        savedNotification={savedNotification}
      />

      {/* 2. Right Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Jurisdiction, Writer Identity, and Real-time Status */}
        <Header
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dispatchesCount={dispatches.length}
          videoCount={videoRecords.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'feed' && (
            <DispatchFeed
              dispatches={dispatches}
              profile={profile}
              videoRecords={videoRecords}
              onSelectForReport={handleSelectForReport}
              onSelectForVideo={handleSelectForVideo}
              onUpdateDispatches={setDispatches}
            />
          )}

          {activeTab === 'video' && (
            <VideoManager
              dispatches={dispatches}
              selectedDispatch={selectedDispatch}
              onSelectDispatch={(d) => setSelectedDispatch(d)}
              profile={profile}
              apiConfig={apiConfig}
              videoRecords={videoRecords}
              onAddVideo={handleAddVideo}
              onDeleteVideo={handleDeleteVideo}
              onUpdateVideo={handleUpdateVideo}
              onApplyToFireLog={handleApplyToFireLog}
            />
          )}

          {activeTab === 'firelog' && (
            <FireLogGenerator
              selectedDispatch={selectedDispatch}
              profile={profile}
              apiConfig={apiConfig}
              videoRecords={videoRecords}
              onNavigateToVideo={() => setActiveTab('video')}
            />
          )}

          {activeTab === 'quota' && (
            <QuotaSecurityMonitor
              profile={profile}
              apiConfig={apiConfig}
              onReset={handleResetData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
