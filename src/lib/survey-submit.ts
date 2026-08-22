import { supabase } from "@/integrations/supabase/client";

export interface ResponseRow {
  response_id: string;
  survey_type: string;
  touchpoint: string;
  facility: string;
  department: string;
  question_id: string;
  question_text: string;
  response: string | null;
  rating: number | null;
  sentiment: string | null;
  comment: string | null;
}

export function newResponseId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function submitResponses(rows: ResponseRow[]): Promise<void> {
  const { error } = await supabase.from("survey_responses").insert(rows);
  if (error) throw new Error(error.message);
}
