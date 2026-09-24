export type ProtocolDomainSummary = {
  domainId: string;
  title: string;
  totalScore: number;
  maxScore: number;
  percent: number;
  itemCount: number;
};

export type ProtocolOverallSummary = {
  totalScore: number;
  maxScore: number;
  percent: number;
  domains: ProtocolDomainSummary[];
};
