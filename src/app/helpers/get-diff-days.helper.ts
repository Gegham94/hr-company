export const getDiffDays = (eDate: string, sDate?: string): number => {
  const endDate = new Date(eDate);
  const startDate = sDate ? new Date(sDate) : new Date();
  const time = endDate.getTime() - startDate.getTime();
  return Math.ceil(time / (1000 * 3600 * 24));
};
