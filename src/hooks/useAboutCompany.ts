import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutCompanyService } from '../services/aboutCompanyService';
import { AboutCompany, InsertAboutCompany } from '../types';
import { useNotifications } from './useNotification';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAboutCompany = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [userProfile, setUserProfile] = useState<{role: string, company_id: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, company_id')
          .eq('id', user.id)
          .single();
        if (profile) setUserProfile(profile);
      }
    };
    fetchProfile();
  }, []);

  const { data: aboutCompany, isLoading } = useQuery<AboutCompany | null>({
    queryKey: ['about_company', userProfile?.company_id],
    queryFn: () => aboutCompanyService.getAboutCompany(userProfile!.company_id),
    enabled: !!userProfile?.company_id 
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<InsertAboutCompany>) => {
      // 1. Sigurohemi që useri ka një ID kompanie para se të bëjmë save
      if (!userProfile?.company_id) {
        throw new Error("Llogaria juaj nuk është e lidhur me asnjë kompani (Mungon company_id)!");
      }
      return aboutCompanyService.updateAboutCompany(userProfile.company_id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about_company'] });
      addNotification('Të dhënat u ruajtën me sukses');
    },
    onError: (error: any) => {
      // 2. Tani nëse ka gabim, do të shfaqet në ekran (ose në notification)
      addNotification(`Gabim: ${error.message}`);
      console.error("Gabim gjatë ruajtjes:", error);
    }
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => aboutCompanyService.uploadLogo(file),
    onSuccess: (logoUrl) => {
      if (logoUrl) {
        updateMutation.mutate({ logo_url: logoUrl });
      }
    },
    onError: (error: any) => {
       addNotification(`Gabim në ngarkimin e logos: ${error.message}`);
    }
  });

  return {
    aboutCompany,
    isLoading: isLoading || !userProfile,
    userRole: userProfile?.role,
    updateAboutCompany: updateMutation.mutate,
    uploadLogo: uploadLogoMutation.mutate,
    isUpdating: updateMutation.isPending,
    isUploading: uploadLogoMutation.isPending
  };
};