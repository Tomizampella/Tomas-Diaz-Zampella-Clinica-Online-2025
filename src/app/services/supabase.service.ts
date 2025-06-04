import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabase: SupabaseClient<any, "public", any>;
  
  constructor() {
    this.supabase = createClient("https://lujqkgbazaaevvcqqlbl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1anFrZ2JhemFhZXZ2Y3FxbGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDQwMjcsImV4cCI6MjA2MDM4MDAyN30.WbpUdjTiRQMU0jOl-GJ4V9f6ApvTsgureAE-jU1OpDk")
   }
}
