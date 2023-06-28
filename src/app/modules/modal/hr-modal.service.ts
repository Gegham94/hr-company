import {Injectable, TemplateRef} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Modal} from "./modal.interface";

@Injectable({
  providedIn: "root",
})
export class HrModalService {
  private openModals: Modal[] = [];
  public openModals$: BehaviorSubject<Modal[]> = new BehaviorSubject<Modal[]>([]);

  constructor() {
  }

  public createModal(
    title: string | TemplateRef<any> | null,
    content: string | TemplateRef<any> | null,
    onOk: (() => void) | null,
    onCancel: (() => void) | null): void {

    const newModal = new Modal(title, content);
    if (onOk) {
      newModal.setOnOkMethod(onOk, this);
    }
    if (onCancel) {
      newModal.hasCustomCloseMethod = true;
      newModal.setOnCancelMethod(onCancel, this);
    } else {
      newModal.setOnCancelMethod(this.closeSingleModal, this);
    }
    this.openModals.push(newModal);
    this.openModals$.next(this.openModals);
  }


  public closeSingleModal(): void {
    this.openModals.pop();
    this.openModals$.next(this.openModals);
  }

  public closeAll(): void {
    this.openModals = [];
    this.openModals$.next(this.openModals);
  }
}
