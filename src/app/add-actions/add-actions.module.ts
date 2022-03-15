import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddActionsPageRoutingModule } from './add-actions-routing.module';

import { AddActionsPage } from './add-actions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddActionsPageRoutingModule
  ],
  declarations: [AddActionsPage]
})
export class AddActionsPageModule {}
