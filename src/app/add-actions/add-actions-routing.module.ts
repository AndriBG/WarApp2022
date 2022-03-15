import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddActionsPage } from './add-actions.page';

const routes: Routes = [
  {
    path: '',
    component: AddActionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddActionsPageRoutingModule {}
