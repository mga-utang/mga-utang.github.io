export interface Profile {
  id: string;
  store_name: string;
  owner_name: string;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  address_or_purok: string;
  created_by_profile_id: string;
  created_at: string;
}

export interface Ledger {
  id: string;
  customer_id: string;
  store_id: string;
  current_credit: number;
  last_updated_at: string;
}

export interface LedgerWithStore extends Ledger {
  store: Profile;
}
