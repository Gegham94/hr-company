import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask'
})


export class MaskPipe implements PipeTransform {
  transform(value: string, start: number = 1, end: number = value.length - 1): string {
    const textLength = value.length;

    if (start < 0 || end > textLength) {
      return value;
    }

    // Сгенерировать звездочки для замены части текста
    const maskLength = end - start;
    const mask = '*'.repeat(maskLength);

    // Заменить часть текста звездочками
    const maskedText = value.slice(0, start) + mask + value.slice(end, textLength);

    return maskedText;
  }
}
