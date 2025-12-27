import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Calendar, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isToday, isFuture, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface OutputRecord {
  completed: boolean;
  content: string;
  createdAt: string;
}

interface OutputData {
  [date: string]: OutputRecord;
}

export function HabitTracker() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [outputData, setOutputData] = useState<OutputData>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const savedData = localStorage.getItem('habitTrackerData');
    if (savedData) {
      setOutputData(JSON.parse(savedData));
    }
  }, []);

  // 選択された日付のデータを取得
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const record = outputData[dateKey];
    setInputValue(record?.content || '');
  }, [selectedDate, outputData]);

  // データをLocalStorageに保存
  const saveData = (newData: OutputData) => {
    setOutputData(newData);
    localStorage.setItem('habitTrackerData', JSON.stringify(newData));
  };

  // アウトプットを保存
  const handleSaveOutput = () => {
    if (!inputValue.trim()) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newData = {
      ...outputData,
      [dateKey]: {
        completed: true,
        content: inputValue,
        createdAt: new Date().toISOString(),
      },
    };
    saveData(newData);
  };

  // アウトプットを削除
  const handleDeleteOutput = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newData = { ...outputData };
    delete newData[dateKey];
    saveData(newData);
    setInputValue('');
  };

  // 連続記録日数を計算
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    // 今日から過去に遡って連続記録を確認
    while (true) {
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      if (outputData[dateKey]?.completed) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // 総アウトプット数を計算
  const getTotalOutputs = () => {
    return Object.keys(outputData).length;
  };

  // 今月のアウトプット数を計算
  const getMonthlyOutputs = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return Object.keys(outputData).filter(dateKey => {
      const date = parseISO(dateKey);
      return date >= monthStart && date <= monthEnd;
    }).length;
  };

  // カレンダーの日付配列を生成
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = generateCalendarDays();
  const currentStreak = calculateStreak();
  const totalOutputs = getTotalOutputs();
  const monthlyOutputs = getMonthlyOutputs();
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const hasOutputToday = outputData[selectedDateKey]?.completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            毎日アウトプット習慣トラッカー
          </h1>
          <p className="text-gray-600">
            継続は力なり。毎日のアウトプットを記録しよう！
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Flame className="w-5 h-5" />
                現在の連続記録
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{currentStreak}日</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-pink-600">
                <Calendar className="w-5 h-5" />
                今月のアウトプット
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{monthlyOutputs}回</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <TrendingUp className="w-5 h-5" />
                総アウトプット数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalOutputs}回</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* カレンダービュー */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  ←
                </Button>
                <CardTitle>
                  {format(currentMonth, 'yyyy年M月', { locale: ja })}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダーグリッド */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const hasOutput = outputData[dateKey]?.completed;
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    const isFutureDate = isFuture(day) && !isTodayDate;

                    return (
                      <button
                        key={index}
                        onClick={() => !isFutureDate && setSelectedDate(day)}
                        disabled={isFutureDate}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-sm relative
                          transition-all duration-200
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                          ${isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : ''}
                          ${isTodayDate ? 'font-bold' : ''}
                          ${isFutureDate ? 'cursor-not-allowed opacity-30' : 'hover:bg-gray-100'}
                          ${hasOutput ? 'bg-gradient-to-br from-orange-400 to-pink-400 text-white font-semibold' : 'bg-gray-50'}
                        `}
                      >
                        {format(day, 'd')}
                        {hasOutput && (
                          <CheckCircle2 className="w-3 h-3 absolute top-0.5 right-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アウトプット入力フォーム */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {format(selectedDate, 'M月d日(E)', { locale: ja })}のアウトプット
                {isToday(selectedDate) && (
                  <span className="text-sm font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    今日
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="今日学んだこと、作ったもの、気づいたことなどを書き留めましょう..."
                className="min-h-[300px] resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveOutput}
                  disabled={!inputValue.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  保存する
                </Button>
                
                {hasOutputToday && (
                  <Button
                    onClick={handleDeleteOutput}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    削除
                  </Button>
                )}
              </div>

              {hasOutputToday && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  この日のアウトプットは記録済みです
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* モチベーションメッセージ */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-lg">
                {currentStreak === 0 && '今日からアウトプットを始めましょう！'}
                {currentStreak > 0 && currentStreak < 7 && `素晴らしい！${currentStreak}日連続です。この調子で続けましょう！`}
                {currentStreak >= 7 && currentStreak < 30 && `すごい！${currentStreak}日連続達成！習慣化できています🎉`}
                {currentStreak >= 30 && `驚異の${currentStreak}日連続！あなたは本物です🔥`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
