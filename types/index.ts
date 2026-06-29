export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  color: string;
  color_light: string;
  address: string | null;
  created_at: string;
}

export interface BoilerBrand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BoilerModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string;
  price_base: number;
  price_final: number;
  price_rounded: number;
  notes: string | null;
  brand?: BoilerBrand;
  includes?: ModelInclude[];
  excludes?: ModelExclude[];
  optionals?: ModelOptional[];
}

export interface ModelInclude {
  id: string;
  model_id: string;
  description: string;
  sort_order: number;
}

export interface ModelExclude {
  id: string;
  model_id: string;
  description: string;
  sort_order: number;
}

export interface ModelOptional {
  id: string;
  model_id: string;
  name: string;
  price: number;
  sort_order: number;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type CommercialStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "pending" | "partial" | "paid";

export interface Budget {
  id: string;
  budget_number: string;
  company_id: string;
  customer_id: string;
  brand_id: string;
  model_id: string;
  user_id: string;
  issue_date: string;
  valid_until: string;
  commercial_status: CommercialStatus;
  accepted_at: string | null;
  rejected_at: string | null;
  payment_status: PaymentStatus;
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  total: number;
  custom_price: number | null;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  company?: Company;
  customer?: Customer;
  brand?: BoilerBrand;
  model?: BoilerModel;
  selected_optionals?: ModelOptional[];
}

export interface Payment {
  id: string;
  budget_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface BudgetStatusHistory {
  id: string;
  budget_id: string;
  user_id: string;
  previous_status: CommercialStatus | null;
  new_status: CommercialStatus;
  created_at: string;
}

export interface EmailReminderSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  frequency_days: number;
  created_at: string;
  updated_at: string;
}

export interface EmailReminderLog {
  id: string;
  user_id: string;
  sent_at: string;
  budget_ids: string[];
  status: string;
  error_message: string | null;
}

export interface DashboardMetrics {
  total_budgets: number;
  pending_budgets: number;
  accepted_budgets: number;
  rejected_budgets: number;
  acceptance_rate: number;
  total_accepted_amount: number;
  total_collected_amount: number;
  total_pending_amount: number;
  partial_collected_count: number;
  no_payment_count: number;
}
