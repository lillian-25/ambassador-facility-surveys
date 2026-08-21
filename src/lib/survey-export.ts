import * as XLSX from "xlsx";
import type { SurveyResponse } from "./mock-responses";
import {
  COLUMNS,
  cellValue,
  describeFilters,
  isFiltered,
  type ActionItem,
  type Filters,
} from "./survey-analytics";

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function download(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename, { compression: true });
}

/** Full raw export: one row per response, one column per question. */
export function exportResponses(rows: SurveyResponse[], filters: Filters) {
  const filtered = isFiltered(filters);
  const aoa: (string | number)[][] = [];

  if (filtered) {
    aoa.push([`Filters applied — ${describeFilters(filters)}  •  ${rows.length} responses`]);
    aoa.push([]);
  }

  aoa.push(COLUMNS.map((c) => c.header));
  for (const r of rows) aoa.push(COLUMNS.map((c) => cellValue(r, c.key)));

  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet["!cols"] = COLUMNS.map((c) => ({ wch: c.width }));
  const headerRow = filtered ? 2 : 0;
  sheet["!freeze"] = undefined;
  sheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRow, c: 0 },
      e: { r: headerRow + rows.length, c: COLUMNS.length - 1 },
    }),
  };
  if (filtered) sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: COLUMNS.length - 1 } }];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Survey Responses");
  download(book, `ambassador-survey-responses-${stamp()}.xlsx`);
}

/** Small export of just the Priority Action Queue table. */
export function exportActionQueue(items: ActionItem[], filters: Filters, responseCount: number) {
  const aoa: (string | number)[][] = [];
  if (isFiltered(filters)) {
    aoa.push([`Filters applied — ${describeFilters(filters)}  •  ${responseCount} responses`]);
    aoa.push([]);
  }
  aoa.push(["Issue", "Frequency", "Severity (1–5)", "Impact (% of responses)", "Score"]);
  for (const i of items) aoa.push([i.issue, i.frequency, i.severity, i.impact, i.score]);

  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet["!cols"] = [{ wch: 44 }, { wch: 12 }, { wch: 15 }, { wch: 24 }, { wch: 10 }];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Priority Actions");
  download(book, `ambassador-priority-actions-${stamp()}.xlsx`);
}
