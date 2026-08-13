'use client'

import { useState } from 'react'
import { Brain, Mic2, Volume2, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const providerData = {
  llm: [
    { name: 'OpenAI', orgs: 5, reqs: 1250000, cost: 45000, latency: 850, error: 0.1, status: 'active' },
    { name: 'Anthropic', orgs: 3, reqs: 420000, cost: 18500, latency: 920, error: 0.05, status: 'active' },
    { name: 'Google Vertex', orgs: 2, reqs: 180000, cost: 8200, latency: 780, error: 0.2, status: 'active' },
  ],
  stt: [
    { name: 'Deepgram', orgs: 5, reqs: 391600, cost: 28000, latency: 320, error: 0.8, status: 'active' },
    { name: 'Sarvam AI', orgs: 2, reqs: 125000, cost: 8500, latency: 450, error: 1.2, status: 'warning' },
    { name: 'AssemblyAI', orgs: 1, reqs: 45000, cost: 3200, latency: 380, error: 0.4, status: 'active' },
  ],
  tts: [
    { name: 'ElevenLabs', orgs: 4, reqs: 285000, cost: 32000, latency: 650, error: 0.2, status: 'active' },
    { name: 'Cartesia', orgs: 2, reqs: 142000, cost: 12500, latency: 210, error: 0.1, status: 'active' },
    { name: 'Azure Speech', orgs: 3, reqs: 198000, cost: 14200, latency: 420, error: 0.3, status: 'active' },
  ]
}

export default function ProviderUsagePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Provider Usage</h1>
        <p className="text-sm text-muted-foreground">Monitor how AI providers are being consumed across the entire platform.</p>
      </div>

      <Tabs defaultValue="llm" className="space-y-4">
        <TabsList>
          <TabsTrigger value="llm" className="gap-2"><Brain className="h-4 w-4" /> LLM Providers</TabsTrigger>
          <TabsTrigger value="stt" className="gap-2"><Mic2 className="h-4 w-4" /> STT Providers</TabsTrigger>
          <TabsTrigger value="tts" className="gap-2"><Volume2 className="h-4 w-4" /> TTS Providers</TabsTrigger>
        </TabsList>

        {Object.entries(providerData).map(([type, providers]) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{type} Provider Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Organizations</TableHead>
                      <TableHead className="text-right">Requests / Usage</TableHead>
                      <TableHead className="text-right">Est. Cost (INR)</TableHead>
                      <TableHead className="text-right">Avg Latency (ms)</TableHead>
                      <TableHead className="text-right">Error Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={p.status === 'active' ? 'border-[var(--status-active)]/30 text-[var(--status-active)]' : 'border-[var(--status-warning)]/30 text-[var(--status-warning)]'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{p.orgs}</TableCell>
                        <TableCell className="text-right tabular-nums">{p.reqs.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">₹{p.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{p.latency}ms</TableCell>
                        <TableCell className="text-right tabular-nums">{p.error}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}