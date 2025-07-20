import React, { useState } from 'react';

interface HolidayCalendarProps {
  selectedDates: string[];
  onDateChange: (dates: string[]) => void;
}

export const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ selectedDates, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 現在の月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // 月の最初の日の曜日（0=日曜日）
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // 月の日数を取得
  const daysInMonth = lastDayOfMonth.getDate();

  // カレンダーの日付配列を生成
  const calendarDays = [];
  
  // 前月の日付を追加（空セル用）
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // 今月の日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    calendarDays.push(date);
  }

  // 日付の選択/解除
  const toggleDate = (date: Date) => {
    // ローカルタイムゾーンで日付文字列を生成
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const newSelectedDates = selectedDates.includes(dateString)
      ? selectedDates.filter(d => d !== dateString)
      : [...selectedDates, dateString];
    onDateChange(newSelectedDates);
  };

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // 今日の日付を取得
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth('prev')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h3>
        <button
          onClick={() => changeMonth('next')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          const isSelected = selectedDates.includes(dateString);
          const isToday = dateString === todayString;
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          return (
            <button
              key={dateString}
              onClick={() => toggleDate(date)}
              className={`
                p-2 text-sm rounded transition-colors
                ${isSelected 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'hover:bg-gray-100'
                }
                ${isToday ? 'ring-2 ring-blue-400' : ''}
                ${!isCurrentMonth ? 'text-gray-400' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* 選択された日付の表示 */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-semibold mb-2">選択された休日:</div>
          <div className="flex flex-wrap gap-2">
            {selectedDates.sort().map(date => (
              <span
                key={date}
                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
              >
                {new Date(date).toLocaleDateString('ja-JP')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 