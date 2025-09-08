import { supabase } from "@/integrations/supabase/client";

export const uploadFile = async (file: File): Promise<string> => {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

export const uploadFiles = async (files: FileList): Promise<string[]> => {
  const uploadPromises = Array.from(files).map(file => uploadFile(file));
  return Promise.all(uploadPromises);
};