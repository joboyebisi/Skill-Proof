import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RadarData } from '../types';

interface Props {
  data: RadarData[];
  color?: string;
}

export const SkillRadar: React.FC<Props> = ({ data, color = "#00f0ff" }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Candidate"
          dataKey="A"
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
