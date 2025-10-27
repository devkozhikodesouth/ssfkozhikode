export const getDivisions = async (): Promise<any[]> => {
  const res = await fetch('/api/register', {
    method: 'GET',
    cache: "no-store"
  });

  const result = await res.json();
  return result.data; // because API returns { success, data }
};
getDivisions()
