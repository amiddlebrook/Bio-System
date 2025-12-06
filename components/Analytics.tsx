import React from 'react';
import { Card } from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const areaData = [
  { name: 'Mon', uv: 4000, pv: 2400 },
  { name: 'Tue', uv: 3000, pv: 1398 },
  { name: 'Wed', uv: 2000, pv: 9800 },
  { name: 'Thu', uv: 2780, pv: 3908 },
  { name: 'Fri', uv: 1890, pv: 4800 },
  { name: 'Sat', uv: 2390, pv: 3800 },
  { name: 'Sun', uv: 3490, pv: 4300 },
];

const barData = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 300 },
  { name: 'D', value: 200 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-8 h-[400px]">
        <Card title="Traffic Overview" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#181B21', borderColor: '#272B36', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="uv" stroke="#6366F1" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
            </ResponsiveContainer>
        </Card>
      </div>

      <div className="col-span-4 h-[400px]">
         <Card title="Distribution" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#8B5CF6'} />
                    ))}
                    </Bar>
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#181B21', borderColor: '#272B36' }} />
                </BarChart>
            </ResponsiveContainer>
         </Card>
      </div>

      <div className="col-span-12">
        <Card title="Summary Statistics">
            <div className="flex justify-around items-center">
                <div className="text-center">
                    <div className="text-3xl font-bold text-app-text">1,204</div>
                    <div className="text-xs text-app-muted uppercase mt-1">Total Hits</div>
                </div>
                <div className="w-px h-12 bg-app-border"></div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-app-primary">85%</div>
                    <div className="text-xs text-app-muted uppercase mt-1">Conversion</div>
                </div>
                <div className="w-px h-12 bg-app-border"></div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-app-secondary">2.4s</div>
                    <div className="text-xs text-app-muted uppercase mt-1">Avg Load</div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};