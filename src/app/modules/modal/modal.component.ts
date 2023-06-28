import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef } from "@angular/core";
import { takeUntil } from "rxjs";
import { HrModalService } from "./hr-modal.service";
import {Unsubscribe} from "../../shared/unsubscriber/unsubscribe";
import {Modal} from "./modal.interface";
import {ButtonTypeEnum} from "../../shared/enum/button-type.enum";

@Component({
  selector: "hr-modal-new",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent extends Unsubscribe implements OnInit {
  public modalList: Modal[] = [];
  public buttonTypesList = ButtonTypeEnum;

  constructor(private _modalservice: HrModalService, private _cdr: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    this._modalservice.openModals$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.modalList = res;
      if (this.modalList.length) {
        this.setOverflowHidden();
      } else {
        this.setOverflowAuto();
      }
      this._cdr.markForCheck();
    });
  }

  public closeModal(modal: Modal | null) {
    if (!modal) {
      const last = this.modalList[0];
      last.onCancel && last.onCancel();
    } else {
      modal.onCancel && modal.onCancel();
    }
  }

 public getDataAsTemplate(data: string | TemplateRef<any>): TemplateRef<any> | null {
   if (!(typeof data === "string")) {
      return data as TemplateRef<any>;
    }
    return null;
  }

  public getDataAsString(data: string | TemplateRef<any>): string | null {
    if (typeof data === "string") {
      return data as string;
    }
    return null;
  }

  private setOverflowHidden():  void {
    document.documentElement.classList.add("modal-open");
  }

  private setOverflowAuto():  void {
    document.documentElement.classList.remove("modal-open");
  }
}
