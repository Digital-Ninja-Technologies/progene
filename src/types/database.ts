// Extended types for new database tables
import { ProjectConfig } from './project';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  project_config: ProjectConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingSettings {
  id: string;
  user_id: string;
  logo_url: string | null;
  company_name: string | null;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalView {
  id: string;
  proposal_id: string;
  viewer_ip: string | null;
  viewer_user_agent: string | null;
  viewed_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  proposal_id: string | null;
  client_id: string | null;
  description: string;
  hours: number;
  date: string;
  billable: boolean;
  created_at: string;
}

export interface ExtendedProposal {
  id: string;
  user_id: string;
  project_type: string;
  project_config: ProjectConfig;
  pricing_result: any;
  proposal_data: any;
  created_at: string;
  client_id: string | null;
  share_token: string | null;
  is_public: boolean;
  client_signed_at: string | null;
  client_signature: string | null;
  document_details: any | null;
}
