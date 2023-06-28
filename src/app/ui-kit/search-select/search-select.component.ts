import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { SelectAllData } from "../../modules/app/constants";
import { BehaviorSubject } from "rxjs";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {ScreenSizeType} from "../../shared/interfaces/screen-size.type";
import {ScreenSizeService} from "../../shared/services/screen-size.service";
import {ScreenSizeEnum} from "../../shared/enum/screen-size.enum";

@Component({
  selector: "hr-search-select",
  templateUrl: "./search-select.component.html",
  styleUrls: ["./search-select.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchSelectComponent,
    },
  ],
})
export class SearchSelectComponent implements ControlValueAccessor {
  public isDropdownOpen: boolean = false;
  public filterQuery: string = "";
  public selectedOptionsForDisplay: string = "";
  public dropdownOptions: ISearchableSelectData[] | null = [];
  public selectedOptions: ISearchableSelectData[] = [];
  private isTouched: boolean = false;
  private optionsBackup!: ISearchableSelectData[] | null;
  private placeholderCopy: string = "";
  private _defaultValue: string = "";
  private _placeholder = "";
  public isSelectOptionsVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  @ViewChild("dropdownList") dropdownList!: ElementRef<HTMLDivElement>;
  @ViewChild("select") select!: ElementRef<HTMLDivElement>;
  @ViewChild(CdkVirtualScrollViewport) virtualScrollViewport!: CdkVirtualScrollViewport;

  @Input("valid") valid?: boolean = undefined;
  @Input("isSearch") isSearch: boolean = true;

  /**Название селекта */
  @Input() label!: string;

  @Input() isBorderGreen: boolean = true;

  @Input() hasDefaultValue: boolean = false;

  @Input() set defaultValue(value: string) {
    this._defaultValue = value;
    this.setDefaultValue();
  }

  get defaultValue(): string {
    return this._defaultValue;
  }

  /**Текст placeholder-a в input-е */
  @Input() set placeholder(value: string) {
    this.placeholderCopy = value;
    this._placeholder = value;
  }

  get placeholder(): string {
    return this._placeholder;
  }

  /**Если isInputReadOnly = true, то поиск отключен и в строку input-а нельзя написать*/
  @Input() isInputReadOnly: boolean = false;

  /**Если isMultiSelect = true, вместо обычного дропдаун-селекта, будет возможность мулти-селекта чекбоксами*/
  @Input() isMultiSelect: boolean = false;

  /**Boolean-ом передать признак о загрузке */
  @Input() isLoading: boolean = false;

  /**Boolean-ом передать признак об активности режима редактирования */
  @Input() isEditModeActive: boolean = false;

  /**Boolean-ом передать признак disabled */
  @Input() isInputDisabled: boolean = false;

  /**Boolean-ом селект является обязательным для заполнения  */
  @Input() isRequared: boolean = true;

  /**Boolean-ом передать признак Inn */
  @Input() isInn: boolean = false;

  /**Если в writeValue передаем данные с формы в типе string, нужно передать true для корректной работы компонента */
  @Input() dataInputAsString: boolean = false;

  @Input() isCross: boolean = true;

  @Input() inputTypeNumber: boolean = false;

  /**Опции дропдаун меню*/
  @Input() set options(value: ISearchableSelectData[] | null) {
    this.dropdownOptions = value;
    this.optionsBackup = value;
    this.isSelectOptionsVisible.next(true);
    if (value && value.length === 1 && value[0].displayName === SelectAllData) {
      this.isSelectOptionsVisible.next(false);
    }
    this.setPreSelectedOptions();
  }

  @Output() selectedOptionOutput: EventEmitter<ISearchableSelectData> =
    new EventEmitter<ISearchableSelectData>();

  @Output() filterQueryChange: EventEmitter<string> = new EventEmitter<string>();

