export const convertLocalDateTime = (date: string): string => {
  const dateList = date.split(".");
  if (dateList.length) {
    const parsedDate = new Date(
      parseInt(dateList[2], 10),
      parseInt(dateList[1], 10),
      parseInt(dateList[0], 10)
    );
    return new Date(parsedDate.getTime() - (parsedDate.getTimezoneOffset() * 60000)).toISOString();
  }
  return "";
};
