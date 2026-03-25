import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gyhmkgunkmrrbwgcoreu.supabase.co"
const supabaseKey = "sb_publishable_ruWHFGbYkdOO69Me7wQwTQ_qxBtbayh"

export const supabase = createClient(supabaseUrl, supabaseKey)