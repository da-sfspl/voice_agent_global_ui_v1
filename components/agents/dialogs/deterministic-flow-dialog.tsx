import { ArrowRight, MessageSquare, Shield, ShieldAlert, Zap } from 'lucide-react'


// ─── Flow Visualization Component ───────────────────────────────────────────
export function DeterministicFlowStrip() {
  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">PRE-CALL</p>
            <p className="text-[10px] text-muted-foreground">Retrieve context</p>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">RULES</p>
            <p className="text-[10px] text-muted-foreground">Deterministic decisions</p>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">AGENT RESPONSE</p>
            <p className="text-[10px] text-muted-foreground">Generate reply</p>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold">GUARDRAILS</p>
            <p className="text-[10px] text-muted-foreground">Enforce policies</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        This deterministic layer works alongside your conversation flow to provide structured control
      </p>
    </div>
  )
}