'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IndianRupee, Brain, Mic2, Volume2, Phone } from 'lucide-react'

const costData = [
  { org: 'Acme Corporation', llm: 185000, stt: 85000, tts: 92000, tel: 88000, total: 450000 },
  { org: 'Zenith Finance', llm: 142000, stt: 65000, tts: 71000, tel: 62000, total: 340000 },
  { org: 'Nova Healthcare', llm: 112000, stt: 58000, tts: 61000, tel: 54000, total: 285000 },
  { org: 'Bright Retail', llm: 52000, stt: 24000, tts: 26000, tel: 23000, total: 125000 },
]

const totals = costData.reduce((acc, c) => ({
  llm: acc.llm + c.llm, stt: acc.stt + c.stt, tts: acc.tts + c.tts, tel: acc.tel + c.tel, total: acc.total + c.total
}), { llm: 0, stt: 0, tts: 0, tel: 0, total: 0 })

export default function CostOverviewPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cost Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide AI and telephony cost analysis across all organizations.</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Cost</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.total).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current billing cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LLM Costs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.llm).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{Math.round((totals.llm/totals.total)*100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">STT Costs</CardTitle>
            <Mic2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.stt).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{Math.round((totals.stt/totals.total)*100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TTS Costs</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.tts).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{Math.round((totals.tts/totals.total)*100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telephony Costs</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totals.tel).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{Math.round((totals.tel/totals.total)*100)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Cost Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead className="text-right">LLM Cost</TableHead>
                <TableHead className="text-right">STT Cost</TableHead>
                <TableHead className="text-right">TTS Cost</TableHead>
                <TableHead className="text-right">Telephony Cost</TableHead>
                <TableHead className="text-right font-bold">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costData.map((row) => (
                <TableRow key={row.org}>
                  <TableCell className="font-medium">{row.org}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{row.llm.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{row.stt.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{row.tts.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{row.tel.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">₹{row.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}