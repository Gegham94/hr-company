import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth.component";

const routes: Routes = [
  {
    path: "",
    component: AuthComponent,
    children: [
      {
        path: "signIn",
        loadChildren: () => import("./signin/signin.module")
          .then((module) => module.SignInModule),
      },
      {
        path: "signUp",
        loadChildren: () => import("./signup/signup.module")
          .then((module) => module.SignUpModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
