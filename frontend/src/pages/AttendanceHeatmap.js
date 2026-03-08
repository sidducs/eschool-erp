import React from 'react';

const AttendanceHeatmap = ({ attendanceData }) => {
  // attendanceData expected: array of { date: 'YYYY-MM-DD', status: 'Present' | 'Absent' }
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create a map for quick lookup
  const attendanceMap = {};
  attendanceData?.forEach(item => {
    const formattedDate = new Date(item.date).toISOString().split('T')[0];
    attendanceMap[formattedDate] = item.status;
  });

  // Get last 6 months of dates
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 5);
  startDate.setDate(1);

  const dates = [];
  let curr = new Date(startDate);
  while (curr <= today) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // Group by week
  const weeks = [];
  let currentWeek = [];
  
  // Pad the first week
  const firstDay = dates[0].getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  dates.forEach(date => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Heatmap</h3>
          <p className="text-xs text-slate-500">Your presence over the last 6 months</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-400"></div>
            <span className="text-slate-600 dark:text-slate-400">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
            <span className="text-slate-600 dark:text-slate-400">No Record</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mt-6 pr-2">
          {days.map((day, i) => (
            <span key={day} className={`text-[9px] font-bold text-slate-400 h-3 flex items-center ${i % 2 === 0 ? 'invisible' : ''}`}>{day}</span>
          ))}
        </div>

        {/* The Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((date, dayIdx) => {
                if (!date) return <div key={dayIdx} className="w-3 h-3"></div>;
                
                const dateStr = date.toISOString().split('T')[0];
                const status = attendanceMap[dateStr];
                
                let colorClass = "bg-slate-100 dark:bg-slate-800";
                if (status === 'Present') colorClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                if (status === 'Absent') colorClass = "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]";

                return (
                  <div 
                    key={dayIdx} 
                    className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
                    title={`${date.toLocaleDateString()}: ${status || 'No data'}`}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default AttendanceHeatmap;
