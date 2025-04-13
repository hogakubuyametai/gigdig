'use stirct';

console.clear();

{
  const year = 2025;
  const month = 3;

  function getCallenderHead() {
    const dates = [];
    const d = new Date(year, month, 0).getDate();
    const n = new Date(year, month, 1).getDay();
    
    for (let i = 0; i < n; i++) {
      dates.unshift({
        date: d - i,
        isToday: false,
        isDisabled: true,
      })
    }
    return dates;
  }

  function getCallenderBody() {
    const dates = [];
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= lastDate; i++) {
      dates.push({
        date: i,
        isToday: false,
        isDisabled: false, 
      });
    }
    return dates;
  }

  function getCallenderTail() {
    const dates = [];
    const lastDay = new Date(year, month + 1, 0).getDay();


    for (let i = 1; i < 7 - lastDay; i++) {
      dates.push({
        date: i,
        isToday: false,
        isDisabled: true,
      })
    }
    return dates;
  }

  function createCalender() {
    const dates = [
      ...getCallenderHead(),
      ...getCallenderBody(),
      ...getCallenderTail(),
    ];
    console.log(dates);
  }

  createCalender();
  // getCallenderBody();
  // getCallenderHead();
  getCallenderTail();
}