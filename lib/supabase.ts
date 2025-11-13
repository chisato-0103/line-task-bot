import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface Task {
  id?: string;
  user_id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  created_at?: string;
  done?: boolean;
}

export async function insertTask(task: Task): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: task.user_id,
          title: task.title,
          deadline: task.deadline,
          done: false,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting task:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Exception inserting task:', error);
    return null;
  }
}

export async function getTasksDueTomorrow(): Promise<Map<string, Task[]>> {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('deadline', tomorrowStr)
      .eq('done', false);

    if (error) {
      console.error('Error fetching tasks:', error);
      return new Map();
    }

    // Group tasks by user_id
    const tasksByUser = new Map<string, Task[]>();
    (data || []).forEach((task) => {
      if (!tasksByUser.has(task.user_id)) {
        tasksByUser.set(task.user_id, []);
      }
      tasksByUser.get(task.user_id)!.push(task);
    });

    return tasksByUser;
  } catch (error) {
    console.error('Exception fetching tasks:', error);
    return new Map();
  }
}

export async function getTasksDueToday(): Promise<Map<string, Task[]>> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('deadline', today)
      .eq('done', false);

    if (error) {
      console.error('Error fetching tasks:', error);
      return new Map();
    }

    // Group tasks by user_id
    const tasksByUser = new Map<string, Task[]>();
    (data || []).forEach((task) => {
      if (!tasksByUser.has(task.user_id)) {
        tasksByUser.set(task.user_id, []);
      }
      tasksByUser.get(task.user_id)!.push(task);
    });

    return tasksByUser;
  } catch (error) {
    console.error('Exception fetching tasks:', error);
    return new Map();
  }
}
