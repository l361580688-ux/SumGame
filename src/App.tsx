/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Play, 
  RotateCcw, 
  Hash, 
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';
import { useGameLogic } from './useGameLogic';
import { GameMode, GameStatus } from './types';

const COLS = 6;
const ROWS = 10;

export default function App() {
  const {
    grid,
    target,
    score,
    selectedIds,
    status,
    mode,
    timeLeft,
    highScore,
    startGame,
    selectTile,
    reset
  } = useGameLogic();

  const currentSum = grid
    .filter(t => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex flex-col items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {status === GameStatus.MENU && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-6 h-6" />
                  <span className="text-xs font-mono uppercase tracking-widest opacity-50">版本 1.0.4</span>
                </div>
                <h1 className="text-6xl font-black italic tracking-tighter leading-none mb-4">
                  SUM<br />STACK
                </h1>
                <p className="text-sm opacity-70 leading-relaxed max-w-[280px]">
                  选择数字使其总和等于目标值。不要让方块堆积到顶部。
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => startGame(GameMode.CLASSIC)}
                  className="w-full group flex items-center justify-between p-4 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold uppercase text-sm">经典模式</div>
                      <div className="text-[10px] opacity-60">每次成功消除后新增一行</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => startGame(GameMode.TIME)}
                  className="w-full group flex items-center justify-between p-4 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold uppercase text-sm">计时模式</div>
                      <div className="text-[10px] opacity-60">每 10 秒强制新增一行</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-12 pt-6 border-t border-[#141414]/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 opacity-40" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">最高分</span>
                </div>
                <span className="font-mono font-bold">{highScore}</span>
              </div>
            </motion.div>
          )}

          {status === GameStatus.PLAYING && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Header Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white border-2 border-[#141414] p-3 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold opacity-40 mb-1">目标值</span>
                  <span className="text-3xl font-black italic">{target}</span>
                </div>
                <div className="bg-white border-2 border-[#141414] p-3 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold opacity-40 mb-1">当前和</span>
                  <span className={`text-3xl font-black italic transition-colors ${currentSum > target ? 'text-red-500' : currentSum === target ? 'text-green-500' : ''}`}>
                    {currentSum}
                  </span>
                  {currentSum > 0 && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-[#141414]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentSum / target) * 100, 100)}%` }}
                    />
                  )}
                </div>
                <div className="bg-white border-2 border-[#141414] p-3 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold opacity-40 mb-1">得分</span>
                  <span className="text-3xl font-black italic">{score}</span>
                </div>
              </div>

              {/* Game Grid */}
              <div 
                className="bg-white border-2 border-[#141414] p-2 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] relative aspect-[6/10] w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  gap: '4px'
                }}
              >
                {/* Danger Zone Indicator */}
                <div className="absolute top-0 left-0 right-0 h-[10%] bg-red-500/5 border-b border-red-500/20 pointer-events-none" />
                
                <AnimatePresence>
                  {grid.map((tile) => (
                    <motion.button
                      key={tile.id}
                      layoutId={tile.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        gridRow: tile.row + 1,
                        gridColumn: tile.col + 1
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => selectTile(tile.id)}
                      className={`
                        w-full h-full flex items-center justify-center text-xl font-black italic border-2 transition-all duration-100
                        ${selectedIds.includes(tile.id) 
                          ? 'bg-[#141414] text-white border-[#141414] -translate-y-1 shadow-[0px_4px_0px_0px_rgba(20,20,20,0.3)]' 
                          : 'bg-white border-[#141414]/10 hover:border-[#141414]'}
                        ${tile.row === 0 ? 'text-red-500 border-red-500/30' : ''}
                      `}
                    >
                      {tile.value}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${mode === GameMode.TIME ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                      {mode === GameMode.TIME ? `剩余时间: ${timeLeft}s` : '经典模式'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1 transition-opacity"
                >
                  <RotateCcw className="w-3 h-3" />
                  退出
                </button>
              </div>
            </motion.div>
          )}

          {status === GameStatus.GAMEOVER && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-center"
            >
              <div className="mb-6">
                <Zap className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">游戏结束</h2>
                <p className="text-sm opacity-60">方块堆积到了顶部。</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 border-2 border-[#141414]/10">
                  <div className="text-[10px] uppercase font-bold opacity-40 mb-1">最终得分</div>
                  <div className="text-3xl font-black italic">{score}</div>
                </div>
                <div className="p-4 border-2 border-[#141414]/10">
                  <div className="text-[10px] uppercase font-bold opacity-40 mb-1">最高纪录</div>
                  <div className="text-3xl font-black italic">{highScore}</div>
                </div>
              </div>

              <button
                onClick={() => startGame(mode)}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#141414] text-white font-bold uppercase text-sm hover:bg-[#2a2a2a] transition-colors mb-3"
              >
                <RotateCcw className="w-5 h-5" />
                再试一次
              </button>
              
              <button
                onClick={reset}
                className="w-full p-4 border-2 border-[#141414] font-bold uppercase text-sm hover:bg-[#f5f5f5] transition-colors"
              >
                返回主菜单
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Instructions for Desktop */}
      <div className="fixed bottom-8 right-8 hidden lg:flex flex-col items-end gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
          <Info className="w-4 h-4" />
          玩法说明
        </div>
        <p className="text-[10px] text-right max-w-[160px] leading-relaxed">
          点击数字进行求和。匹配目标值即可消除。
          经典模式下，消除后增加一行。计时模式下，行会自动增加。
        </p>
      </div>
    </div>
  );
}
