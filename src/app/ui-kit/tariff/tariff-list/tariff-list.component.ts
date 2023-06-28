import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IBalanceTariff } from "src/app/shared/interfaces/balance-tariff.interface";
import { IBalance } from "src/app/shared/interfaces/balance.interface";


@Component({
  selector: "hr-tariff-list",
  templateUrl: "./tariff-list.component.html",
  styleUrls: ["./tariff-list.component.scss"]
})
export class TariffListComponent implements OnInit {

  @Input("balanceTariff") balance!: IBalanceTariff;
  @Input("listCardInfo") listCardInfo!: [];
  public listCardInfoList: [] = [];
  public interval: number = 4;
  public isShowMore: boolean = true;
  @Output() buyTariffEmitter = new EventEmitter<IBalance>();

  constructor() {
  }

  ngOnInit(): void {
    this.listCardInfo.forEach((el, index) => {
      if (index < this.interval) {
        this.listCardInfoList.push(el);
      }
    });
  }

  public buyTariff(uuid: string, isActive: boolean) {
    this.buyTariffEmitter.emit({uuid, isActive});
  }

  public moreInformation(): void {
    this.listCardInfo.forEach((el, index) => {
      if (index >= this.interval && index <= this.listCardInfo.length) {
        this.listCardInfoList.push(el);
      }
    });
    this.isShowMore = !this.isShowMore;
  }

  public hideMoreInformation(): void {
    this.listCardInfoList.splice(this.listCardInfoList.length - this.interval - 2);
    this.isShowMore = !this.isShowMore;
  }

}
