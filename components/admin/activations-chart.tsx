'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { PlanUsageStats } from '@/lib/types'

interface ActivationsChartProps {
  data: PlanUsageStats[]
  isLoading?: boolean
}

export function ActivationsChart({ data, isLoading = false }: ActivationsChartProps) {
  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const formattedData = data.map(item => ({
    name: item.plan_name,
    occupancy: Math.round(item.occupancy_rate * 100) / 100
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Uso por plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0 0)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'oklch(0.90 0 0)' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'oklch(0.50 0 0)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'oklch(0.90 0 0)' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid oklch(0.90 0 0)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="occupancy" fill="oklch(0.45 0.15 250)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
