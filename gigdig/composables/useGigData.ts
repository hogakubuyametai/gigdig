type  GigData = {
  userId: string;
  date: string;
  artistId: string;
  artistName: string;
}

// エラー種別の定数定義を追加
const DB_ERRORS: { [key: string]: string } = {
  '42501': 'アクセス権限がありません。再度ログインしてください。',
  '23505': '同じ日付のGigが既に登録されています。',
  '23503': 'ユーザー情報が見つかりません。',
  default: 'データの保存に失敗しました。時間をおいて再度お試しください。',
};

export const useGigData = () => {
  const saveGigData = async (gigData: GigData, client: any) => {
    console.log('saveGigData called with:', gigData); // 追加
    
    const { data, error } = await client
      .from('gigs')
      .insert({
        user_id: gigData.userId,
        gig_date: gigData.date,
        artist_id: gigData.artistId,
        artist_name: gigData.artistName,
      })
      .single();

    console.log('Insert result:', { data, error }); // 追加

    if (error) {
      console.log('Error occurred:', error); // 追加
      const errorMessage = DB_ERRORS[error.code] || DB_ERRORS.default;
      return {
        success: false,
        message: errorMessage,
      }
    }
    
    return {
      success: true,
      data: data,
    };
  }
  
  const getGigList = async (userId: string, client: any) => {
    try{
      const { data, error } = await client
        .from('gigs')
        .select('id,gig_date, artist_id, artist_name')
        .eq('user_id', userId)

      if (error) throw error;

      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching gig list:', error);
      return { success: false, error, data: []};
    }
  };

  const deleteGigData = async (gigId: string, client: any) => {
    try {
      const { data, error } = await client
        .from('gigs')
        .delete()
        .eq('id', gigId)

      if (error) throw error;
      return { success: true, data: data };
    } catch (error) {
      console.error('Error deleting gig:', error);
      return { success: false, error, data: [] };
    }
  };

  const updateGigData = async (gigId: string, gigData: GigData, client: any) => {
    try {
      console.log('updateGigData called with:', gigId, gigData); // 追加
      const { data, error } = await client
        .from('gigs')
        .update({
          gig_date: gigData.date,
          artist_id: gigData.artistId,
          artist_name: gigData.artistName,
        })
        .eq('id', gigId)
        .single();

      if (error) throw error;
      return { success: true, data: data };
    } catch (error) {
      console.error('Error updating gig:', error);
      return { success: false, error, data: [] };
    }
  };

  return {
    saveGigData,
    getGigList,
    deleteGigData,
    updateGigData,
  };
};