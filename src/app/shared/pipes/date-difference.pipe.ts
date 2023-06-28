import {Pipe, PipeTransform} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "../services/local-storage.service";

@Pipe({
  name: "dateDifference",
  pure: true
})
export class DateDifference implements PipeTransform {
  constructor(
    private readonly _translate: TranslateService,
    private readonly _localStorage: LocalStorageService,
  ) {
  }

  transform(startingDate: Date, endingDate: Date): string {

    let startDate = new Date(startingDate);

    if (!endingDate) {
      endingDate = new Date();
    }
    let endDate = new Date(endingDate);

    if (startDate > endDate) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    // This is for leap year.
    const startYear = startDate.getFullYear();
    const february =
      (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0
        ? 29
        : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    const hourDiff = endDate.getHours() - startDate.getHours();
    const minuteDiff = endDate.getMinutes() - startDate.getMinutes();
    const secondDiff = endDate.getSeconds() - startDate.getSeconds();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }

    if (yearDiff > 0 || monthDiff > 0 || dayDiff > 1) {
      const options: Intl.DateTimeFormatOptions = {month: "short", day: "numeric"};
      return startDate.toLocaleString(this._localStorage.getItem("language"), options);
    } else if (dayDiff === 1) {
      return "yesterday";
    } else if (hourDiff > 0) {
      return `${hourDiff} ч ${minuteDiff} мин назад`;
    } else if (minuteDiff > 0) {
      return `${minuteDiff} мин`;
    }

    return "";

  }
}
