import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AccountGuard} from "../../helpers/account.guard";
import {AppComponent} from "./app.component";
import {AuthGuard} from "../../helpers/auth.guard";

const routes: Routes = [{
  path: "",
  component: AppComponent,
  children: [
    {
      path: "",
      pathMatch: "full",
      canActivate: [AuthGuard]
    },
    {
      path: "",
      loadChildren: () => import("../service-pages/service-pages.module")
        .then((module) => module.ServicePagesModule),
    },
    {
      path: "",
      loadChildren: () => import("../auth/auth.module")
        .then((module) => module.AuthModule)
    },
    {
      path: "",
      loadChildren: () => import("../home/home.module")
        .then((module) => module.HomeModule),
      canActivateChild: [AccountGuard],
    },
    {path: "**",  redirectTo: "/not-found"}
  ]
}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" }),
    RouterModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