  @HostListener("document:click", ["$event"]) clickOutside(e: Event) {
    if (this.dropdownList.nativeElement.contains(e.target as Node) && !this.isMultiSelect) {
      this.closeDropdownAndCommitChanges();
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (
      (this.dropdownList.nativeElement.contains(e.target as Node) ||
        this.input.nativeElement.contains(e.target as Node)) &&
      !this.isInputDisabled
    ) {
      this.openDropwdown();
    } else {
      if (this.isDropdownOpen) {
        this.closeDropdownAndCommitChanges();
      }
      return;
    }
  }

  private all = {
    id: 0,
    value: "Все",
    displayName: "Все",
    count: -1,
  };

  constructor(private screenSizeService: ScreenSizeService) {}

  public readonly ScreenSizeEnum = ScreenSizeEnum;

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  public get selectWidth(): number {
    return this.select?.nativeElement.clientWidth + 2;
  }

  public get dropdownHeight(): number {
    if (this.isLoading) {
      return 184;
    }
    if (!this.isSelectOptionsVisible.value) {
      return 130;
    } else if (this.isDropdownOpen && this.dropdownOptions?.length) {
      const viewportHeight = this.dropdownOptions.length * 46 + 2;
      return viewportHeight < 184 ? viewportHeight : 184;
    } else if (this.isDropdownOpen && !this.dropdownOptions?.length) {
      return 130;
    }
    return 0;
  }

  private setDefaultValue() {
    if (this.defaultValue) {
      if (this.defaultValue === SelectAllData) {
        this.selectedOptions = this.dropdownOptions?.filter((option) => option.displayName === this.defaultValue) || [];
        this.toggleCheckedState(this.selectedOptions[0]);
      } else {
        this.selectedOptions = this.dropdownOptions?.filter((option) => option.displayName === this.defaultValue) || [];
        if (this.selectedOptions) {
          this.selectedOptionsForDisplay = this.selectedOptions[0].displayName;
          this.selectedOptionOutput.emit(this.selectedOptions[0]);
          this.onChange(this.selectedOptions);
        }
        this.placeholder = this.placeholderCopy;
      }
    }
  }

  public showTooltip(label: HTMLSpanElement | HTMLParagraphElement): boolean {
    return label.clientWidth < label.scrollWidth;
  }

  // input filter functions
  public filterOptions(): void {
    if (this.isInn) {
      this.filterQueryChange.emit(this.filterQuery);
    }
    const filteredOptions = this.optionsBackup?.filter((option) =>
      option.displayName.toLowerCase().includes(this.filterQuery.toLowerCase())
    );
    this.dropdownOptions = filteredOptions ? filteredOptions : null;
  }

  // checked state functions
  public isOptionChecked(option: ISearchableSelectData): boolean {
    return this.selectedOptions ? !!this.selectedOptions.find((selected) => selected.id === option.id) : false;
  }

  public toggleCheckedState(option: ISearchableSelectData) {
    this.isTouched = true;
    if (this.isMultiSelect) {
      if (!this.isOptionChecked(option)) {
        this.selectedOptions.push(option);
        this.filterQuery = "";
        this.options = this.optionsBackup;
      } else {
        const index = this.selectedOptions.indexOf(option);
        this.selectedOptions.splice(index, 1);
      }
    } else {
      this.selectedOptions = [];
      this.selectedOptions.push(option);
      this.selectedOptionOutput.emit(option);
      const [selectedOption] = this.selectedOptions;
      selectedOption.value !== SelectAllData && !this.hasDefaultValue && this.defaultValue
        ? (this.placeholder = "")
        : (this.placeholder = this.placeholderCopy);

      this.closeDropdownAndCommitChanges();
    }

    this.selectedOptionsForDisplay = this.convertSelectedOptionsToStringArray(this.selectedOptions);
  }

  // dropdown state functions
  private openDropwdown(): void {
    this.isDropdownOpen = true;
  }

  private closeDropdownAndCommitChanges(): void {
    if (this.virtualScrollViewport) {
      this.virtualScrollViewport.scrollToIndex(0);
    }
    this.onTouch();
    this.isDropdownOpen = false;
    this.dropdownOptions = this.optionsBackup;
    this.filterQuery = "";
    if (this.isTouched) {
      this.onChange(this.selectedOptions);
      this.isTouched = false;
    }
  }

  // input clear
  public handleInputClear(): void {
    if (!this.isInputDisabled) {
      this.selectedOptions = [];
      this.filterQuery = "";
      this.options = this.optionsBackup;
      this.defaultValue ? this.setDefaultValue() : this.onChange([]);
      this.filterQueryChange.emit("");
      this.selectedOptionsForDisplay = "";
      if (this.hasDefaultValue) {
        this.selectedOptionOutput.next(this.all);
      }
    }
  }

  // NgValueAccessor functions
  onChange: any = (value: ISearchableSelectData[]) => {};

  onTouch: any = () => {};

  writeValue(selectedValues: ISearchableSelectData[] | string | null): void {
    if (this.isMultiSelect) {
      if (selectedValues && selectedValues.length) {
        this.selectedOptionsForDisplay = this.convertSelectedOptionsToStringArray(selectedValues);
      } else {
        this.selectedOptionsForDisplay = "";
      }
    } else {
      this.selectedOptionsForDisplay = selectedValues ? this.convertSelectedOptionsToStringArray(selectedValues) : "";
    }
    if (typeof selectedValues !== "string") {
      this.selectedOptions = selectedValues ? selectedValues : [];
    } else {
      this.selectedOptionsForDisplay = selectedValues;
    }
    this.setPreSelectedOptions();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // helper/utility functions
  private convertSelectedOptionsToStringArray(selectedOptions: ISearchableSelectData[] | string): string {
    if (this.isInn) {
      return this.selectedOptions.map((option) => option.value).join(", ");
    }

    if (typeof selectedOptions === "string") {
      return selectedOptions;
    }
    return selectedOptions.map((option) => option.displayName).join(", ");
  }

  private setPreSelectedOptions(): void {
    if (this.selectedOptions.length > 0 || !this.dropdownOptions?.length) {
      return;
    }
    const preSelectedValues = this.selectedOptionsForDisplay.split(", ");
    if (this.dropdownOptions) {
      const selectedOptions = this.dropdownOptions.filter((option) => preSelectedValues.includes(option.value));
      this.selectedOptions = selectedOptions;
      this.onChange(this.selectedOptions);
    }
  }

  public validateInput(event: KeyboardEvent): void {
    // Check if "e" key is pressed
    if (this.inputTypeNumber && (event.key === "e" || event.key === "E")) {
      event.preventDefault();
    }
  }
}

// TODO:
// arrow controls
// you can try preventing default blur behaviour of input on mobile. to avoid keyboard open/close loops
// loading service for framework and city loads
// tag addition
