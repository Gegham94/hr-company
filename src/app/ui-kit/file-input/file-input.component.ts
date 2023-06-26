import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from "@angular/core";
import {
  base64ToFile,
  Dimensions,
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
  LoadedImage,
} from "ngx-image-cropper";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { BehaviorSubject, filter, takeUntil } from "rxjs";
import { ButtonTypeEnum } from "../../modules/app/constants/button-type.enum";
import { ToastsService } from "../../modules/app/services/toasts.service";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { ScreenSizeService } from "src/app/modules/app/services/screen-size.service";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { InputStatusEnum } from "../../modules/app/constants/input-status.enum";

export interface ImageProps {
  width: string;
  height: string;
}

@Component({
  selector: "hr-file-input",
  templateUrl: "./file-input.component.html",
  styleUrls: ["./file-input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileInputComponent,
    },
  ],
})
export class FileInputComponent extends Unsubscribe implements ControlValueAccessor, OnDestroy, OnInit {
  @Input() logo!: string;
  @Input("feedback-text") feedbackTextProps: string = "";
  @Input("error-status") errorStatus: InputStatusEnum = InputStatusEnum.default;

  public buttonTypesList = ButtonTypeEnum;
  public imageChangedEventBackup!: Event;
  public imageChangedEvent!: Event;
  public croppedImage: string = "";
  public croppedTemporaryImage: string = "";
  public isModalOpen: boolean = false;
  public logoName: string = "";
  public canvasRotation: number = 0;
  public rotation: number = 0;
  public scale: number = 1;
  public containWithinAspectRatio: boolean = false;
  public transform: ImageTransform = {};
  public originalFile!: File;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public imageProps: ImageProps = {
    width: "",
    height: "",
  };
  public isCropperLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private fileValidated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Output() imageInput: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("fileInput") fileInput!: ElementRef;
  @ViewChild("imageCropper") cropper!: ImageCropperComponent;
  @ViewChild("cropperActionsWrapper")
  cropperActionsWrapper!: ElementRef<HTMLDivElement>;

  get heightExceptActions(): string | SafeStyle {
    if (this.cropperActionsWrapper) {
      const height = this.sanitizer.bypassSecurityTrustStyle(
        `calc(100% - ${this.cropperActionsWrapper.nativeElement.clientHeight}px)`
      );
      return height;
    }
    return "0";
  }

  get isScaleDownDisabled(): boolean {
    return this.scale === 0.1;
  }

  constructor(
    private readonly screenSizeService: ScreenSizeService,
    private readonly _toastService: ToastsService,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.fileValidated$.pipe(filter(Boolean), takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res) {
        this.resetImage();
        this.imageChangedEvent = this.imageChangedEventBackup;
        this.modalToggle(true);
        this.isCropperLoading$.next(true);
      }
    });
  }

  public ngOnChanges(): void {
    if (this.logo) {
      this.isLoading$.next(true);
      this.croppedImage = this.logo;
    }
    this.screenSizeService.screenSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.cdr.detectChanges());
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public isLoading() {
    this.isLoading$.next(false);
  }

  public fileChangeEvent(event: Event): void {
    // this.resetImage();
    const target = event.target as HTMLInputElement;
    this.originalFile = (target.files as FileList)[0];
    this.imageChangedEventBackup = event;
    this.checkForValidImage(this.originalFile);

    if (target) {
      this.logoName = Date.now().toString() + this.originalFile.name;
    }
  }

  private checkForValidImage(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result as string;

      image.onload = () => {
        if (image.width < 180 && image.height < 180) {
          this._toastService.addToast({
            title: "Пожалуйста, выберите фотографию шириной не менее 180 пикселей!",
          });
          (this.fileInput.nativeElement as HTMLInputElement).value = "";
          this.fileValidated$.next(false);
        } else if (image.width > 2560 && image.height > 1440) {
          this._toastService.addToast({
            title: "Пожалуйста, выберите фотографию разрешением не более 2К(2560x1440px)!",
          });
          (this.fileInput.nativeElement as HTMLInputElement).value = "";
          this.fileValidated$.next(false);
        } else {
          this.fileValidated$.next(true);
        }
      };
    };
  }

  public imageCropped(event: ImageCroppedEvent): void {
    this.croppedTemporaryImage = event.base64 ?? "";
    if (event.base64 && this.originalFile) {
      const file = new File([base64ToFile(event.base64)], Date.now().toString() + this.originalFile?.name, {
        lastModified: this.originalFile?.lastModified,
        type: this.originalFile?.type,
      });
      if (file) {
        this.onChange(file);
        this.onTouch(file);
      }
    }
    this.imageProps.width = event?.width + "px" ?? "";
    this.imageProps.height = event?.height + "px" ?? "";
    this.fileInput.nativeElement.value = "";
  }

  public cropperReady(dimensions: Dimensions): void {
    this.isCropperLoading$.next(false);
  }

  public imageLoaded(image: LoadedImage): void {
    this.isCropperLoading$.next(false);
  }

  public loadImageFailed() {
    this.isModalOpen = false;
    this._toastService.addToast({
      title: "Не удалось загрузить ваши фотографии!",
    });
  }

  public rotateLeft(): void {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  public rotateRight(): void {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  public flipHorizontal(): void {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  public flipVertical(): void {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  public resetImage(): void {
    this.croppedImage = "";
    this.croppedTemporaryImage = "";
    this.canvasRotation = 0;
    this.scale = 1;
    this.containWithinAspectRatio = false;
    this.transform = {};
  }

  public zoomOut(): void {
    this.scale = Number((this.scale - 0.1).toFixed(1));
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  public zoomIn(): void {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  public toggleContainWithinAspectRatio(): void {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  public updateRotation(): void {
    this.transform = {
      ...this.transform,
      rotate: this.rotation,
    };
  }

  public modalToggle(val?: boolean): void {
    this.isModalOpen = val !== undefined ? val : !this.isModalOpen;
  }

  public submitCroppedImage(): void {
    this.croppedImage = this.croppedTemporaryImage;
    this.imageInput.emit(this.croppedImage ? this.croppedImage : "");
    this.isModalOpen = false;
  }

  public onChange: (val: File) => void = () => {};

  public onTouch: (val: File) => void = () => {};

  public registerOnChange(fn: (val: File) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (val: File) => void): void {
    this.onTouch = fn;
  }

  public writeValue(value: string): void {}
}
