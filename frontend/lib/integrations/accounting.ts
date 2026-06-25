/**
 * Accounting export adapters — CSV today; Xero/QuickBooks when needed.
 */

export type AccountingLine = {
  date: string
  type: "invoice" | "payment"
  reference: string
  member: string
  amount: number
  currency: string
  status: string
}

export interface AccountingExporter {
  readonly name: string
  export(lines: AccountingLine[]): Promise<string | Blob>
}

export class CsvAccountingExporter implements AccountingExporter {
  readonly name = "csv"

  async export(lines: AccountingLine[]): Promise<string> {
    const header = "date,type,reference,member,amount,currency,status"
    const rows = lines.map((line) =>
      [
        line.date,
        line.type,
        line.reference,
        `"${line.member.replace(/"/g, '""')}"`,
        line.amount.toFixed(2),
        line.currency,
        line.status,
      ].join(",")
    )
    return [header, ...rows].join("\n")
  }
}

/** Placeholder — wire Xero OAuth + invoice sync when finance team approves. */
export class XeroExporter implements AccountingExporter {
  readonly name = "xero"

  async export(_lines: AccountingLine[]): Promise<string> {
    throw new Error("Xero export is not configured. Use CSV export or contact finance ops.")
  }
}

export function getAccountingExporter(format: "csv" | "xero"): AccountingExporter {
  if (format === "xero") return new XeroExporter()
  return new CsvAccountingExporter()
}
