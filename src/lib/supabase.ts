import { createClient, RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Note } from "@/modules/notes/notes.entity";

export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_API_KEY
);

// リアルタイムにデータを取得するための関数
// これは、Supabaseのリアルタイム機能を使用して、特定のユーザーのノートの変更を購読するための関数です。
export const subscribe = (userId:string, callback: (payload: RealtimePostgresChangesPayload<Note>) => void) => {
    return supabase.channel("notes-changes").on<Note>("postgres_changes", 
        {
            event:"*", 
            schema:"public", 
            table:"notes", 
            filter:`user_id=eq.${userId}`}, 
            callback
        ).subscribe();
}

export const unsubscribe = (channel: RealtimeChannel) => {
    supabase.removeChannel(channel);
}
