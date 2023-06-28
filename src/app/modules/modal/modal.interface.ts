import { TemplateRef } from "@angular/core";
import {HrModalService} from "./hr-modal.service";

export interface IModal {
  title: string | TemplateRef<any> | null;
  content: string | TemplateRef<any> | null;
  onOk?: (() => void) | null;
  onCancel?: (() => void) | null;
}

export class Modal implements IModal {
  title: string | TemplateRef<any> | null;
  content: string | TemplateRef<any> | null;
  hasCustomCloseMethod: boolean = false;
  onOk?: (() => void) | null;
  onCancel?: (() => void) | null;

  constructor(title: string | TemplateRef<any> | null, content: string | TemplateRef<any> | null ) {
    this.content = content;
    this.title = title;
  }

  setOnOkMethod(onOk: () => void, callContext: HrModalService): this {
    this.onOk = onOk.bind(callContext);
    return this;
  }

  setOnCancelMethod(onCancelMethod: () => void, callContext: any): this {
    this.onCancel = onCancelMethod.bind(callContext);
    return this;
  }
}
