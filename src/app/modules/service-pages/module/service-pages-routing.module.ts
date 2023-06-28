import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ServicePagesComponent } from "../service-pages.component";

const routes: Routes = [ {
  path: "",
  component: ServicePagesComponent,
  children: [
    {
      path: "forbidden",
      loadChildren: () => import("../no-access-error/module/no-access-error.module")
        .then((module) => module.NoAccessErrorModule),
    },
    {
      path: "not-found",
      loadChildren: () => import("../not-found-page/module/not-found-page.module")
        .then((module) => module.NotFoundPageModule),
    }
  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicePagesRoutingModule {
}
