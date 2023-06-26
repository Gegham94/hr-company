import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { UiKitViewComponent } from "../../ui-kit-view/ui-kit-view.component";
import {SpecialistAnalyticComponent} from "../analytic/specialist-analytic/specialist-analytic.component";
import { AccountGuard } from "src/app/helpers/account.guard";

const routes: Routes = [
  {
    path: "",
    component: HomeLayoutComponent,
    children: [
      {
        path: "balance",
        loadChildren: () => import("../balance/balance.module").then(m => m.BalanceModule)
      },
      {
        path: "vacancy",
        children: [
          {
            path: "create-filter",
            loadChildren: () =>
              import("../vacancy/components/create-vacancy-filter/create-vacancy-filter.module")
                .then(m => m.CreateVacancyFilterModule)
          },
          {
            path: "create-information",
            loadChildren: () =>
              import("../vacancy/components/create-vacancy-information/create-vacancy-information.module")
                .then(m => m.CreateVacancyInformationModule)
          }
        ]
      },
      {
        path: "company",
        loadChildren: () => import("../company/company.module").then(m => m.CompanyModule),
      },
      {
        path: "vacancies",
        loadChildren: () => import("../vacancy/components/my-vacancy/my-vacancy.module").then(m => m.MyVacancyModule)
      },
      {
        path: "analytic",
        loadChildren: () => import("../analytic/analytic.module").then(m => m.AnalyticModule)
      },
      {
        path: "specialists",
        loadChildren: () => import("../specialists/specialists.module").then(m => m.SpecialistsModule),
      },
      {
        path: "ui-kit",
        component: UiKitViewComponent
      },
      {
        path: "vacancy-info",
        component: SpecialistAnalyticComponent
      }
    ],
    canActivateChild: [AccountGuard]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class HomeRoutingModule {}
