
import { supabase } from "@/integrations/supabase/client";

export interface OnlineUsersConfig {
  min_count: number;
  max_count: number;
  update_interval: number;
}

export class OnlineUsersService {
  /**
   * Get the current online users count
   */
  static async getCurrentCount(): Promise<number> {
    try {
      console.log("OnlineUsersService: Fetching current online users count");
      
      const { data, error } = await supabase
        .from("online_users")
        .select("current_count")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching online users count:", error);
        throw error;
      }

      console.log("OnlineUsersService: Current count received:", data.current_count);
      return data.current_count;
    } catch (error) {
      console.error("Error in getCurrentCount:", error);
      return 0; // Return 0 as fallback
    }
  }

  /**
   * Get the online users configuration
   */
  static async getConfig(): Promise<OnlineUsersConfig | null> {
    try {
      console.log("OnlineUsersService: Fetching online users configuration");
      
      const { data, error } = await supabase
        .from("online_users")
        .select("min_count, max_count, update_interval")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching online users configuration:", error);
        throw error;
      }

      console.log("OnlineUsersService: Configuration received:", data);
      return data as OnlineUsersConfig;
    } catch (error) {
      console.error("Error in getConfig:", error);
      return null;
    }
  }

  /**
   * Update the online users configuration
   */
  static async updateConfig(config: OnlineUsersConfig): Promise<boolean> {
    try {
      console.log("OnlineUsersService: Updating configuration:", config);
      
      // Get the ID of the configuration row
      const { data: idData, error: idError } = await supabase
        .from("online_users")
        .select("id")
        .limit(1)
        .single();
        
      if (idError) {
        console.error("Error fetching configuration ID:", idError);
        throw idError;
      }
      
      // Update the configuration
      const { error } = await supabase
        .from("online_users")
        .update(config)
        .eq("id", idData.id);

      if (error) {
        console.error("Error updating online users configuration:", error);
        throw error;
      }

      console.log("OnlineUsersService: Configuration updated successfully");
      return true;
    } catch (error) {
      console.error("Error in updateConfig:", error);
      throw error;
    }
  }
}
