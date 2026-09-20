import React from 'react';

const SensorCard = ({ data }) => {
  const {
    building = 1,
    floor = 1,
    smoke_value = 0,
    is_smoke_detected = false,
    date = '-',
    time = '-',
    isOnline = false
  } = data || {};

  return (
    <div className={`w-full max-w-lg p-6 md:p-8 rounded-2xl border transition-all duration-300 shadow-2xl ${
      !isOnline
        ? 'bg-slate-800/90 border-slate-700 text-slate-200'
        : is_smoke_detected
          ? 'bg-red-950/60 border-red-500 shadow-red-900/50'
          : 'bg-slate-800 border-emerald-500/50 shadow-emerald-900/20'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏢</span>
          <h3 className="text-2xl font-bold text-white tracking-wide">
            ตึก {building} <span className="text-slate-500 font-normal">|</span> ชั้น {floor}
          </h3>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
          isOnline
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            : 'bg-slate-700/80 text-slate-300 border-slate-600'
        }`}>
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
          {isOnline ? 'ออนไลน์' : 'ออฟไลน์ (ปิดเครื่อง)'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-400 mb-1">ค่าควันล่าสุด</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${
              !isOnline
                ? 'text-slate-500'
                : is_smoke_detected
                  ? 'text-red-400 animate-bounce'
                  : 'text-emerald-400'
            }`}>
              {isOnline ? smoke_value : '-'}
            </span>
            <span className="text-xs text-slate-400">PPM / Raw</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-400 mb-1">สถานะสภาวะ</span>
          <div className="mt-1">
            {is_smoke_detected && isOnline ? (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-base font-bold border border-red-500/50 w-full justify-center">
                🚨 พบควันผิดปกติ!
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-base font-semibold border border-emerald-500/30 w-full justify-center">
                ✅ สภาวะปกติ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between text-sm text-slate-300 bg-slate-900/60 px-5 py-3 rounded-xl border border-slate-800">
        <span className="text-slate-400">อัปเดตล่าสุด:</span>
        <span className="font-mono text-base text-amber-300 font-semibold">
          {date} ({time} น.)
        </span>
      </div>
    </div>
  );
};

export default SensorCard;