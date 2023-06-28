import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { UiKitViewComponent } from "../../ui-kit-view/ui-kit-view.component";
import { VacancyInfoComponent  } from "../analytic/vacancy-info/vacancy-info.component";
import { AccountGuard } from "src/app/shared/guards/account.guard";

const routes: Routes = [
  {
    path: "",
    component: HomeLayoutComponent,
    children: [
      {
        path: "balance",
        loadChildren: () => import("../balance/modules/balance.module").then(m => m.BalanceModule)
      },
      {
        path: "vacancy",
        children: [
          {
            path: "create-filter",
            loadChildren: () =>
              import("../vacancy/components/create-vacancy-filter/module/create-vacancy-filter.module")
                .then(m => m.CreateVacancyFilterModule)
          },
          {
            path: "create-information",
            loadChildren: () =>
              import("../vacancy/components/create-vacancy-information/module/create-vacancy-information.module")
                .then(m => m.CreateVacancyInformationModule)
          }
        ]
      },
      {
        path: "company",
        loadChildren: () => import("../company/modules/company.module").then(m => m.CompanyModule),
      },
      {
        path: "vacancies",
        loadChildren: () => import("../vacancy/components/my-vacancy/module/my-vacancy.module").then(m => m.MyVacancyModule)
      },
      {
        path: "analytic",
        loadChildren: () => import("../analytic/module/analytic.module").then(m => m.AnalyticModule)
      },
      {
        path: "specialists",
        loadChildren: () => import("../specialists/modules/specialists.module").then(m => m.SpecialistsModule),
      },
      {
        path: "ui-kit",
        component: UiKitViewComponent
      },
      {
        path: "vacancy-info",
        component: VacancyInfoComponent
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
