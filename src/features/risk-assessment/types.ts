export interface Action {
  id: string;
  title: string;
  detail: string;
  scoreReduction: number;
  owner: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface RiskEvent {
  date: string;
  supplier: string;
  desc: string;
  severity: string;
  scoreChange: string;
  status: string;
  currentScore: number;
  category: string;
  fullDetail: string;
  impact: string;
  actions: Action[];
}
